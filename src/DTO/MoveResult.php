<?php

namespace App\DTO;

use App\Game\ValueObject\Space;

class MoveResult
{
    public function __construct(
        public readonly int $oldPosition,
        public readonly int $newPosition,
        public readonly bool $passedGo,
        public readonly Space $space,
        public readonly array $action,
    ) {}

    public function toArray(): array
    {
        return [
            'oldPosition' => $this->oldPosition,
            'newPosition' => $this->newPosition,
            'passedGo' => $this->passedGo,
            'space' => $this->space,
            'action' => $this->action,
        ];
    }
}
