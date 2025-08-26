<?php

namespace App\Service;

use App\Entity\Cryptocurrency;
use App\Entity\CryptocurrencyPriceHistory;
use App\Entity\Game;
use Doctrine\ORM\EntityManagerInterface;

class CryptocurrencyService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function getInitialCryptoPrices(): array
    {
        return [
            'bitcoin' => ['price' => 45.50, 'basePrice' => 45.50, 'symbol' => '₿', 'name' => 'BitCoin'],
            'ethereum' => ['price' => 32.25, 'basePrice' => 32.25, 'symbol' => 'Ξ', 'name' => 'EthCoin'],
            'dogecoin' => ['price' => 8.75, 'basePrice' => 8.75, 'symbol' => 'Ð', 'name' => 'DogeCoin'],
            'tether' => ['price' => 15.90, 'basePrice' => 15.90, 'symbol' => '₮', 'name' => 'TetherCoin'],
            'binance' => ['price' => 28.40, 'basePrice' => 28.40, 'symbol' => '◇', 'name' => 'BinanceCoin'],
            'cardano' => ['price' => 12.15, 'basePrice' => 12.15, 'symbol' => '◆', 'name' => 'CardanoCoin'],
        ];
    }

    public function fluctuatePrices(Game $game): void
    {
        $gameData = $game->getGameData();
        $cryptos = $gameData['cryptocurrencies'] ?? $this->getInitialCryptoPrices();
        $currentTurn = $gameData['currentTurn'] ?? 1;

        foreach ($cryptos as $cryptoName => $cryptoData) {
            // Generate price fluctuation between -15% to +15%
            $fluctuationPercent = (mt_rand(-15, 15) / 100);
            $newPrice = $cryptoData['price'] * (1 + $fluctuationPercent);

            // Ensure price doesn't go below 10% of base price or above 300% of base price
            $minPrice = $cryptoData['basePrice'] * 0.1;
            $maxPrice = $cryptoData['basePrice'] * 3.0;

            $newPrice = max($minPrice, min($maxPrice, $newPrice));

            $cryptos[$cryptoName]['price'] = round($newPrice, 2);

            // Store price history
            $this->recordPriceHistory($game, $cryptoName, $newPrice, $currentTurn);
        }

        $gameData['cryptocurrencies'] = $cryptos;
        $game->setGameData($gameData);

        // Update player portfolios based on new prices
        foreach ($game->getPlayers() as $player) {
            $this->updatePlayerPortfolioValues($player, $cryptos);
        }
    }

    public function tradeCrypto(Game $game, $playerId, string $fromCrypto, string $toCrypto, float $amount): bool
    {
        $gameData = $game->getGameData();
        $cryptos = $gameData['cryptocurrencies'] ?? [];

        if (!isset($cryptos[$fromCrypto]) || !isset($cryptos[$toCrypto])) {
            return false;
        }

        $player = null;
        foreach ($game->getPlayers() as $p) {
            if ($p->getId() === $playerId) {
                $player = $p;
                break;
            }
        }

        if (!$player) {
            return false;
        }

        $portfolio = $player->getCryptoPortfolio();

        // Check if player has enough of the source crypto
        $currentAmount = $portfolio[$fromCrypto] ?? 0;
        if ($currentAmount < $amount) {
            return false;
        }

        // Calculate exchange rate
        $fromPrice = $cryptos[$fromCrypto]['price'];
        $toPrice = $cryptos[$toCrypto]['price'];
        $exchangeAmount = ($amount * $fromPrice) / $toPrice;

        // Apply 2% trading fee
        $exchangeAmount *= 0.98;

        // Update portfolio
        $portfolio[$fromCrypto] = ($portfolio[$fromCrypto] ?? 0) - $amount;
        $portfolio[$toCrypto] = ($portfolio[$toCrypto] ?? 0) + $exchangeAmount;

        // Remove zero balances
        $portfolio = array_filter($portfolio, fn($value) => $value > 0.01);

        $player->setCryptoPortfolio($portfolio);
        $this->entityManager->flush();

        return true;
    }

    public function getCurrentPrices(Game $game): array
    {
        $gameData = $game->getGameData();
        return $gameData['cryptocurrencies'] ?? $this->getInitialCryptoPrices();
    }

    private function updatePlayerPortfolioValues($player, array $cryptos): void
    {
        $portfolio = $player->getCryptoPortfolio();
        $updatedPortfolio = [];

        foreach ($portfolio as $cryptoName => $amount) {
            if (isset($cryptos[$cryptoName]) && $amount > 0) {
                $updatedPortfolio[$cryptoName] = $amount;
            }
        }

        $player->setCryptoPortfolio($updatedPortfolio);
    }

    public function getPortfolioValue(array $portfolio, array $cryptoPrices): float
    {
        $totalValue = 0;

        foreach ($portfolio as $cryptoName => $amount) {
            if (isset($cryptoPrices[$cryptoName])) {
                $totalValue += $amount * $cryptoPrices[$cryptoName]['price'];
            }
        }

        return $totalValue;
    }

    private function recordPriceHistory(Game $game, string $cryptoName, float $price, int $turnNumber): void
    {
        // Map crypto key to actual entity name
        $entityName = $this->getCryptoEntityName($cryptoName);
        if (!$entityName) {
            return;
        }

        // Find the cryptocurrency entity
        $cryptocurrency = $this->entityManager->getRepository(Cryptocurrency::class)
            ->findOneBy(['name' => $entityName]);

        if (!$cryptocurrency) {
            return;
        }

        $priceHistory = new CryptocurrencyPriceHistory();
        $priceHistory->setCryptocurrency($cryptocurrency);
        $priceHistory->setPrice((string) $price);
        $priceHistory->setRecordedAt(new \DateTime());
        $priceHistory->setGame($game);
        $priceHistory->setTurnNumber($turnNumber);

        $this->entityManager->persist($priceHistory);
        $this->entityManager->flush();
    }

    public function getPriceHistory(Game $game, int $limit = 20): array
    {
        $priceHistoryRepo = $this->entityManager->getRepository(CryptocurrencyPriceHistory::class);
        
        $qb = $priceHistoryRepo->createQueryBuilder('ph')
            ->select('ph, c')
            ->join('ph.cryptocurrency', 'c')
            ->where('ph.game = :game')
            ->setParameter('game', $game)
            ->orderBy('ph.turnNumber', 'ASC')
            ->setMaxResults($limit);

        $priceHistoryData = $qb->getQuery()->getResult();

        $chartData = [];
        foreach ($priceHistoryData as $historyEntry) {
            $cryptoName = $this->getCryptoKey($historyEntry->getCryptocurrency()->getName());
            if (!$cryptoName) {
                continue;
            }

            if (!isset($chartData[$cryptoName])) {
                $chartData[$cryptoName] = [
                    'name' => $historyEntry->getCryptocurrency()->getName(),
                    'symbol' => $this->getCryptoSymbol($cryptoName),
                    'data' => []
                ];
            }

            $chartData[$cryptoName]['data'][] = [
                'turn' => $historyEntry->getTurnNumber(),
                'price' => (float) $historyEntry->getPrice(),
                'timestamp' => $historyEntry->getRecordedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $chartData;
    }

    private function getCryptoKey(string $name): ?string
    {
        $mapping = [
            'BitCoin' => 'bitcoin',
            'EthCoin' => 'ethereum', 
            'DogeCoin' => 'dogecoin',
            'TetherCoin' => 'tether',
            'BinanceCoin' => 'binance',
            'CardanoCoin' => 'cardano'
        ];

        return $mapping[$name] ?? null;
    }

    private function getCryptoSymbol(string $cryptoName): string
    {
        $initialPrices = $this->getInitialCryptoPrices();
        return $initialPrices[$cryptoName]['symbol'] ?? '';
    }

    private function getCryptoEntityName(string $cryptoKey): ?string
    {
        $mapping = [
            'bitcoin' => 'BitCoin',
            'ethereum' => 'EthCoin', 
            'dogecoin' => 'DogeCoin',
            'tether' => 'TetherCoin',
            'binance' => 'BinanceCoin',
            'cardano' => 'CardanoCoin'
        ];

        return $mapping[$cryptoKey] ?? null;
    }
}
