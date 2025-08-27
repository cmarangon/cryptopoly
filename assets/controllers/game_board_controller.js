import { Controller } from '@hotwired/stimulus';
import { ThemedDialog } from '../js/themed-dialog.js';

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
    
    async rollDice() {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        
        await ThemedDialog.success('Dice Rolled!', `🎲 You rolled ${dice1} + ${dice2} = ${total}!`);
        
        // TODO: Move player piece, handle space effects
    }
    
    async tradeCrypto() {
        await ThemedDialog.info('Coming Soon!', '💱 Crypto trading interface coming soon!');
    }
    
    async viewProperties() {
        await ThemedDialog.info('Coming Soon!', '🏠 Property management interface coming soon!');
    }
    
    async endTurn() {
        const confirmed = await ThemedDialog.confirm(
            'End Turn?', 
            'Are you sure you want to end your turn?'
        );
        
        if (confirmed) {
            await ThemedDialog.success('Turn Ended!', '⏭️ Turn ended. Next player\'s turn!');
            // TODO: Handle turn management
        }
    }
    
    showThemedDialog(title, message, type = 'info', showCancel = false) {
        return new Promise((resolve) => {
            // Remove any existing dialog
            const existingDialog = document.querySelector('.crypto-dialog');
            if (existingDialog) {
                existingDialog.remove();
            }
            
            // Create dialog overlay
            const overlay = document.createElement('div');
            overlay.className = 'crypto-dialog';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease-out;
            `;
            
            // Create dialog box
            const dialog = document.createElement('div');
            const typeColors = {
                'info': '#3498db',
                'warning': '#f39c12',
                'error': '#e74c3c',
                'success': '#27ae60'
            };
            const color = typeColors[type] || typeColors['info'];
            
            dialog.style.cssText = `
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                border: 3px solid ${color};
                border-radius: 15px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transform: scale(0.8);
                animation: dialogPop 0.3s ease-out forwards;
                text-align: center;
            `;
            
            // Icon based on type
            const icons = {
                'info': '💬',
                'warning': '⚠️',
                'error': '❌',
                'success': '✅'
            };
            const icon = icons[type] || icons['info'];
            
            dialog.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
                <h3 style="color: ${color}; margin: 0 0 1rem 0; font-size: 1.5rem;">${title}</h3>
                <p style="margin: 0 0 2rem 0; font-size: 1.1rem; line-height: 1.5; white-space: pre-line;">${message}</p>
                <div class="dialog-buttons" style="display: flex; gap: 1rem; justify-content: center;">
                    ${showCancel ? `<button class="cancel-btn" style="
                        padding: 0.8rem 2rem;
                        border: 2px solid #95a5a6;
                        background: transparent;
                        color: #bdc3c7;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-weight: bold;
                    ">Cancel</button>` : ''}
                    <button class="confirm-btn" style="
                        padding: 0.8rem 2rem;
                        border: none;
                        background: linear-gradient(45deg, ${color}, ${color}dd);
                        color: white;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    ">${showCancel ? 'Confirm' : 'OK'}</button>
                </div>
            `;
            
            // Add animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes dialogPop {
                    to { transform: scale(1); }
                }
                .crypto-dialog button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
                }
                .cancel-btn:hover {
                    background: #95a5a6 !important;
                    color: #2c3e50 !important;
                }
            `;
            document.head.appendChild(style);
            
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Handle button clicks
            const confirmBtn = dialog.querySelector('.confirm-btn');
            const cancelBtn = dialog.querySelector('.cancel-btn');
            
            const cleanup = () => {
                overlay.remove();
                style.remove();
            };
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });
            }
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            });
            
            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    cleanup();
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }
}
