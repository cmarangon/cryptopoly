/**
 * Themed Dialog Module for CryptoPoly
 * 
 * Provides beautiful, game-themed dialogs to replace browser alerts
 */

export class ThemedDialog {
    static show(title, message, type = 'info', showCancel = false) {
        return new Promise((resolve) => {
            // Remove any existing dialog
            const existingDialog = document.querySelector('.crypto-dialog');
            if (existingDialog) {
                existingDialog.close();
                existingDialog.remove();
            }
            
            // Create native dialog element
            const dialog = document.createElement('dialog');
            dialog.className = `crypto-dialog crypto-dialog--${type}`;
            
            // Icon based on type
            const icons = {
                'info': '💬',
                'warning': '⚠️',
                'error': '❌',
                'success': '✅'
            };
            const icon = icons[type] || icons['info'];
            
            dialog.innerHTML = `
                <div class="crypto-dialog__content">
                    <div class="crypto-dialog__icon">${icon}</div>
                    <h3 class="crypto-dialog__title crypto-dialog__title--${type}">${title}</h3>
                    <p class="crypto-dialog__message">${message}</p>
                    <div class="crypto-dialog__buttons">
                        ${showCancel ? `<button class="crypto-dialog__button crypto-dialog__button--cancel cancel-btn" type="button">Cancel</button>` : ''}
                        <button class="crypto-dialog__button crypto-dialog__button--confirm ${type} confirm-btn" type="button">${showCancel ? 'Confirm' : 'OK'}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            // Handle button clicks
            const confirmBtn = dialog.querySelector('.confirm-btn');
            const cancelBtn = dialog.querySelector('.cancel-btn');
            
            const cleanup = () => {
                dialog.close();
                dialog.remove();
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
            
            // Close on backdrop click (native dialog behavior)
            dialog.addEventListener('click', (e) => {
                const rect = dialog.getBoundingClientRect();
                const isInDialog = (
                    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width
                );
                
                if (!isInDialog) {
                    cleanup();
                    resolve(false);
                }
            });
            
            // Close on Escape key (native dialog behavior, but we want to handle resolve)
            dialog.addEventListener('close', () => {
                cleanup();
                resolve(false);
            });
            
            // Show the dialog as modal
            dialog.showModal();
        });
    }
    
    // Convenience methods for different dialog types
    static info(title, message, showCancel = false) {
        return this.show(title, message, 'info', showCancel);
    }
    
    static warning(title, message, showCancel = false) {
        return this.show(title, message, 'warning', showCancel);
    }
    
    static error(title, message, showCancel = false) {
        return this.show(title, message, 'error', showCancel);
    }
    
    static success(title, message, showCancel = false) {
        return this.show(title, message, 'success', showCancel);
    }
    
    static confirm(title, message, type = 'info') {
        return this.show(title, message, type, true);
    }
}