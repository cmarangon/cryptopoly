<?php

namespace App\DataFixtures;

use App\Entity\Cryptocurrency;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CryptocurrencyFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $cryptocurrencies = [
            [
                'name' => 'BitCoin',
                'symbol' => '₿',
                'basePrice' => 45.50,
                'color' => '#f7931a',
            ],
            [
                'name' => 'EthCoin',
                'symbol' => 'Ξ',
                'basePrice' => 32.25,
                'color' => '#627eea',
            ],
            [
                'name' => 'DogeCoin',
                'symbol' => 'Ð',
                'basePrice' => 8.75,
                'color' => '#c2a633',
            ],
            [
                'name' => 'TetherCoin',
                'symbol' => '₮',
                'basePrice' => 15.90,
                'color' => '#00d4aa',
            ],
            [
                'name' => 'BinanceCoin',
                'symbol' => '◇',
                'basePrice' => 28.40,
                'color' => '#f0b90b',
            ],
            [
                'name' => 'CardanoCoin',
                'symbol' => '◆',
                'basePrice' => 12.15,
                'color' => '#1652f0',
            ],
        ];

        foreach ($cryptocurrencies as $cryptoData) {
            $crypto = new Cryptocurrency();
            $crypto->setName($cryptoData['name']);
            $crypto->setSymbol($cryptoData['symbol']);
            $crypto->setBasePrice($cryptoData['basePrice']);
            $crypto->setCurrentPrice($cryptoData['basePrice']); // Start at base price
            $crypto->setColor($cryptoData['color']);

            $manager->persist($crypto);
        }

        $manager->flush();
    }
}
