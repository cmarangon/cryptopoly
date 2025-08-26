import { Controller } from '@hotwired/stimulus';

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
            alert('You have already rolled this turn!');
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
                alert(result.error || 'Failed to roll dice');
                this.rollButtonTarget.disabled = false;
                this.rollButtonTarget.textContent = '🎲 Roll Dice';
            }
        } catch (error) {
            console.error('Error rolling dice:', error);
            alert('Failed to roll dice. Please try again.');
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
            alert('You must roll the dice first!');
            return;
        }
        
        if (!confirm('Are you sure you want to end your turn?')) {
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
                alert(result.error || 'Failed to end turn');
                this.endTurnButtonTarget.disabled = false;
                this.endTurnButtonTarget.textContent = '⏭️ End Turn';
            }
        } catch (error) {
            console.error('Error ending turn:', error);
            alert('Failed to end turn. Please try again.');
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
        
        for (const [crypto, data] of Object.entries(prices)) {
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
    
    tradeCrypto() {
        alert('💱 Crypto trading interface coming soon!\nThis will allow you to exchange between different cryptocurrencies.');
    }
}
