<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class ChanceSpaceAction implements SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult
    {
        // For now, just return a placeholder message
        // In a full implementation, this would draw a chance/community chest card
        $messages = [
            'Bank pays you dividend of $50',
            'Pay poor tax of $15',
            'You have won second prize in a beauty contest - collect $10',
            'Go back 3 spaces',
            'Advance to GO - collect $200',
        ];
        $randomMessage = $messages[array_rand($messages)];

        return SpaceActionResult::success(
            "Chance/Community Chest: $randomMessage (Not implemented yet)",
            0,
            ['chanceCard' => $randomMessage]
        );
    }

    public function canHandle(SpaceType $spaceType): bool
    {
        return $spaceType === SpaceType::CHANCE;
    }
}
