<?php

namespace App\Service;

use App\Entity\Game;
use App\Entity\Player;
use App\Game\Action\ChanceSpaceAction;
use App\Game\Action\PropertySpaceAction;
use App\Game\Action\RailroadSpaceAction;
use App\Game\Action\SpaceActionInterface;
use App\Game\Action\SpecialSpaceAction;
use App\Game\Action\TaxSpaceAction;
use App\Game\Action\UtilitySpaceAction;
use App\Game\ValueObject\Space;
use App\Game\ValueObject\SpaceActionResult;

class SpaceActionManager
{
    /** @var SpaceActionInterface[] */
    private array $actionHandlers;

    public function __construct()
    {
        $this->actionHandlers = [
            new TaxSpaceAction(),
            new PropertySpaceAction(),
            new SpecialSpaceAction(),
            new ChanceSpaceAction(),
            new RailroadSpaceAction(),
            new UtilitySpaceAction(),
        ];
    }

    public function executeSpaceAction(Game $game, Player $player, Space $space): SpaceActionResult
    {
        foreach ($this->actionHandlers as $handler) {
            if ($handler->canHandle($space->type)) {
                return $handler->execute($game, $player, $space);
            }
        }

        // Fallback for unknown space types
        return SpaceActionResult::success("Landed on {$space->name}");
    }
}
