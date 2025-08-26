<?php

namespace App\Service;

use App\Game\Enum\SpaceType;
use App\Game\ValueObject\Space;
use Symfony\Component\Yaml\Yaml;

class BoardConfiguration
{
    private array $spaces = [];
    private int $boardSize = 40;
    private string $configPath;

    public function __construct(string $projectDir)
    {
        $this->configPath = $projectDir . '/resources/board.yaml';
        $this->loadConfiguration();
    }

    public function getSpace(int $position): Space
    {
        return $this->spaces[$position] ?? new Space(
            position: $position,
            name: "Space $position",
            type: SpaceType::UNKNOWN
        );
    }

    public function getSpaceInfo(int $position): array
    {
        return $this->getSpace($position)->toArray();
    }

    public function getAllSpaces(): array
    {
        return $this->spaces;
    }

    public function getProperties(): array
    {
        return array_filter($this->spaces, fn(Space $space) => $space->isProperty());
    }

    public function getPropertiesByColor(string $color): array
    {
        return array_filter(
            $this->getProperties(),
            fn(Space $space) => $space->color === $color
        );
    }

    public function getBoardSize(): int
    {
        return $this->boardSize;
    }

    private function loadConfiguration(): void
    {
        if (!file_exists($this->configPath)) {
            throw new \RuntimeException("Board configuration file not found: {$this->configPath}");
        }

        $config = Yaml::parseFile($this->configPath);

        if (!isset($config['board'])) {
            throw new \RuntimeException('Invalid board configuration: missing "board" key');
        }

        $boardConfig = $config['board'];

        if (isset($boardConfig['size'])) {
            $this->boardSize = $boardConfig['size'];
        }

        if (isset($boardConfig['spaces'])) {
            $this->loadSpaces($boardConfig['spaces']);
        }
    }

    private function loadSpaces(array $spacesData): void
    {
        foreach ($spacesData as $spaceData) {
            $space = $this->createSpaceFromArray($spaceData);
            $this->spaces[$space->position] = $space;
        }
    }

    private function createSpaceFromArray(array $data): Space
    {
        $type = SpaceType::tryFrom($data['type'] ?? 'unknown') ?? SpaceType::UNKNOWN;

        return new Space(
            position: $data['position'] ?? 0,
            name: $data['name'] ?? 'Unknown Space',
            type: $type,
            price: $data['price'] ?? null,
            rent: $data['rent'] ?? null,
            taxAmount: $data['tax_amount'] ?? null,
            color: $data['color'] ?? null,
            houseCost: $data['house_cost'] ?? null,
            hotelCost: $data['hotel_cost'] ?? null,
        );
    }
}
