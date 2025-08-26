<?php

namespace App\Entity;

use App\Repository\PlayerRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PlayerRepository::class)]
class Player
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    #[ORM\Column(length: 50)]
    private ?string $character = null;

    #[ORM\Column]
    private ?float $cash = 0;

    #[ORM\Column]
    private ?int $position = 0;

    #[ORM\Column]
    private ?bool $isActive = true;

    #[ORM\Column(type: 'json')]
    private array $cryptoPortfolio = [];

    #[ORM\Column(type: 'json')]
    private array $properties = [];

    #[ORM\Column]
    private ?int $playerOrder = 0;

    #[ORM\ManyToOne(inversedBy: 'players')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Game $game = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCharacter(): ?string
    {
        return $this->character;
    }

    public function setCharacter(string $character): static
    {
        $this->character = $character;
        return $this;
    }

    public function getCash(): ?float
    {
        return $this->cash;
    }

    public function setCash(float $cash): static
    {
        $this->cash = $cash;
        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;
        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getCryptoPortfolio(): array
    {
        return $this->cryptoPortfolio;
    }

    public function setCryptoPortfolio(array $cryptoPortfolio): static
    {
        $this->cryptoPortfolio = $cryptoPortfolio;
        return $this;
    }

    public function getProperties(): array
    {
        return $this->properties;
    }

    public function setProperties(array $properties): static
    {
        $this->properties = $properties;
        return $this;
    }

    public function getPlayerOrder(): ?int
    {
        return $this->playerOrder;
    }

    public function setPlayerOrder(int $playerOrder): static
    {
        $this->playerOrder = $playerOrder;
        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(?Game $game): static
    {
        $this->game = $game;
        return $this;
    }

    public function addCash(float $amount): void
    {
        $this->cash += $amount;
    }

    public function subtractCash(float $amount): bool
    {
        if ($this->cash >= $amount) {
            $this->cash -= $amount;
            return true;
        }
        return false;
    }

    public function moveToPosition(int $newPosition): void
    {
        $this->position = $newPosition % 40; // Board has 40 positions
    }

    public function getTotalNetWorth(): float
    {
        $cryptoValue = array_sum($this->cryptoPortfolio);
        return $this->cash + $cryptoValue;
    }
}
