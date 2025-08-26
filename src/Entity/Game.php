<?php

namespace App\Entity;

use App\Repository\GameRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GameRepository::class)]
class Game
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $status = 'waiting'; // waiting, active, finished

    #[ORM\Column]
    private ?int $currentTurn = 1;

    #[ORM\Column]
    private ?int $currentPlayerIndex = 0;

    #[ORM\Column(type: 'json')]
    private array $gameData = [];

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $finishedAt = null;

    #[ORM\OneToMany(targetEntity: Player::class, mappedBy: 'game', orphanRemoval: true)]
    private Collection $players;

    public function __construct()
    {
        $this->players = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getCurrentTurn(): ?int
    {
        return $this->currentTurn;
    }

    public function setCurrentTurn(int $currentTurn): static
    {
        $this->currentTurn = $currentTurn;
        return $this;
    }

    public function getCurrentPlayerIndex(): ?int
    {
        return $this->currentPlayerIndex;
    }

    public function setCurrentPlayerIndex(int $currentPlayerIndex): static
    {
        $this->currentPlayerIndex = $currentPlayerIndex;
        return $this;
    }

    public function getGameData(): array
    {
        return $this->gameData;
    }

    public function setGameData(array $gameData): static
    {
        $this->gameData = $gameData;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getFinishedAt(): ?\DateTimeImmutable
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(?\DateTimeImmutable $finishedAt): static
    {
        $this->finishedAt = $finishedAt;
        return $this;
    }

    /**
     * @return Collection<int, Player>
     */
    public function getPlayers(): Collection
    {
        return $this->players;
    }

    public function addPlayer(Player $player): static
    {
        if (!$this->players->contains($player)) {
            $this->players->add($player);
            $player->setGame($this);
        }
        return $this;
    }

    public function removePlayer(Player $player): static
    {
        if ($this->players->removeElement($player)) {
            if ($player->getGame() === $this) {
                $player->setGame(null);
            }
        }
        return $this;
    }

    public function getCurrentPlayer(): ?Player
    {
        $players = $this->players->toArray();
        return $players[$this->currentPlayerIndex] ?? null;
    }

    public function nextPlayer(): void
    {
        $playerCount = count($this->players);
        if ($playerCount > 0) {
            $this->currentPlayerIndex = ($this->currentPlayerIndex + 1) % $playerCount;
            if ($this->currentPlayerIndex === 0) {
                $this->currentTurn++;
            }
        }
    }
}
