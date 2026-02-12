const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Halaman utama
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Binance Swap - Crypto Landing Page',
        rate: 28.64
    });
});

// API endpoint untuk simulasi swap
app.post('/api/swap', (req, res) => {
    const { fromAmount, fromToken, toToken } = req.body;

    // Mock rates (relative to USD)
    const baseRates = {
        'BTC': 62000,
        'ETH': 3200,
        'BNB': 580,
        'USDT': 1,
        'SOL': 145,
        'ADA': 0.45,
        'XRP': 0.62,
        'DOT': 7.5
    };

    const fromPrice = baseRates[fromToken] || 1;
    const toPrice = baseRates[toToken] || 1;

    // Calculate rate: how many toToken for 1 fromToken
    const rate = fromPrice / toPrice;

    // Add a bit of "market" volatility simulation
    const volatility = 1 + (Math.random() * 0.002 - 0.001); // +/- 0.1%
    const finalRate = rate * volatility;

    const toAmount = parseFloat(fromAmount) * finalRate;

    res.json({
        success: true,
        fromAmount,
        fromToken,
        toAmount: toAmount.toFixed(6),
        toToken,
        rate: finalRate.toFixed(6)
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});