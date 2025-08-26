import { Controller } from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = ['characterDisplay', 'cashAmount', 'cryptoList'];
    
    connect() {
        this.loadGameData();
        this.displayPlayerInfo();
        this.displayCryptoPortfolio();
    }
    
    loadGameData() {
        // Load game setup data from session storage
        const gameSetupData = sessionStorage.getItem('gameSetup');
        if (gameSetupData) {
            this.gameData = JSON.parse(gameSetupData);
        } else {
            // Fallback data if no setup found
            this.gameData = {
                character: 'hacker',
                cryptoAllocations: {},
                remainingCash: 100
            };
        }
    }
    
    displayPlayerInfo() {
        // Character display
        const characterEmojis = {
            'hacker': '👨‍💻',
            'trader': '📈',
            'investor': '💼',
            'miner': '⛏️',
            'whale': '🐋',
            'hodler': '💎'
        };
        
        const characterNames = {
            'hacker': 'Crypto Hacker',
            'trader': 'Day Trader',
            'investor': 'Investor',
            'miner': 'Crypto Miner',
            'whale': 'Crypto Whale',
            'hodler': 'HODLer'
        };
        
        const emoji = characterEmojis[this.gameData.character] || '👨‍💻';
        const name = characterNames[this.gameData.character] || 'Player';
        
        this.characterDisplayTarget.innerHTML = `
            <span class="character-emoji">${emoji}</span>
            <div class="character-name">${name}</div>
        `;
        
        // Cash display
        this.cashAmountTarget.textContent = `$${this.gameData.remainingCash}`;
    }
    
    displayCryptoPortfolio() {
        const cryptoSymbols = {
            'bitcoin': { symbol: '₿', name: 'BitCoin', color: '#f7931a' },
            'ethereum': { symbol: 'Ξ', name: 'EthCoin', color: '#627eea' },
            'dogecoin': { symbol: 'Ð', name: 'DogeCoin', color: '#c2a633' },
            'tether': { symbol: '₮', name: 'TetherCoin', color: '#00d4aa' },
            'binance': { symbol: '◇', name: 'BinanceCoin', color: '#f0b90b' },
            'cardano': { symbol: '◆', name: 'CardanoCoin', color: '#1652f0' }
        };
        
        let portfolioHTML = '';
        
        for (const [crypto, amount] of Object.entries(this.gameData.cryptoAllocations)) {
            if (amount > 0) {
                const cryptoInfo = cryptoSymbols[crypto];
                if (cryptoInfo) {
                    portfolioHTML += `
                        <div class="crypto-item">
                            <span class="crypto-symbol" style="color: ${cryptoInfo.color}">${cryptoInfo.symbol}</span>
                            <div class="crypto-name">${cryptoInfo.name}</div>
                            <div class="crypto-amount">$${amount}</div>
                        </div>
                    `;
                }
            }
        }
        
        if (portfolioHTML === '') {
            portfolioHTML = '<div style="text-align: center; opacity: 0.7;">No crypto holdings</div>';
        }
        
        this.cryptoListTarget.innerHTML = portfolioHTML;
    }
    
    rollDice() {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        
        alert(`🎲 You rolled ${dice1} + ${dice2} = ${total}!`);
        
        // TODO: Move player piece, handle space effects
    }
    
    tradeCrypto() {
        alert('💱 Crypto trading interface coming soon!');
    }
    
    viewProperties() {
        alert('🏠 Property management interface coming soon!');
    }
    
    endTurn() {
        if (confirm('Are you sure you want to end your turn?')) {
            alert('⏭️ Turn ended. Next player\'s turn!');
            // TODO: Handle turn management
        }
    }
}
