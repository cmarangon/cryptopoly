import { Controller } from '@hotwired/stimulus'
import Chart from 'chart.js/auto'

export default class extends Controller {
    static targets = ['canvas']
    static values = { 
        gameId: Number,
        cryptoName: String,
        chartData: Array
    }

    connect() {
        this.loadPriceHistory()
    }

    disconnect() {
        if (this.chart) {
            this.chart.destroy()
        }
    }

    initializeChart() {
        const ctx = this.canvasTarget.getContext('2d')
        
        const chartData = this.chartDataValue || []
        const labels = chartData.map(point => `Turn ${point.turn}`)
        const prices = chartData.map(point => point.price)

        // Get crypto color from CSS custom properties or default colors
        const cryptoColors = {
            bitcoin: '#f7931a',
            ethereum: '#627eea', 
            dogecoin: '#c2a633',
            tether: '#00d4aa',
            binance: '#f0b90b',
            cardano: '#1652f0'
        }

        const cryptoColor = cryptoColors[this.cryptoNameValue] || '#00ffff'

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${this.cryptoNameValue} Price`,
                    data: prices,
                    borderColor: cryptoColor,
                    backgroundColor: cryptoColor + '20', // Add transparency
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: cryptoColor,
                    pointBorderColor: cryptoColor,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#00ffff',
                        bodyColor: '#ffffff',
                        borderColor: cryptoColor,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#cccccc',
                            font: {
                                family: "'Courier New', monospace",
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: '#cccccc',
                            font: {
                                family: "'Courier New', monospace",
                                size: 11
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(2)
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        })
    }

    updateChart(newData) {
        if (!this.chart) {
            this.chartDataValue = newData
            this.initializeChart()
            return
        }

        const labels = newData.map(point => `Turn ${point.turn}`)
        const prices = newData.map(point => point.price)

        this.chart.data.labels = labels
        this.chart.data.datasets[0].data = prices
        this.chart.update('active')
    }

    chartDataValueChanged() {
        if (this.chart && this.chartDataValue) {
            this.updateChart(this.chartDataValue)
        }
    }

    async loadPriceHistory() {
        try {
            const response = await fetch(`/api/game/${this.gameIdValue}/price-history`)
            const data = await response.json()
            
            if (data.success && data.priceHistory[this.cryptoNameValue]) {
                const cryptoHistory = data.priceHistory[this.cryptoNameValue]
                this.chartDataValue = cryptoHistory.data
                this.initializeChart()
            } else {
                // Initialize empty chart if no data
                this.chartDataValue = []
                this.initializeChart()
            }
        } catch (error) {
            console.error('Failed to load price history:', error)
            // Initialize empty chart on error
            this.chartDataValue = []
            this.initializeChart()
        }
    }
}