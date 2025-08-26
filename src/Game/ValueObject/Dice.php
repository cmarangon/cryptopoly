<?php

declare(strict_types=1);

namespace App\Game\ValueObject;

class Dice
{
    private int $sides;

    public function __construct(int $sides = 6)
    {
        if ($sides < 1) {
            throw new \InvalidArgumentException('Dice must have at least 1 side');
        }

        $this->sides = $sides;
    }

    public function getSides(): int
    {
        return $this->sides;
    }

    public function roll(): int
    {
        return mt_rand(1, $this->sides);
    }

    public function rollMultiple(int $count): array
    {
        if ($count < 1) {
            throw new \InvalidArgumentException('Must roll at least 1 die');
        }

        $rolls = [];
        for ($i = 0; $i < $count; $i++) {
            $rolls[] = $this->roll();
        }

        return $rolls;
    }

    public static function d4(): self
    {
        return new self(4);
    }

    public static function d6(): self
    {
        return new self(6);
    }

    public static function d8(): self
    {
        return new self(8);
    }

    public static function d10(): self
    {
        return new self(10);
    }

    public static function d12(): self
    {
        return new self(12);
    }

    public static function d20(): self
    {
        return new self(20);
    }

    public static function d100(): self
    {
        return new self(100);
    }

    public static function rollTwoDice(self $dice1, self $dice2): array
    {
        $roll1 = $dice1->roll();
        $roll2 = $dice2->roll();

        return [
            'dice1' => $roll1,
            'dice2' => $roll2,
            'total' => $roll1 + $roll2,
            'isDouble' => $roll1 === $roll2,
        ];
    }

    public static function rollStandardDice(): array
    {
        $dice1 = self::d6();
        $dice2 = self::d6();

        return self::rollTwoDice($dice1, $dice2);
    }
}
