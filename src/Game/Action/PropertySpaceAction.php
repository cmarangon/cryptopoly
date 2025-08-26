<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class PropertySpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        $gameData = $game->getGameData();
        $properties = $gameData['properties'] ?? [];

        $owner = $properties[$space->position] ?? null;
        // Property is unowned
        if ($owner === null) {
            return SpaceActionResult::success(
                "{$space->name} is available for purchase (Price: {$space->price})",
                0,
                ['canPurchase' => true, 'price' => $space->price]
            );
        }
        // Player owns this property
        if ($owner === $player->getId()) {
            return SpaceActionResult::success("You own {$space->name}");
        }
        // Another player owns this property - pay rent
        if ($space->rent === null) {
            return SpaceActionResult::failure('Property has no rent configured');
        }
        if ($player->getCash() < $space->rent) {
            return SpaceActionResult::failure("Insufficient cash to pay {$space->rent} rent for {$space->name}");
        }
        $player->subtractCash($space->rent);
        // Find the owner player and add rent to their cash
        foreach ($game->getPlayers() as $ownerPlayer) {
            if ($ownerPlayer->getId() === $owner) {
                $ownerPlayer->addCash($space->rent);
                break;
            }
        }
        return SpaceActionResult::success(
            "Paid {$space->rent} rent for {$space->name}",
            -$space->rent,
            ['rentPaid' => true, 'owner' => $owner]
        );
    }

    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::PROPERTY;
    }
}
