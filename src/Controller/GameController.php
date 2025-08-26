<?php

namespace App\Controller;

use App\Repository\GameRepository;
use App\Service\BoardConfiguration;
use App\Service\CryptocurrencyService;
use App\Service\GameService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class GameController extends AbstractController
{
    #[Route('/new-game', name: 'app_new_game')]
    public function newGame(): Response
    {
        return $this->render('game/index.html.twig', [
            'controller_name' => 'GameController',
        ]);
    }


    #[Route('/api/game/create', name: 'api_game_create', methods: ['POST'])]
    public function createGame(Request $request, GameService $gameService): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['character'], $data['cryptoAllocations'], $data['remainingCash'])) {
            return $this->json(['error' => 'Invalid game data'], 400);
        }

        try {
            $game = $gameService->createGame($data);

            return $this->json([
                'success' => true,
                'gameId' => $game->getId(),
                'redirectUrl' => $this->generateUrl('app_game_play', ['id' => $game->getId()]),
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to create game: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/game/{id}', name: 'app_game_play')]
    public function playGame(int $id, GameRepository $gameRepository, BoardConfiguration $boardConfig): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            throw $this->createNotFoundException('Game not found');
        }

        return $this->render('game/play.html.twig', [
            'game' => $game,
            'currentPlayer' => $game->getCurrentPlayer(),
            'boardSpaces' => $boardConfig->getAllSpaces(),
        ]);
    }

    #[Route('/game/{id}/trade', name: 'app_game_trade')]
    public function tradePage(int $id, GameRepository $gameRepository, CryptocurrencyService $cryptoService): Response
    {
        $game = $gameRepository->find($id);

        if (!$game) {
            throw $this->createNotFoundException('Game not found');
        }

        $currentPlayer = $game->getCurrentPlayer();
        $cryptoPrices = $cryptoService->getCurrentPrices($game);

        return $this->render('game/trade.html.twig', [
            'game' => $game,
            'currentPlayer' => $currentPlayer,
            'cryptoPrices' => $cryptoPrices,
        ]);
    }

    #[Route('/api/game/{id}/roll-dice', name: 'api_game_roll_dice', methods: ['POST'])]
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
            $moveResult = $gameService->movePlayer($currentPlayer, $diceResult['total']);

            return $this->json([
                'success' => true,
                'dice' => $diceResult,
                'move' => $moveResult,
                'player' => [
                    'position' => $currentPlayer->getPosition(),
                    'cash' => $currentPlayer->getCash(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to roll dice: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/api/game/{id}/end-turn', name: 'api_game_end_turn', methods: ['POST'])]
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

    #[Route('/api/game/{id}/trade-crypto', name: 'api_game_trade_crypto', methods: ['POST'])]
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

    #[Route('/api/game/{id}/price-history', name: 'api_game_price_history', methods: ['GET'])]
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
}
