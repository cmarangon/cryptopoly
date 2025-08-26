import { Controller } from '@hotwired/stimulus';

/* stimulusFetch: 'lazy' */
export default class extends Controller {
    static targets = [
        'remainingBudget', 'remainingAmount', 'startButton', 'errorMessage',
        'step1', 'step2', 'step3', 'progressLine',
        'stepCircle1', 'stepCircle2', 'stepCircle3',
        'stepLabel1', 'stepLabel2', 'stepLabel3',
        'nextButton1', 'nextButton2',
        'selectedCharacterSummary', 'remainingCashSummary', 'cryptoPortfolioSummary'
    ];
    
    connect() {
        this.currentStep = 1;
        this.selectedCharacter = null;
        this.totalBudget = 100;
        this.spentAmount = 0;
        this.cryptoAllocations = {};
        this.characterData = {
            'hacker': { emoji: '👨‍💻', name: 'Crypto Hacker' },
            'trader': { emoji: '📈', name: 'Day Trader' },
            'investor': { emoji: '💼', name: 'Investor' },
            'miner': { emoji: '⛏️', name: 'Crypto Miner' },
            'whale': { emoji: '🐋', name: 'Crypto Whale' },
            'hodler': { emoji: '💎', name: 'HODLer' }
        };
        this.cryptoData = {
            'bitcoin': { symbol: '₿', name: 'BitCoin', color: '#f7931a' },
            'ethereum': { symbol: 'Ξ', name: 'EthCoin', color: '#627eea' },
            'dogecoin': { symbol: 'Ð', name: 'DogeCoin', color: '#c2a633' },
            'tether': { symbol: '₮', name: 'TetherCoin', color: '#00d4aa' },
            'binance': { symbol: '◇', name: 'BinanceCoin', color: '#f0b90b' },
            'cardano': { symbol: '◆', name: 'CardanoCoin', color: '#1652f0' }
        };
        this.updateStepValidation();
    }
    
    selectCharacter(event) {
        // Remove selected class from all character options
        this.element.querySelectorAll('.character-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        event.currentTarget.classList.add('selected');
        this.selectedCharacter = event.currentTarget.dataset.character;
        
        this.updateStepValidation();
    }
    
    updateBudget(event) {
        const input = event.currentTarget;
        const crypto = input.dataset.crypto;
        const amount = parseFloat(input.value) || 0;
        
        // Update allocation for this crypto
        this.cryptoAllocations[crypto] = amount;
        
        // Calculate total spent
        this.spentAmount = Object.values(this.cryptoAllocations).reduce((sum, value) => sum + value, 0);
        
        const remaining = this.totalBudget - this.spentAmount;
        
        // Update remaining amount display
        this.remainingAmountTarget.textContent = remaining.toFixed(0);
        
        // Update styling based on remaining amount
        if (remaining < 0) {
            this.remainingBudgetTarget.classList.add('negative');
            this.showError('Budget exceeded! Please reduce your allocations.');
        } else {
            this.remainingBudgetTarget.classList.remove('negative');
            this.hideError();
        }
        
        this.updateStepValidation();
    }
    
    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            
            if (this.currentStep === 3) {
                this.updateSummary();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
        }
    }
    
    showStep(stepNumber) {
        // Hide all steps
        [this.step1Target, this.step2Target, this.step3Target].forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const stepTarget = stepNumber === 1 ? this.step1Target : 
                          stepNumber === 2 ? this.step2Target : 
                          this.step3Target;
        stepTarget.classList.add('active');
    }
    
