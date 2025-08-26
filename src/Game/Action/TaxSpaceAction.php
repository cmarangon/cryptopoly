<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class TaxSpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        if ($space->taxAmount === null) {
            return SpaceActionResult::failure('Tax space has no tax amount configured');
        }
        if ($player->getCash() < $space->taxAmount) {
            return SpaceActionResult::failure("Insufficient cash to pay {$space->taxAmount} tax");
        }
        $player->subtractCash($space->taxAmount);
        return SpaceActionResult::success(
            "Paid {$space->taxAmount} in {$space->name}",
            -$space->taxAmount
        );
    }
    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::TAX;
    }
}
