<?php

namespace App\Controller;

use App\Repository\GameRepository;
use App\Service\BoardConfiguration;
use App\Service\CryptocurrencyService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

}
