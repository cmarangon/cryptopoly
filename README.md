# 🎮 CryptoPoly

A modern Monopoly clone built with Symfony, featuring cryptocurrency mechanics and a sleek cyber-themed design.

## 🚀 Features

- **🏠 Classic Monopoly Gameplay**: Full board game mechanics with properties, rent, and trading
- **💰 Cryptocurrency System**: 6 fictional cryptocurrencies with real-time price fluctuations
- **📈 Price History Charts**: Interactive line charts showing market volatility using Chart.js
- **🎨 Modern Cyber Design**: Dark gradients, neon glows, and glass-morphism effects
- **⚡ Real-time Updates**: Turbo streams for seamless gameplay without page reloads
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Backend
- **PHP 8.2+** with strict typing
- **Symfony 7.3** framework
- **Doctrine ORM** with SQLite database
- **Twig** templating engine
- **PHPUnit 12.3** for testing

### Frontend  
- **Stimulus** (Hotwired) for interactive components
- **Turbo** for SPA-like navigation
- **Chart.js** for price visualization
- **AssetMapper** with importmap for asset management
- **Modern CSS** (Grid, Flexbox, CSS Custom Properties)

### Development Tools
- **PHP-CS-Fixer** with PER Coding Style 3.0
- **Symfony Console** for commands
- **Doctrine Migrations** for database versioning
- **AssetMapper** with importmap for asset management

## 📦 Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Symfony CLI (recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cryptopoly
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install frontend dependencies**
   ```bash
   php bin/console importmap:install
   ```

4. **Create database and run migrations**
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate --no-interaction
   ```

5. **Load cryptocurrency fixtures**
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction
   ```

6. **Generate assets**
   ```bash
   php bin/console asset-map:compile
   ```

7. **Start the development server**
   ```bash
   symfony server:start
   # Or with PHP built-in server:
   php -S localhost:8000 -t public
   ```

8. **Visit the application**
   ```
   http://localhost:8000
   ```

## 🎯 Development Commands

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

### Database Management
```bash
# Create database
php bin/console doctrine:database:create

# Generate migration
php bin/console make:migration

# Run migrations
php bin/console doctrine:migrations:migrate

# Load test data
php bin/console doctrine:fixtures:load --no-interaction

# Validate schema
php bin/console doctrine:schema:validate

# Run raw SQL queries
php bin/console dbal:run-sql "SELECT * FROM cryptocurrency"
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

### Testing & Quality
```bash
# Run all tests
php bin/phpunit

# Run specific test
php bin/phpunit tests/path/to/TestFile.php

# Check code style (PER Coding Style 3.0)
composer lint
# or
composer cs-check

# Fix code style automatically
composer lint-fix
# or
composer cs-fix

# Run with coverage
php bin/phpunit --coverage-html coverage/
```

## 🏗️ Architecture

### Directory Structure
```
src/
├── Controller/          # HTTP controllers
├── Entity/             # Doctrine entities
├── Repository/         # Data access layer
├── Service/           # Business logic services
├── Game/              # Game domain logic
│   ├── Action/        # Space action handlers
│   ├── Enum/          # Game enumerations
│   └── ValueObject/   # Data structures
├── DataFixtures/      # Database seeders
└── Form/              # Symfony forms

assets/
├── controllers/       # Stimulus controllers
├── styles/           # SCSS stylesheets
│   ├── game/         # Game-specific styles
│   └── components/   # Reusable components
└── app.js            # Main JavaScript entry

templates/
├── base.html.twig    # Base layout
├── game/             # Game templates
└── components/       # Reusable components
```

### Key Components

#### Game Entities
- **Game**: Manages game state and turn order
- **Player**: Handles player data and crypto portfolios  
- **Cryptocurrency**: Defines available currencies
- **CryptocurrencyPriceHistory**: Historical price data
- **Property**: Board spaces with ownership mechanics

#### Services
- **GameService**: Core game logic and turn management
- **CryptocurrencyService**: Price fluctuations and trading
- **BoardConfiguration**: Board space definitions
- **SpaceActionManager**: Handles space landing actions

#### Frontend Controllers
- **GameController**: Main game interface interactions
- **CryptoTradingController**: Trading interface
- **CryptoChartController**: Price history visualization
- **GameSetupController**: Character and portfolio selection

## 🎮 Game Mechanics

### Cryptocurrency System
- **6 Fictional Cryptocurrencies**: BitCoin, EthCoin, DogeCoin, TetherCoin, BinanceCoin, CardanoCoin
- **Price Fluctuations**: ±15% per turn with min/max bounds
- **Trading**: 2% fee on all exchanges
- **Price History**: Tracked per game with interactive charts

### Board Gameplay
- **40 Spaces**: Properties, utilities, railroads, special spaces
- **Property Ownership**: Buy, rent, and collect income
- **Turn-based**: Dice rolling and movement
- **Special Actions**: Taxes, chance cards, jail mechanics

## 🎨 Design System

### Color Palette
- **Primary Cyan**: `#00ffff` - Main accent color
- **Success Green**: `#00ff88` - Positive actions
- **Warning Orange**: `#ffcc00` - Alerts and fees
- **Error Red**: `#ff3366` - Errors and negative actions
- **Dark Background**: `#0f0f23` to `#1a1a2e` gradients

### Typography
- **Headers**: System fonts with cyber styling
- **Monospace**: 'Courier New' for prices and data
- **Text Effects**: Glows, shadows, and neon effects

### Components
- **Glass-morphism**: Backdrop blur with subtle transparency
- **Gradient Borders**: Electric-themed borders
- **Hover Animations**: Transform and glow effects
- **Responsive Grid**: CSS Grid for board layout

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
APP_ENV=dev
APP_SECRET=your-secret-key
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"
```

### Database
The project uses SQLite by default, stored in `var/data.db`. Perfect for development and easy deployment.

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: Run `composer lint-fix`
4. **Write tests**: Ensure good test coverage
5. **Commit changes**: Use conventional commit messages
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards
- Follow **PER Coding Style 3.0**
- Use **strict typing**: `declare(strict_types=1);`
- Write **comprehensive tests**
- Document **public APIs**
- Follow **Symfony best practices**

## 🐛 Troubleshooting

### Common Issues

**Assets not loading?**
```bash
php bin/console asset-map:compile
php bin/console cache:clear
```

**Database errors?**
```bash
php bin/console doctrine:schema:validate
php bin/console doctrine:migrations:migrate
```

**Styling issues?**
```bash
php bin/console asset-map:compile
# Check browser console for errors
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Symfony** framework and community
- **Chart.js** for beautiful visualizations  
- **Stimulus** for modern JavaScript interactions
- **Monopoly** game mechanics inspiration

---

**Built with ❤️ using Symfony 7.3 and modern web technologies**