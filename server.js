const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Mapping simbol token ke ID CoinGecko
const COINGECKO_IDS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'USDT': 'tether',
    'SOL': 'solana',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'DOT': 'polkadot'
};

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
        rate: '...' // Akan diupdate oleh JS di client
    });
});

// API endpoint untuk swap dengan harga REAL-TIME
app.post('/api/swap', async (req, res) => {
    const { fromAmount, fromToken, toToken } = req.body;

    try {
        const fromId = COINGECKO_IDS[fromToken];
        const toId = COINGECKO_IDS[toToken];

        if (!fromId || !toId) {
            return res.status(400).json({ success: false, message: 'Token not supported' });
        }

        // Fetch harga dari CoinGecko (Free API)
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
            params: {
                ids: `${fromId},${toId}`,
                vs_currencies: 'usd'
            }
        });

        const fromPrice = response.data[fromId].usd;
        const toPrice = response.data[toId].usd;

        // Hitung rate
        const rate = fromPrice / toPrice;
        const toAmount = parseFloat(fromAmount) * rate;

        res.json({
            success: true,
            fromAmount,
            fromToken,
            toAmount: toAmount.toFixed(6),
            toToken,
            rate: rate.toFixed(8),
            realTime: true
        });

    } catch (error) {
        console.error('CoinGecko API Error:', error.message);

        // Fallback jika API limit atau error
        res.status(500).json({
            success: false,
            message: 'Failed to fetch real-time price',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});