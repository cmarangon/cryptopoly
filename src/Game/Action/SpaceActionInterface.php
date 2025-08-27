<?php

declare(strict_types=1);

namespace App\Game\Action;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

interface SpaceActionInterface
{
    public function execute(Game $game, Player $player, Space $space): SpaceActionResult;

    public function canHandle(SpaceType $spaceType): bool;
}
