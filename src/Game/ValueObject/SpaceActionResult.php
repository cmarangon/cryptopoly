<?php

declare(strict_types=1);

namespace App\Game\ValueObject;

readonly class SpaceActionResult
{
    public function __construct(
        public bool $success,
        public string $message,
        public int $cashChange = 0,
        public array $cryptoChanges = [],
        public bool $playerMoved = false,
        public ?int $newPosition = null,
        public array $additionalData = [],
    ) {}

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message,
            'cashChange' => $this->cashChange,
            'cryptoChanges' => $this->cryptoChanges,
            'playerMoved' => $this->playerMoved,
            'newPosition' => $this->newPosition,
            'additionalData' => $this->additionalData,
        ];
    }

    public static function success(string $message, int $cashChange = 0, array $additionalData = []): self
    {
        return new self(true, $message, $cashChange, [], false, null, $additionalData);
    }

    public static function failure(string $message): self
    {
        return new self(false, $message);
    }

    public static function move(string $message, int $newPosition): self
    {
        return new self(true, $message, 0, [], true, $newPosition);
    }
}