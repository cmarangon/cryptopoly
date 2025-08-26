<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class UtilitySpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];

        $owner = $properties[$space->position] ?? null;
        // Utility is unowned
        if ($owner === null) {
            return SpaceActionResult::success(
                "{$space->name} is available for purchase (Price: {$space->price})",
                0,
                ['canPurchase' => true, 'price' => $space->price]
            );
        }
        // Player owns this utility
        if ($owner === $player->getId()) {
            return SpaceActionResult::success("You own {$space->name}");
        }
        // Another player owns this utility - rent is based on dice roll
        // For now, we'll use a fixed multiplier since we don't have access to the dice roll here
        $ownedUtilities = $this->countOwnedUtilities($game, $owner);
        $multiplier = $ownedUtilities === 1 ? 4 : 10; // 4x for one utility, 10x for both
        // We'll use a base amount since we don't have the dice roll
        $baseAmount = 10; // This should ideally be the dice roll total
        $rent = $baseAmount * $multiplier;
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
            "Paid {$rent} rent for {$space->name} (Owner has {$ownedUtilities} utilities)",
            -$rent,
            ['rentPaid' => true, 'owner' => $owner, 'ownedUtilities' => $ownedUtilities]
        );
    }
    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::UTILITY;
    }
    private function countOwnedUtilities(Game $game, int $ownerId): int
    {
        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];
        $count = 0;
        foreach ($properties as $position => $owner) {
            if ($owner === $ownerId) {
                // Check if this position is a utility by getting space info
                $space = $game->getGameData()['spaces'][$position] ?? null;
                if ($space && ($space['type'] ?? '') === 'utility') {
                    $count++;
                }
            }
        }
        return $count;
    }
}