    updateProgressBar() {
        // Update progress line
        this.progressLineTarget.className = 'progress-line';
        if (this.currentStep >= 2) this.progressLineTarget.classList.add('step-1');
        if (this.currentStep >= 3) this.progressLineTarget.classList.add('step-2');
        
        // Update step circles and labels
        [1, 2, 3].forEach(step => {
            const circleTarget = this[`stepCircle${step}Target`];
            const labelTarget = this[`stepLabel${step}Target`];
            
            circleTarget.classList.remove('active', 'completed');
            labelTarget.classList.remove('active', 'completed');
            
            if (step < this.currentStep) {
                circleTarget.classList.add('completed');
                labelTarget.classList.add('completed');
            } else if (step === this.currentStep) {
                circleTarget.classList.add('active');
                labelTarget.classList.add('active');
            }
        });
    }
    
    updateStepValidation() {
        // Step 1 validation
        if (this.selectedCharacter) {
            this.nextButton1Target.disabled = false;
        } else {
            this.nextButton1Target.disabled = true;
        }
        
        // Step 2 validation
        const validBudget = this.spentAmount <= this.totalBudget && this.spentAmount > 0;
        if (this.hasNextButton2Target) {
            if (validBudget) {
                this.nextButton2Target.disabled = false;
            } else {
                this.nextButton2Target.disabled = true;
            }
        }
    }
    
    updateSummary() {
        // Character summary
        const characterInfo = this.characterData[this.selectedCharacter];
        if (characterInfo) {
            this.selectedCharacterSummaryTarget.innerHTML = `
                <span class="selected-character-emoji">${characterInfo.emoji}</span>
                <span>${characterInfo.name}</span>
            `;
        }
        
        // Remaining cash summary
        const remainingCash = this.totalBudget - this.spentAmount;
        this.remainingCashSummaryTarget.textContent = `$${remainingCash}`;
        
        // Crypto portfolio summary
        let portfolioHTML = '';
        for (const [crypto, amount] of Object.entries(this.cryptoAllocations)) {
            if (amount > 0) {
                const cryptoInfo = this.cryptoData[crypto];
                if (cryptoInfo) {
                    portfolioHTML += `
                        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: ${cryptoInfo.color}; font-size: 1.2rem; margin-right: 0.5rem;">${cryptoInfo.symbol}</span>
                            <span style="margin-right: 0.5rem;">${cryptoInfo.name}:</span>
                            <span style="color: #2ecc71; font-weight: bold;">$${amount}</span>
                        </div>
                    `;
                }
            }
        }
        
        if (portfolioHTML === '') {
            portfolioHTML = '<span style="opacity: 0.7;">No crypto investments</span>';
        }
        
        this.cryptoPortfolioSummaryTarget.innerHTML = portfolioHTML;
    }
    
    showError(message) {
        this.errorMessageTarget.textContent = message;
        this.errorMessageTarget.style.display = 'block';
    }
    
    hideError() {
        this.errorMessageTarget.style.display = 'none';
    }
    
    async startGame(event) {
        // Final validation
        if (!this.selectedCharacter) {
            this.showError('Please select a character first!');
            return;
        }
        
        if (this.spentAmount <= 0) {
            this.showError('Please allocate some money to cryptocurrencies!');
            return;
        }
        
        if (this.spentAmount > this.totalBudget) {
            this.showError('Your allocations exceed the budget!');
            return;
        }
        
        // Disable button and show loading
        this.startButtonTarget.disabled = true;
        this.startButtonTarget.textContent = '🚀 Creating Game...';
        
        // Prepare game data
        const gameData = {
            character: this.selectedCharacter,
            cryptoAllocations: this.cryptoAllocations,
            remainingCash: this.totalBudget - this.spentAmount
        };
        
        try {
            // Send to server to create game
            const response = await fetch('/api/game/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Redirect to game
                window.location.href = result.redirectUrl;
            } else {
                this.showError(result.error || 'Failed to create game');
                this.startButtonTarget.disabled = false;
                this.startButtonTarget.textContent = '🚀 Start Game';
            }
        } catch (error) {
            console.error('Error creating game:', error);
            this.showError('Failed to create game. Please try again.');
            this.startButtonTarget.disabled = false;
            this.startButtonTarget.textContent = '🚀 Start Game';
        }
    }
}
