<?php

namespace App\DTO;

class PlayerSetupData
{
    public function __construct(
        public readonly string $character,
        public readonly array $cryptoAllocations,
        public readonly float $remainingCash,
    ) {}

    public static function fromArray(array $data): self
    {
        if (!isset($data['character'], $data['cryptoAllocations'], $data['remainingCash'])) {
            throw new \InvalidArgumentException('Missing required fields: character, cryptoAllocations, remainingCash');
        }

        return new self(
            character: $data['character'],
            cryptoAllocations: $data['cryptoAllocations'],
            remainingCash: (float) $data['remainingCash']
        );
    }
}