<?php

namespace App\Service;

use App\DTO\MoveResult;
use App\DTO\PlayerSetupData;
use App\DTO\PurchaseResult;
use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Dice;
use App\Repository\GameRepository;
use Doctrine\ORM\EntityManagerInterface;

class GameService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private GameRepository $gameRepository,
        private CryptocurrencyService $cryptoService,
        private BoardConfiguration $boardConfiguration,
        private SpaceActionManager $spaceActionManager,
    ) {}

    public function createGame(PlayerSetupData $playerData): Game
    {
        $game = new Game();
        $game->setStatus('active');

        // Create player from setup data
        $player = new Player();
        $player->setName('Player 1'); // For now, single player
        $player->setCharacter($playerData->character);
        $player->setCash($playerData->remainingCash);
        $player->setCryptoPortfolio($playerData->cryptoAllocations);
        $player->setPosition(0); // Start at GO
        $player->setPlayerOrder(0);
        $player->setGame($game);

        $game->addPlayer($player);

        // Initialize game data
        $gameData = [
            'cryptocurrencies' => $this->cryptoService->getInitialCryptoPrices(),
            'properties' => $this->initializeProperties(),
            'turnHistory' => [],
        ];
        $game->setGameData($gameData);

        $this->entityManager->persist($game);
        $this->entityManager->persist($player);
        $this->entityManager->flush();

        return $game;
    }

    public function rollDice(): array
    {
        return Dice::rollStandardDice();
    }

    public function movePlayer(Game $game, Player $player, int $spaces): MoveResult
    {
        $oldPosition = $player->getPosition();
        $newPosition = ($oldPosition + $spaces) % $this->boardConfiguration->getBoardSize();

        // Check if player passed GO
        $passedGo = $newPosition < $oldPosition;
        if ($passedGo) {
            $player->addCash(200); // Collect $200 for passing GO
        }

        $player->setPosition($newPosition);

        // Execute space action
        $space = $this->boardConfiguration->getSpace($newPosition);
        $actionResult = $this->spaceActionManager->executeSpaceAction($game, $player, $space);

        // Handle special case: if player was moved by the space action (e.g., Go to Jail)
        if ($actionResult->playerMoved && $actionResult->newPosition !== null) {
            $newPosition = $actionResult->newPosition;
        }

        // Persist changes to database
        $this->entityManager->flush();

        return new MoveResult(
            oldPosition: $oldPosition,
            newPosition: $newPosition,
            passedGo: $passedGo,
            space: $this->boardConfiguration->getSpace($newPosition),
            action: $actionResult->toArray(),
        );
    }

    public function endTurn(Game $game): void
    {
        // Update cryptocurrency prices
        $this->cryptoService->fluctuatePrices($game);

        // Move to next player
        $game->nextPlayer();

        $this->entityManager->flush();
    }

    public function getSpaceInfo(int $position): array
    {
        return $this->boardConfiguration->getSpaceInfo($position);
    }

    public function getCurrentCryptoPrices(Game $game): array
    {
        return $this->cryptoService->getCurrentPrices($game);
    }

    public function purchaseProperty(Game $game, Player $player, int $position): PurchaseResult
    {
        $space = $this->boardConfiguration->getSpace($position);

        if (!$space->isProperty() && $space->type !== SpaceType::RAILROAD && $space->type !== SpaceType::UTILITY) {
            return PurchaseResult::failure('This space cannot be purchased');
        }

        if ($space->price === null) {
            return PurchaseResult::failure('Property has no price set');
        }

        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];

        if (isset($properties[$position]) && $properties[$position] !== null) {
            return PurchaseResult::failure('Property is already owned');
        }

        if ($player->getCash() < $space->price) {
            return PurchaseResult::failure('Insufficient cash to purchase property');
        }

        // Purchase the property
        $player->subtractCash($space->price);
        $properties[$position] = $player->getId();

        // Update game data
        $gameData['properties'] = $properties;
        $game->setGameData($gameData);

        $this->entityManager->flush();

        return PurchaseResult::success($space->name, $space->price, $player->getCash());
    }

    private function initializeProperties(): array
    {
        $properties = [];
        foreach ($this->boardConfiguration->getProperties() as $space) {
            $properties[$space->position] = null;
        }
        return $properties;
    }
}
