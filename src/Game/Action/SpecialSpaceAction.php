<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class SpecialSpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        return match ($space->name) {
            'GO' => SpaceActionResult::success('You are on GO - collect salary when you pass!'),
            'Jail' => SpaceActionResult::success('Just visiting Jail'),
            'Free Parking' => SpaceActionResult::success('Relax at Free Parking'),
            'Go to Jail' => $this->handleGoToJail($player),
            default => SpaceActionResult::success("Landed on {$space->name}")
        };
    }
    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::SPECIAL;
    }
    private function handleGoToJail(Player $player): SpaceActionResult
    {
        $jailPosition = 10; // Jail is typically at position 10
        $player->setPosition($jailPosition);

        return SpaceActionResult::move('Go directly to Jail! Do not pass GO, do not collect $200', $jailPosition);
    }
}
