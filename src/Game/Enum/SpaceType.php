<?php

declare(strict_types=1);

namespace App\Game\Enum;

enum SpaceType: string
{
    case SPECIAL = 'special';
    case PROPERTY = 'property';
    case CHANCE = 'chance';
    case TAX = 'tax';
    case UTILITY = 'utility';
    case RAILROAD = 'railroad';
    case UNKNOWN = 'unknown';
}
