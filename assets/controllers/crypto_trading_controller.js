import { Controller } from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = [
        'sellOptions', 'buyOptions', 'sellAmountInput', 'buyAmountInput',
        'sellingSummary', 'buyingSummary', 'exchangeRate', 'tradingFee',
        'tradeButton', 'errorMessage'
    ];
    static values = { gameId: Number };
    
    connect() {
        this.selectedSellCrypto = null;
        this.selectedBuyCrypto = null;
        this.sellAmount = 0;
        this.cryptoData = {
            'bitcoin': { symbol: '₿', name: 'BitCoin', price: 45.50, color: '#f7931a', balance: 25.00 },
            'ethereum': { symbol: 'Ξ', name: 'EthCoin', price: 32.25, color: '#627eea', balance: 35.00 },
            'dogecoin': { symbol: 'Ð', name: 'DogeCoin', price: 8.75, color: '#c2a633', balance: 0.00 },
            'tether': { symbol: '₮', name: 'TetherCoin', price: 15.90, color: '#00d4aa', balance: 0.00 },
            'binance': { symbol: '◇', name: 'BinanceCoin', price: 28.40, color: '#f0b90b', balance: 0.00 },
            'cardano': { symbol: '◆', name: 'CardanoCoin', price: 12.15, color: '#1652f0', balance: 0.00 }
        };
        
        this.updateTradeValidation();
    }
    
    selectSellCrypto(event) {
        const crypto = event.currentTarget.dataset.crypto;
        const cryptoInfo = this.cryptoData[crypto];
        
        if (!cryptoInfo || cryptoInfo.balance <= 0) {
            return;
        }
        
        // Remove selected class from all sell options
        this.sellOptionsTarget.querySelectorAll('.crypto-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        event.currentTarget.classList.add('selected');
        this.selectedSellCrypto = crypto;
        
        // Reset sell amount
        this.sellAmountInputTarget.value = '';
        this.sellAmount = 0;
        
        this.updateTradeSummary();
        this.updateTradeValidation();
    }
    
    selectBuyCrypto(event) {
        const crypto = event.currentTarget.dataset.crypto;
        
        // Can't buy the same crypto you're selling
        if (crypto === this.selectedSellCrypto) {
            this.showError('You cannot trade the same cryptocurrency with itself!');
            return;
        }
        
        // Remove selected class from all buy options
        this.buyOptionsTarget.querySelectorAll('.crypto-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        event.currentTarget.classList.add('selected');
        this.selectedBuyCrypto = crypto;
        
        this.updateTradeSummary();
        this.updateTradeValidation();
    }
    
    updateSellAmount(event) {
        const amount = parseFloat(event.currentTarget.value) || 0;
        const cryptoInfo = this.cryptoData[this.selectedSellCrypto];
        
        if (cryptoInfo && amount > cryptoInfo.balance) {
            this.showError(`Insufficient balance! You only have $${cryptoInfo.balance.toFixed(2)} of ${cryptoInfo.name}.`);
            event.currentTarget.value = cryptoInfo.balance.toFixed(2);
            this.sellAmount = cryptoInfo.balance;
        } else {
            this.sellAmount = amount;
            this.hideError();
        }
        
        this.updateTradeSummary();
        this.updateTradeValidation();
    }
    
    maxSell() {
        if (!this.selectedSellCrypto) {
            this.showError('Please select a cryptocurrency to sell first!');
            return;
        }
        
        const cryptoInfo = this.cryptoData[this.selectedSellCrypto];
        this.sellAmountInputTarget.value = cryptoInfo.balance.toFixed(2);
        this.sellAmount = cryptoInfo.balance;
        
        this.updateTradeSummary();
        this.updateTradeValidation();
    }
    
    updateTradeSummary() {
        // Update selling summary
        if (this.selectedSellCrypto && this.sellAmount > 0) {
            const cryptoInfo = this.cryptoData[this.selectedSellCrypto];
            this.sellingSummaryTarget.innerHTML = `
                <span style="color: ${cryptoInfo.color}">${cryptoInfo.symbol}</span>
                $${this.sellAmount.toFixed(2)} ${cryptoInfo.name}
            `;
        } else {
            this.sellingSummaryTarget.textContent = 'Select crypto to sell';
        }
        
        // Update buying summary
        if (this.selectedBuyCrypto && this.sellAmount > 0 && this.selectedSellCrypto) {
            const sellInfo = this.cryptoData[this.selectedSellCrypto];
            const buyInfo = this.cryptoData[this.selectedBuyCrypto];
            
            // Calculate exchange
            const sellValue = this.sellAmount;
            const buyValueBeforeFee = (sellValue / sellInfo.price) * buyInfo.price;
            const tradingFee = buyValueBeforeFee * 0.02;
            const buyValueAfterFee = buyValueBeforeFee - tradingFee;
            
            this.buyAmountInputTarget.value = buyValueAfterFee.toFixed(2);
            
            this.buyingSummaryTarget.innerHTML = `
                <span style="color: ${buyInfo.color}">${buyInfo.symbol}</span>
                $${buyValueAfterFee.toFixed(2)} ${buyInfo.name}
            `;
            
            // Update exchange rate
            const rate = (buyValueAfterFee / sellValue).toFixed(4);
            this.exchangeRateTarget.textContent = `1 ${sellInfo.name} = ${rate} ${buyInfo.name}`;
            
            // Update trading fee
            this.tradingFeeTarget.textContent = `$${tradingFee.toFixed(2)}`;
        } else {
            this.buyingSummaryTarget.textContent = 'Select crypto to buy';
            this.buyAmountInputTarget.value = '';
            this.exchangeRateTarget.textContent = '-';
            this.tradingFeeTarget.textContent = '$0.00';
        }
    }
    
    updateTradeValidation() {
        const isValid = this.selectedSellCrypto && 
                       this.selectedBuyCrypto && 
                       this.sellAmount > 0 && 
                       this.selectedSellCrypto !== this.selectedBuyCrypto;
        
        this.tradeButtonTarget.disabled = !isValid;
    }
    
    async executeTrade() {
        if (!this.selectedSellCrypto || !this.selectedBuyCrypto || this.sellAmount <= 0) {
            this.showError('Please complete the trade setup!');
            return;
        }
        
        if (this.selectedSellCrypto === this.selectedBuyCrypto) {
            this.showError('Cannot trade the same cryptocurrency with itself!');
            return;
        }
        
        // Confirm trade
        const sellInfo = this.cryptoData[this.selectedSellCrypto];
        const buyInfo = this.cryptoData[this.selectedBuyCrypto];
        const buyAmount = parseFloat(this.buyAmountInputTarget.value);
        
        const confirmMessage = `Confirm Trade:
        
Sell: $${this.sellAmount.toFixed(2)} ${sellInfo.name}
Buy: $${buyAmount.toFixed(2)} ${buyInfo.name} (after 2% fee)

Are you sure you want to execute this trade?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Disable button
        this.tradeButtonTarget.disabled = true;
        this.tradeButtonTarget.textContent = '💱 Executing Trade...';
        
        try {
            const response = await fetch(`/api/game/${this.gameIdValue}/trade-crypto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fromCrypto: this.selectedSellCrypto,
                    toCrypto: this.selectedBuyCrypto,
                    amount: this.sellAmount
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Trade executed successfully!\n\nNew portfolio balances:\n${this.formatPortfolioUpdate(result.newPortfolio)}`);
                
                // Update local data and UI
                this.updateLocalPortfolio(result.newPortfolio);
                this.resetTradeForm();
            } else {
                this.showError(result.error || 'Failed to execute trade');
                this.tradeButtonTarget.disabled = false;
                this.tradeButtonTarget.textContent = '💱 Execute Trade';
            }
        } catch (error) {
            console.error('Error executing trade:', error);
            this.showError('Failed to execute trade. Please try again.');
            this.tradeButtonTarget.disabled = false;
            this.tradeButtonTarget.textContent = '💱 Execute Trade';
        }
    }
    
    formatPortfolioUpdate(portfolio) {
        let message = '';
        for (const [crypto, amount] of Object.entries(portfolio)) {
            const cryptoInfo = this.cryptoData[crypto];
            if (cryptoInfo && amount > 0) {
                message += `${cryptoInfo.symbol} ${cryptoInfo.name}: $${amount.toFixed(2)}\n`;
            }
        }
        return message || 'No crypto holdings';
    }
    
    updateLocalPortfolio(newPortfolio) {
        for (const [crypto, amount] of Object.entries(newPortfolio)) {
            if (this.cryptoData[crypto]) {
                this.cryptoData[crypto].balance = amount;
            }
        }
        
        // Update UI balances
        this.updateBalanceDisplays();
    }
    
    updateBalanceDisplays() {
        this.sellOptionsTarget.querySelectorAll('.crypto-option').forEach(option => {
            const crypto = option.dataset.crypto;
            const cryptoInfo = this.cryptoData[crypto];
            if (cryptoInfo) {
                const balanceEl = option.querySelector('.crypto-balance');
                if (balanceEl) {
                    balanceEl.textContent = `Balance: $${cryptoInfo.balance.toFixed(2)}`;
                }
                
                // Disable if no balance
                if (cryptoInfo.balance <= 0) {
                    option.classList.add('disabled');
                } else {
                    option.classList.remove('disabled');
                }
            }
        });
    }
    
    resetTradeForm() {
        // Clear selections
        this.element.querySelectorAll('.crypto-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.selectedSellCrypto = null;
        this.selectedBuyCrypto = null;
        this.sellAmount = 0;
        
        // Clear inputs
        this.sellAmountInputTarget.value = '';
        this.buyAmountInputTarget.value = '';
        
        // Reset summaries
        this.sellingSummaryTarget.textContent = 'Select crypto to sell';
        this.buyingSummaryTarget.textContent = 'Select crypto to buy';
        this.exchangeRateTarget.textContent = '-';
        this.tradingFeeTarget.textContent = '$0.00';
        
        // Reset button
        this.tradeButtonTarget.disabled = true;
        this.tradeButtonTarget.textContent = '💱 Execute Trade';
        
        this.hideError();
    }
    
    showError(message) {
        this.errorMessageTarget.textContent = message;
        this.errorMessageTarget.style.display = 'block';
    }
    
    hideError() {
        this.errorMessageTarget.style.display = 'none';
    }
}
