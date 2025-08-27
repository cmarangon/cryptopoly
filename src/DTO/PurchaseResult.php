<?php

namespace App\DTO;

class PurchaseResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $message,
        public readonly ?string $property = null,
        public readonly ?int $price = null,
        public readonly ?float $remainingCash = null,
    ) {}

    public static function failure(string $message): self
    {
        return new self(
            success: false,
            message: $message
        );
    }

    public static function success(string $property, int $price, float $remainingCash): self
    {
        return new self(
            success: true,
            message: "Successfully purchased {$property} for {$price}",
            property: $property,
            price: $price,
            remainingCash: $remainingCash
        );
    }

    public function toArray(): array
    {
        $result = [
            'success' => $this->success,
            'message' => $this->message,
        ];

        if ($this->success && $this->property !== null) {
            $result['property'] = $this->property;
            $result['price'] = $this->price;
            $result['remainingCash'] = $this->remainingCash;
        }

        return $result;
    }
}
