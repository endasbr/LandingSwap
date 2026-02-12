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
        title: 'Landing Swap - Crypto Landing Page',
        rate: '...' // Akan diupdate oleh JS di client
    });
});

// In-memory cache untuk menyimpan harga sementara
const priceCache = {
    data: {},
    lastUpdated: 0,
    TTL: 60 * 1000 // Cache berlaku selama 60 detik
};

// Fallback prices (Harga kasar jika API gagal)
const FALLBACK_PRICES = {
    'bitcoin': 64000,
    'ethereum': 3450,
    'binancecoin': 590,
    'tether': 1,
    'solana': 148,
    'cardano': 0.45,
    'ripple': 0.61,
    'polkadot': 7.2
};

// API endpoint untuk swap dengan harga REAL-TIME + Caching & Fallback
app.post('/api/swap', async (req, res) => {
    const { fromAmount, fromToken, toToken } = req.body;

    try {
        const fromId = COINGECKO_IDS[fromToken];
        const toId = COINGECKO_IDS[toToken];

        if (!fromId || !toId) {
            return res.status(400).json({ success: false, message: 'Token not supported' });
        }

        const now = Date.now();
        let prices = {};

        // 1. Cek apakah cache masih valid
        if (priceCache.lastUpdated && (now - priceCache.lastUpdated < priceCache.TTL)) {
            prices = priceCache.data;
        } else {
            try {
                // 2. Jika cache expired/kosong, ambil dari CoinGecko
                const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                    params: {
                        ids: Object.values(COINGECKO_IDS).join(','),
                        vs_currencies: 'usd'
                    },
                    timeout: 5000 // 5 detik timeout
                });

                prices = response.data;
                // Update cache
                priceCache.data = prices;
                priceCache.lastUpdated = now;
            } catch (apiError) {
                console.warn('⚠️ CoinGecko Limit/Error, menggunakan fallback/cache lama:', apiError.message);

                // 3. Jika API gagal (Error 429), gunakan cache lama atau fallback statis
                prices = priceCache.data && Object.keys(priceCache.data).length > 0
                    ? priceCache.data
                    : Object.keys(FALLBACK_PRICES).reduce((acc, key) => {
                        acc[key] = { usd: FALLBACK_PRICES[key] };
                        return acc;
                    }, {});
            }
        }

        const fromPrice = prices[fromId]?.usd || FALLBACK_PRICES[fromId];
        const toPrice = prices[toId]?.usd || FALLBACK_PRICES[toId];

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
            cached: now - priceCache.lastUpdated < priceCache.TTL
        });

    } catch (error) {
        console.error('General Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal processing error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});