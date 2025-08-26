<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class RailroadSpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];

        $owner = $properties[$space->position] ?? null;
        // Railroad is unowned
        if ($owner === null) {
            return SpaceActionResult::success(
                "{$space->name} is available for purchase (Price: {$space->price})",
                0,
                ['canPurchase' => true, 'price' => $space->price]
            );
        }
        // Player owns this railroad
        if ($owner === $player->getId()) {
            return SpaceActionResult::success("You own {$space->name}");
        }
        // Another player owns this railroad - calculate rent based on how many railroads they own
        $ownedRailroads = $this->countOwnedRailroads($game, $owner);
        $rent = $this->calculateRailroadRent($space->rent, $ownedRailroads);
        if ($player->getCash() < $rent) {
            return SpaceActionResult::failure("Insufficient cash to pay {$rent} rent for {$space->name}");
        }
        $player->subtractCash($rent);
        // Find the owner player and add rent to their cash
        foreach ($game->getPlayers() as $ownerPlayer) {
            if ($ownerPlayer->getId() === $owner) {
                $ownerPlayer->addCash($rent);
                break;
            }
        }
        return SpaceActionResult::success(
            "Paid {$rent} rent for {$space->name} (Owner has {$ownedRailroads} railroads)",
            -$rent,
            ['rentPaid' => true, 'owner' => $owner, 'ownedRailroads' => $ownedRailroads]
        );
    }
    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::RAILROAD;
    }
    private function countOwnedRailroads(Game $game, int $ownerId): int
    {
        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];
        $count = 0;
        foreach ($properties as $position => $owner) {
            if ($owner === $ownerId) {
                // Check if this position is a railroad by getting space info
                $space = $game->getGameData()['spaces'][$position] ?? null;
                if ($space && ($space['type'] ?? '') === 'railroad') {
                    $count++;
                }
            }
        }
        return $count;
    }

    private function calculateRailroadRent(int $baseRent, int $railroadsOwned): int
    {
        // Standard Monopoly railroad rent: $25, $50, $100, $200
        return match ($railroadsOwned) {
            1 => $baseRent,
            2 => $baseRent * 2,
            3 => $baseRent * 4,
            4 => $baseRent * 8,
            default => $baseRent,
        };
    }
}
