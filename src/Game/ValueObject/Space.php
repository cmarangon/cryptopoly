<?php

declare(strict_types=1);

namespace App\Game\ValueObject;

use App\Game\Enum\SpaceType;

readonly class Space
{
    public function __construct(
        public int $position,
        public string $name,
        public SpaceType $type,
        public ?int $price = null,
        public ?int $rent = null,
        public ?int $taxAmount = null,
        public ?string $color = null,
        public ?int $houseCost = null,
        public ?int $hotelCost = null,
    ) {}

    public function toArray(): array
    {
        $data = [
            'position' => $this->position,
            'name' => $this->name,
            'type' => $this->type->value,
        ];

        if ($this->price !== null) {
            $data['price'] = $this->price;
        }

        if ($this->rent !== null) {
            $data['rent'] = $this->rent;
        }

        if ($this->taxAmount !== null) {
            $data['amount'] = $this->taxAmount;
        }

        if ($this->color !== null) {
            $data['color'] = $this->color;
        }

        if ($this->houseCost !== null) {
            $data['houseCost'] = $this->houseCost;
        }

        if ($this->hotelCost !== null) {
            $data['hotelCost'] = $this->hotelCost;
        }

        return $data;
    }

    public function isProperty(): bool
    {
        return $this->type === SpaceType::PROPERTY;
    }

    public function isSpecial(): bool
    {
        return $this->type === SpaceType::SPECIAL;
    }

    public function isTax(): bool
    {
        return $this->type === SpaceType::TAX;
    }

    public function isChance(): bool
    {
        return $this->type === SpaceType::CHANCE;
    }
}
