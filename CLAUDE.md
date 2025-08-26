# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CryptoPoly is a Monopoly clone built with Symfony 7.3 and PHP 8.2+, featuring cryptocurrency mechanics where players use fictional digital currencies that fluctuate in value throughout the game.

## Technology Stack

- **Backend**: Symfony 7.3 with Doctrine ORM
- **Frontend**: Stimulus (Hotwired) with Turbo for interactive components
- **Database**: SQLite with Doctrine DBAL and migrations
- **Testing**: PHPUnit 12.3
- **Code Quality**: PHP-CS-Fixer with PER Coding Style 3.0 compliance
- **Asset Management**: Symfony AssetMapper with importmap
- **Data Fixtures**: Doctrine Fixtures Bundle for initial cryptocurrency data

## Development Commands

### Core Development
```bash
# Start development server
symfony server:start

# Install dependencies
composer install

# Install frontend dependencies
php bin/console importmap:install

# Generate assets
php bin/console asset-map:compile
```

### Database
```bash
# Create SQLite database
php bin/console doctrine:database:create

# Generate migration
php bin/console make:migration

# Run migrations
php bin/console doctrine:migrations:migrate

# Load cryptocurrency fixtures
php bin/console doctrine:fixtures:load --no-interaction

# Validate schema
php bin/console doctrine:schema:validate

# Run SQL queries directly
php bin/console dbal:run-sql "SELECT * FROM cryptocurrency"
```

### Testing
```bash
# Run all tests
php bin/phpunit

# Run specific test
php bin/phpunit tests/path/to/TestFile.php

# Run tests with coverage
php bin/phpunit --coverage-html coverage/
```

### Code Generation
```bash
# Generate entity
php bin/console make:entity

# Generate controller
php bin/console make:controller

# Generate Stimulus controller
php bin/console make:stimulus-controller

# Generate form
php bin/console make:form

# Generate CRUD
php bin/console make:crud
```

### Code Quality & Linting
```bash
# Check code style (PER Coding Style 3.0)
composer lint
# or
composer cs-check

# Fix code style issues automatically
composer lint-fix
# or
composer cs-fix

# Check specific files
vendor/bin/php-cs-fixer fix src/ --dry-run --diff
```

## Architecture

### Backend Structure
- **Entities**: Game models (Player, Game, Property, Cryptocurrency, Transaction)
- **Controllers**: API endpoints and page controllers
- **Services**: Game logic, cryptocurrency fluctuation engine, player management
- **Repositories**: Data access layer with custom queries

### Frontend Structure
- **Stimulus Controllers**: Interactive game components (board, trading interface, turn management)
- **Assets**: Stylesheets and JavaScript organized by feature
- **Templates**: Twig templates for game views

### Key Components
- **Game Engine**: Turn-based logic with cryptocurrency integration
- **Market System**: Real-time currency fluctuation simulation
- **Trading Interface**: Player currency exchange mechanics
- **Board Management**: Property ownership and rent calculations

### Stimulus Integration
- Controllers in `assets/controllers/` handle frontend interactions
- Use `data-controller` attributes in Twig templates
- Turbo streams for real-time game updates without page reloads

## Game-Specific Architecture

### Core Game Entities
- `Game`: Manages game state, turn order, and active players
- `Player`: Handles player data, currency portfolios, and properties
- `Cryptocurrency`: Defines available currencies with fluctuating values
- `Property`: Represents board spaces with ownership and rent mechanics
- `Transaction`: Records all currency exchanges and property purchases

### Currency System
- Multiple fictional cryptocurrencies (BitCoin, EthCoin, DogeCoin, etc.)
- Values fluctuate each turn based on market simulation algorithms
- Players can trade currencies before/after their turn
- Property purchases and rent can be paid in any owned currency

## Development Notes

The project uses Symfony's modern stack with Stimulus for progressive enhancement. Game state is managed server-side with real-time updates via Turbo streams. The cryptocurrency fluctuation system is implemented as a separate service that can be easily configured and extended.

## Database Information

- **Database File**: `var/data.db` (SQLite)
- **Schema**: Automatically managed through Doctrine migrations
- **Initial Data**: 6 cryptocurrencies loaded via fixtures
- **Tables**: game, player, cryptocurrency, messenger_messages

The SQLite database is perfect for development and can easily be deployed as a single file.