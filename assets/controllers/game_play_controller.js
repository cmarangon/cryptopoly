import { Controller } from '@hotwired/stimulus';
import { ThemedDialog } from '../js/themed-dialog.js';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = [
        'playerPiece', 'playerCash', 'playerPosition',
        'diceResult', 'diceDisplay', 'moveInfo',
        'rollButton', 'endTurnButton', 'cryptoPortfolio', 'cryptoPrices'
    ];
    static values = { gameId: Number };

    connect() {
        this.hasRolled = false;
        this.loadCryptoPrices();
    }

    async rollDice() {
        if (this.hasRolled) {
            await ThemedDialog.warning('Already Rolled!', 'You have already rolled this turn!');
            return;
        }

        this.rollButtonTarget.disabled = true;
        this.rollButtonTarget.textContent = '🎲 Rolling...';

        try {
            const response = await fetch(`/api/game/${this.gameIdValue}/roll-dice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                this.displayDiceResult(result.dice, result.move);
                this.updatePlayerPosition(result.player.position, result.player.cash);
                this.hasRolled = true;
                this.endTurnButtonTarget.disabled = false;

                // Handle special spaces
                if (result.move.passedGo) {
                    this.showNotification('🎉 Passed GO! Collected $200');
                }

                this.showSpaceInfo(result.move.space);
            } else {
                await ThemedDialog.error('Roll Failed', result.error || 'Failed to roll dice');
                this.rollButtonTarget.disabled = false;
                this.rollButtonTarget.textContent = '🎲 Roll Dice';
            }
        } catch (error) {
            console.error('Error rolling dice:', error);
            await ThemedDialog.error('Connection Error', 'Failed to roll dice. Please try again.');
            this.rollButtonTarget.disabled = false;
            this.rollButtonTarget.textContent = '🎲 Roll Dice';
        }
    }

    displayDiceResult(dice, move) {
        this.diceDisplayTarget.textContent = `🎲 ${dice.dice1} + ${dice.dice2} = ${dice.total}`;

        if (dice.isDouble) {
            this.moveInfoTarget.innerHTML = `
                <strong>DOUBLES!</strong><br>
                Moved ${dice.total} spaces to position ${move.newPosition}
            `;
        } else {
            this.moveInfoTarget.textContent = `Moved ${dice.total} spaces to position ${move.newPosition}`;
        }

        this.diceResultTarget.classList.add('show');
    }

    updatePlayerPosition(newPosition, newCash) {
        // Update player piece position
        this.playerPieceTarget.className = `player-piece pos-${newPosition}`;

        // Update display values
        this.playerPositionTarget.textContent = newPosition;
        this.playerCashTarget.textContent = `$${newCash.toLocaleString()}`;
    }

    showSpaceInfo(space) {
        let message = `Landed on: ${space.name}`;

        switch (space.type) {
            case 'property':
                message += `\nProperty price: $${space.price}`;
                if (space.rent) {
                    message += `\nRent: $${space.rent}`;
                }
                break;
            case 'tax':
                message += `\nTax amount: $${space.amount}`;
                break;
            case 'chance':
                message += '\nDraw a chance card!';
                break;
            case 'special':
                if (space.name === 'GO') {
                    message += '\nCollect $200!';
                }
                break;
        }

        // Show in a more elegant way
        setTimeout(() => {
            this.showNotification(message);
        }, 1000);
    }

    showNotification(message) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            max-width: 300px;
            white-space: pre-line;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }


    async endTurn() {
        if (!this.hasRolled) {
            await ThemedDialog.warning('Roll First!', 'You must roll the dice first!');
            return;
        }

        const confirmed = await ThemedDialog.confirm(
            'End Turn?',
            'Are you sure you want to end your turn?\n\nThis will:\n• Update cryptocurrency prices\n• Start the next player\'s turn'
        );

        if (!confirmed) {
            return;
        }

        this.endTurnButtonTarget.disabled = true;
        this.endTurnButtonTarget.textContent = '⏭️ Ending Turn...';

        try {
            const response = await fetch(`/api/game/${this.gameIdValue}/end-turn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success) {
                // Reset turn state
                this.hasRolled = false;
                this.rollButtonTarget.disabled = false;
                this.rollButtonTarget.textContent = '🎲 Roll Dice';
                this.endTurnButtonTarget.disabled = true;
                this.endTurnButtonTarget.textContent = '⏭️ End Turn';
                this.diceResultTarget.classList.remove('show');

                // Update crypto prices
                this.updateCryptoPrices(result.cryptoPrices);

                this.showNotification(`Turn ${result.currentTurn} started!\nCrypto prices updated.`);
            } else {
                await ThemedDialog.error('Turn End Failed', result.error || 'Failed to end turn');
                this.endTurnButtonTarget.disabled = false;
                this.endTurnButtonTarget.textContent = '⏭️ End Turn';
            }
        } catch (error) {
            console.error('Error ending turn:', error);
            await ThemedDialog.error('Connection Error', 'Failed to end turn. Please try again.');
            this.endTurnButtonTarget.disabled = false;
            this.endTurnButtonTarget.textContent = '⏭️ End Turn';
        }
    }

    async loadCryptoPrices() {
        // For now, just display initial prices
        // In a full implementation, this would fetch current game prices
        const prices = {
            'bitcoin': { price: 45.50, symbol: '₿', name: 'BitCoin', color: '#f7931a' },
            'ethereum': { price: 32.25, symbol: 'Ξ', name: 'EthCoin', color: '#627eea' },
            'dogecoin': { price: 8.75, symbol: 'Ð', name: 'DogeCoin', color: '#c2a633' },
            'tether': { price: 15.90, symbol: '₮', name: 'TetherCoin', color: '#00d4aa' },
            'binance': { price: 28.40, symbol: '◇', name: 'BinanceCoin', color: '#f0b90b' },
            'cardano': { price: 12.15, symbol: '◆', name: 'CardanoCoin', color: '#1652f0' }
        };

        this.displayCryptoPrices(prices);
    }

    displayCryptoPrices(prices) {
        let pricesHTML = '';

        for (const [, data] of Object.entries(prices)) {
            pricesHTML += `
                <div class="price-item">
                    <div style="display: flex; align-items: center;">
                        <span style="color: ${data.color}; font-size: 1.2rem; margin-right: 0.5rem;">${data.symbol}</span>
                        <span>${data.name}</span>
                    </div>
                    <div>
                        <span style="color: #2ecc71; font-weight: bold;">$${data.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }

        this.cryptoPricesTarget.innerHTML = pricesHTML;
    }

    updateCryptoPrices(newPrices) {
        this.displayCryptoPrices(newPrices);
    }

    async tradeCrypto() {
        // Remove any existing trade panel
        const existingPanel = document.querySelector('.trade-slide-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create the slide-in trade panel
        const panel = document.createElement('div');
        panel.className = 'trade-slide-panel';

        // Fetch trade data for the current game
        const tradeContent = await this.fetchTradeContent();

        panel.innerHTML = `
            <div class="trade-panel-header">
                <h2>💱 Crypto Trading</h2>
                <button class="close-btn" data-action="click->game-play#closeTradePanel">✕</button>
            </div>
            <div class="trade-panel-content">
                ${tradeContent}
            </div>
        `;

        document.body.appendChild(panel);

        // Trigger slide-in animation
        requestAnimationFrame(() => {
            panel.classList.add('active');
        });
    }

    async fetchTradeContent() {
        try {
            const response = await fetch(`/api/game/${this.gameIdValue}/trade`);
            if (response.ok) {
                const data = await response.json();
                return this.generateTradeHTML(data);
            }
        } catch (error) {
            console.log('Could not fetch trade data, using fallback');
        }

        // Fallback content if API call fails
        return this.generateFallbackTradeHTML();
    }

    generateTradeHTML(data) {
        return `
            <div class="fee-notice">
                <strong>⚠️ Trading Fee: 2%</strong><br>
                All trades are subject to a 2% fee deducted from the received amount.
            </div>

            <div class="trading-interface">
                <!-- Sell Section -->
                <div class="trade-section">
                    <h3 class="section-title">Sell (From Portfolio)</h3>

                    <div class="crypto-select">
                        <div class="crypto-grid" id="sellOptions">
                            ${data.playerCryptos.map(crypto => `
                                <div class="crypto-option ${crypto.balance > 0 ? '' : 'disabled'}" data-crypto="${crypto.key}">
                                    <span class="crypto-symbol" style="color: ${crypto.color};">${crypto.symbol}</span>
                                    <div class="crypto-name">${crypto.name}</div>
                                    <div class="crypto-balance">Balance: $${crypto.balance.toFixed(2)}</div>
                                    <div class="crypto-price">$${crypto.price.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="amount-input-section">
                        <label class="amount-input-label">Amount to Sell ($)</label>
                        <input type="number" class="amount-input" placeholder="0.00" min="0" step="0.01" id="sellAmountInput">
                        <button class="max-btn" onclick="this.previousElementSibling.value = this.dataset.max" data-max="0">Max</button>
                    </div>
                </div>

                <!-- Buy Section -->
                <div class="trade-section">
                    <h3 class="section-title">Buy (Add to Portfolio)</h3>

                    <div class="crypto-select">
                        <div class="crypto-grid" id="buyOptions">
                            ${data.allCryptos.map(crypto => `
                                <div class="crypto-option" data-crypto="${crypto.key}">
                                    <span class="crypto-symbol" style="color: ${crypto.color};">${crypto.symbol}</span>
                                    <div class="crypto-name">${crypto.name}</div>
                                    <div class="crypto-price">$${crypto.price.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="amount-input-section">
                        <label class="amount-input-label">Amount You'll Receive ($)</label>
                        <input type="number" class="amount-input" placeholder="0.00" readonly id="buyAmountInput">
                        <div style="font-size: 0.8rem; color: #95a5a6; margin-top: 0.5rem;">
                            After 2% trading fee
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trade Summary -->
            <div class="trade-summary">
                <h3 class="section-title">Trade Summary</h3>

                <div class="summary-item">
                    <div class="summary-label">Selling:</div>
                    <div class="summary-value" id="sellingSummary">Select crypto to sell</div>
                </div>

                <div class="summary-item">
                    <div class="summary-label">Buying:</div>
                    <div class="summary-value" id="buyingSummary">Select crypto to buy</div>
                </div>

                <div class="summary-item">
                    <div class="summary-label">Exchange Rate:</div>
                    <div class="summary-value" id="exchangeRate">-</div>
                </div>

                <div class="summary-item">
                    <div class="summary-label">Trading Fee (2%):</div>
                    <div class="summary-value" id="tradingFee">$0.00</div>
                </div>
            </div>

            <div class="error-message" id="errorMessage" style="display: none;"></div>

            <button class="trade-button" id="executeTradeBtn" disabled>
                💱 Execute Trade
            </button>
        `;
    }

    generateFallbackTradeHTML() {
        const cryptos = [
            { key: 'bitcoin', symbol: '₿', name: 'BitCoin', color: '#f7931a', price: 45.50, balance: 25.00 },
            { key: 'ethereum', symbol: 'Ξ', name: 'EthCoin', color: '#627eea', price: 32.25, balance: 35.00 },
            { key: 'dogecoin', symbol: 'Ð', name: 'DogeCoin', color: '#c2a633', price: 8.75, balance: 0.00 },
            { key: 'tether', symbol: '₮', name: 'TetherCoin', color: '#00d4aa', price: 15.90, balance: 0.00 },
            { key: 'binance', symbol: '◇', name: 'BinanceCoin', color: '#f0b90b', price: 28.40, balance: 0.00 },
            { key: 'cardano', symbol: '◆', name: 'CardanoCoin', color: '#1652f0', price: 12.15, balance: 0.00 }
        ];

        return this.generateTradeHTML({
            playerCryptos: cryptos,
            allCryptos: cryptos
        });
    }

    closeTradePanel() {
        console.log('HELLO');
        const panel = document.querySelector('.trade-slide-panel');
        if (panel) {
            panel.classList.remove('active');
            setTimeout(() => {
                if (panel.parentNode) {
                    panel.remove();
                }
            }, 300); // Match animation duration
        }
    }
}
