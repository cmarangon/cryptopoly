<?php

namespace App\Controller;

use App\DTO\PlayerSetupData;
use App\Repository\GameRepository;
use App\Service\CryptocurrencyService;
use App\Service\GameService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/game')]
final class GameApiController extends AbstractController
{
    #[Route('/create', name: 'api_game_create', methods: ['POST'])]
    public function createGame(Request $request, GameService $gameService): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON data'], 400);
        }

        try {
            $game = $gameService->createGame(PlayerSetupData::fromArray($data));

            return $this->json([
                'success' => true,
                'gameId' => $game->getId(),
                'redirectUrl' => $this->generateUrl('app_game_play', ['id' => $game->getId()]),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to create game: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/roll-dice', name: 'api_game_roll_dice', methods: ['POST'])]
    public function rollDice(int $id, GameService $gameService, GameRepository $gameRepository): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Game not found'], 404);
        }

        $currentPlayer = $game->getCurrentPlayer();
        if (!$currentPlayer) {
            return $this->json(['error' => 'No current player'], 400);
        }

        try {
            $diceResult = $gameService->rollDice();
            $moveResult = $gameService->movePlayer($game, $currentPlayer, $diceResult['total']);

            return $this->json([
                'success' => true,
                'dice' => $diceResult,
                'move' => $moveResult->toArray(),
                'player' => [
                    'position' => $currentPlayer->getPosition(),
                    'cash' => $currentPlayer->getCash(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to roll dice: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/end-turn', name: 'api_game_end_turn', methods: ['POST'])]
    public function endTurn(int $id, GameService $gameService, GameRepository $gameRepository): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Game not found'], 404);
        }

        try {
            $gameService->endTurn($game);

            return $this->json([
                'success' => true,
                'currentTurn' => $game->getCurrentTurn(),
                'currentPlayerIndex' => $game->getCurrentPlayerIndex(),
                'cryptoPrices' => $gameService->getCurrentCryptoPrices($game),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to end turn: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/trade-crypto', name: 'api_game_trade_crypto', methods: ['POST'])]
    public function tradeCrypto(int $id, Request $request, CryptocurrencyService $cryptoService, GameRepository $gameRepository): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Game not found'], 404);
        }

        $currentPlayer = $game->getCurrentPlayer();
        if (!$currentPlayer) {
            return $this->json(['error' => 'No current player'], 400);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['fromCrypto'], $data['toCrypto'], $data['amount'])) {
            return $this->json(['error' => 'Invalid trade data'], 400);
        }

        try {
            $success = $cryptoService->tradeCrypto(
                $game,
                $currentPlayer->getId(),
                $data['fromCrypto'],
                $data['toCrypto'],
                (float) $data['amount']
            );

            if ($success) {
                return $this->json([
                    'success' => true,
                    'newPortfolio' => $currentPlayer->getCryptoPortfolio(),
                    'message' => 'Trade executed successfully',
                ]);
            } else {
                return $this->json(['error' => 'Trade failed - insufficient funds or invalid trade'], 400);
            }
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to execute trade: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/price-history', name: 'api_game_price_history', methods: ['GET'])]
    public function getPriceHistory(int $id, CryptocurrencyService $cryptoService, GameRepository $gameRepository): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Game not found'], 404);
        }

        try {
            $priceHistory = $cryptoService->getPriceHistory($game);

            return $this->json([
                'success' => true,
                'priceHistory' => $priceHistory,
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to get price history: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/trade', name: 'api_game_trade_data', methods: ['GET'])]
    public function getTradeData(int $id, GameRepository $gameRepository, CryptocurrencyService $cryptoService): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            return $this->json(['error' => 'Game not found'], 404);
        }

        $currentPlayer = $game->getCurrentPlayer();
        if (!$currentPlayer) {
            return $this->json(['error' => 'No current player'], 400);
        }

        try {
            $cryptoPrices = $cryptoService->getCurrentPrices($game);
            $playerPortfolio = $currentPlayer->getCryptoPortfolio();

            // Format data for the trade interface
            $playerCryptos = [];
            $allCryptos = [];

            foreach ($cryptoPrices as $cryptoKey => $cryptoData) {
                $balance = $playerPortfolio[$cryptoKey] ?? 0.0;
                
                $cryptoInfo = [
                    'key' => $cryptoKey,
                    'name' => $cryptoData['name'],
                    'symbol' => $cryptoData['symbol'],
                    'color' => $this->getCryptoColor($cryptoKey),
                    'price' => $cryptoData['price'],
                    'balance' => $balance,
                ];

                $playerCryptos[] = $cryptoInfo;
                $allCryptos[] = $cryptoInfo;
            }

            return $this->json([
                'success' => true,
                'playerCryptos' => $playerCryptos,
                'allCryptos' => $allCryptos,
                'currentCash' => $currentPlayer->getCash(),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to get trade data: ' . $e->getMessage()], 500);
        }
    }

    private function getCryptoColor(string $cryptoKey): string
    {
        return match ($cryptoKey) {
            'bitcoin' => '#f7931a',
            'ethereum' => '#627eea',
            'dogecoin' => '#c2a633',
            'tether' => '#00d4aa',
            'binance' => '#f0b90b',
            'cardano' => '#1652f0',
            default => '#1652f0',
        };
    }
}