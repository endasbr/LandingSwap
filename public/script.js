// Burger Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const burgerIcon = document.getElementById('burgerIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    function openMenu() {
        burgerIcon.classList.add('open');
        mobileMenu.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        burgerIcon.classList.remove('open');
        mobileMenu.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (burgerIcon) {
        burgerIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            if (mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            closeMenu();
        });
    }

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) {
            closeMenu();
            document.body.style.overflow = '';
        }
    });

    // ---------- SWAP LOGIC WITH NODE.JS API ----------
    const fromInput = document.getElementById('fromAmount');
    const toInput = document.getElementById('toAmount');
    const swapBtn = document.getElementById('swapNowBtn');
    const swapIcon = document.getElementById('swapIcon');
    const fromTokenText = document.getElementById('fromTokenText');
    const toTokenText = document.getElementById('toTokenText');
    const fromTokenIcon = document.querySelector('#fromTokenSelector .token-icon');
    const toTokenIcon = document.querySelector('#toTokenSelector .token-icon');
    const rateValue = document.getElementById('rateValue');

    // Function to fetch swap rate from server
    async function calculateSwap(fromAmount, fromToken, toToken) {
        try {
            const response = await fetch('/api/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fromAmount, fromToken, toToken })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    // Update to amount when from amount changes (With Simple Debounce to save API)
    let debounceTimer;
    fromInput.addEventListener('input', function (e) {
        clearTimeout(debounceTimer);
        const fromAmount = e.target.value || '0';
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;

        if (parseFloat(fromAmount) >= 0) {
            debounceTimer = setTimeout(async () => {
                const result = await calculateSwap(fromAmount, fromToken, toToken);
                if (result && result.success) {
                    toInput.value = result.toAmount;
                    updateRateDisplay(fromToken, toToken, result.rate);
                }
            }, 400); // 400ms debounce
        }
    });

    // Swap tokens when swap icon clicked
    // Swap tokens when swap icon clicked
    swapIcon.addEventListener('click', function () {
        swapTokens();
    });

    function updateRateDisplay(fromToken, toToken, rate) {
        rateValue.innerText = `1 ${fromToken} ≈ ${rate} ${toToken}`;
    }

    swapBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const fromAmt = fromInput.value || '0';
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;

        if (parseFloat(fromAmt) <= 0) {
            alert('❌ Please enter a valid amount');
            return;
        }

        const result = await calculateSwap(fromAmt, fromToken, toToken);
        if (result && result.success) {
            alert(`✅ Swap Successful (Simulated)!\n\n` +
                `You swapped: ${result.fromAmount} ${result.fromToken}\n` +
                `You received: ${result.toAmount} ${result.toToken}\n` +
                `(Demo - No real transaction occurred)`);
        } else {
            alert('❌ Swap failed. Please try again.');
        }
    });

    // ---------- TOKEN MODAL ----------
    const tokenModal = document.getElementById('tokenModal');
    const tokens = [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿', class: 'btc-icon', color: '#f7931a' },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', class: 'eth-icon', color: '#627eea' },
        { symbol: 'BNB', name: 'Binance Coin', icon: 'B', class: 'bnb-bg', color: '#f0b90b' },
        { symbol: 'USDT', name: 'Tether', icon: '₮', class: 'usdt-icon', color: '#26a17b' },
        { symbol: 'SOL', name: 'Solana', icon: 'S', class: 'sol-icon', color: '#14f195' },
        { symbol: 'ADA', name: 'Cardano', icon: 'A', class: 'ada-icon', color: '#0033ad' },
        { symbol: 'XRP', name: 'Ripple', icon: 'X', class: 'xrp-icon', color: '#23292f' },
        { symbol: 'DOT', name: 'Polkadot', icon: 'P', class: 'dot-icon', color: '#e6007a' }
    ];

    let activeSelectionSide = 'from';

    function openTokenModal(side) {
        activeSelectionSide = side;
        tokenModal.classList.add('active');
        renderTokens();
    }

    function closeModal() {
        tokenModal.classList.remove('active');
    }

    function renderTokens(filter = '') {
        const tokenList = document.getElementById('tokenList');
        tokenList.innerHTML = '';
        const filtered = tokens.filter(t => t.symbol.toLowerCase().includes(filter.toLowerCase()));

        filtered.forEach(token => {
            const item = document.createElement('div');
            item.className = 'token-item';
            item.innerHTML = `
                <div class="token-item-icon ${token.class || ''}" style="${!token.class ? `background: ${token.color};` : ''}">${token.icon}</div>
                <div class="token-item-info">
                    <span class="token-item-symbol">${token.symbol}</span>
                    <span class="token-item-name">${token.name}</span>
                </div>
            `;
            item.addEventListener('click', () => selectToken(token));
            tokenList.appendChild(item);
        });
    }

    function selectToken(token) {
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;

        if (activeSelectionSide === 'from') {
            // Jika memilih token yang sama dengan 'To', tukar saja
            if (token.symbol === toToken) {
                swapTokens();
                closeModal();
                return;
            }
            fromTokenText.innerText = token.symbol;
            updateTokenUI(fromTokenIcon, token);
        } else {
            // Jika memilih token yang sama dengan 'From', tukar saja
            if (token.symbol === fromToken) {
                swapTokens();
                closeModal();
                return;
            }
            toTokenText.innerText = token.symbol;
            updateTokenUI(toTokenIcon, token);
        }
        closeModal();
        triggerCalculate(fromInput.value);
    }

    function updateTokenUI(element, token) {
        element.innerText = token.icon;
        element.className = `token-icon ${token.class || ''}`;
        if (!token.class && token.color) {
            element.style.background = token.color;
            element.style.color = 'white';
        } else {
            element.style.background = '';
            element.style.color = '';
        }
    }

    function swapTokens() {
        // Swap token texts
        const tempToken = fromTokenText.innerText;
        fromTokenText.innerText = toTokenText.innerText;
        toTokenText.innerText = tempToken;

        // Swap icons & styles
        const tempIconHtml = fromTokenIcon.innerHTML;
        const tempIconClass = fromTokenIcon.className;
        const tempIconBg = fromTokenIcon.style.background;
        const tempIconColor = fromTokenIcon.style.color;

        fromTokenIcon.innerHTML = toTokenIcon.innerHTML;
        fromTokenIcon.className = toTokenIcon.className;
        fromTokenIcon.style.background = toTokenIcon.style.background;
        fromTokenIcon.style.color = toTokenIcon.style.color;

        toTokenIcon.innerHTML = tempIconHtml;
        toTokenIcon.className = tempIconClass;
        toTokenIcon.style.background = tempIconBg;
        toTokenIcon.style.color = tempIconColor;

        // Swap amounts
        const fromVal = fromInput.value;
        const toVal = toInput.value;
        fromInput.value = toVal;
        toInput.value = fromVal;

        triggerCalculate(fromInput.value);
    }

    async function triggerCalculate(amount) {
        const fToken = fromTokenText.innerText;
        const tToken = toTokenText.innerText;
        if (!amount || parseFloat(amount) < 0) return;

        const result = await calculateSwap(amount, fToken, tToken);
        if (result && result.success) {
            toInput.value = result.toAmount;
            updateRateDisplay(fToken, tToken, result.rate);
        }
    }

    document.getElementById('fromTokenSelector').addEventListener('click', () => openTokenModal('from'));
    document.getElementById('toTokenSelector').addEventListener('click', () => openTokenModal('to'));
    document.getElementById('closeTokenModal').addEventListener('click', closeModal);

    // ---------- AUTH MODALS ----------
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    window.openAuthModal = function (type) {
        if (type === 'login') {
            loginModal.classList.add('active');
            signupModal.classList.remove('active');
        } else {
            signupModal.classList.add('active');
            loginModal.classList.remove('active');
        }
    }

    window.closeAuthModal = function () {
        loginModal.classList.remove('active');
        signupModal.classList.remove('active');
    }

    document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('signup'));

    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            openAuthModal('login');
            closeMenu();
        });
    }

    if (mobileSignupBtn) {
        mobileSignupBtn.addEventListener('click', () => {
            openAuthModal('signup');
            closeMenu();
        });
    }

    document.getElementById('closeLoginModal').addEventListener('click', closeAuthModal);
    document.getElementById('closeSignupModal').addEventListener('click', closeAuthModal);
    document.getElementById('toSignup').addEventListener('click', (e) => { e.preventDefault(); openAuthModal('signup'); });
    document.getElementById('toLogin').addEventListener('click', (e) => { e.preventDefault(); openAuthModal('login'); });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeAuthModal();
        }
    });

    // ---------- WALLET CONNECTION LOGIC ----------
    const walletModal = document.getElementById('walletModal');
    const connectBtn = document.getElementById('connectWalletBtn');
    const mobileConnectBtn = document.getElementById('mobileConnectBtn');
    const closeWalletBtn = document.getElementById('closeWalletModal');
    const metaMaskBtn = document.getElementById('metaMaskBtn');
    const trustWalletBtn = document.getElementById('trustWalletBtn');
    const coinbaseBtn = document.getElementById('coinbaseBtn');

    let walletState = {
        connected: localStorage.getItem('walletConnected') === 'true',
        address: localStorage.getItem('walletAddress') || ''
    };

    function updateWalletUI() {
        if (walletState.connected) {
            const shortAddr = walletState.address.substring(0, 6) + '...' + walletState.address.substring(walletState.address.length - 4);
            const html = `<i class="fas fa-check-circle"></i> ${shortAddr}`;
            connectBtn.innerHTML = html;
            connectBtn.classList.add('connected');
            if (mobileConnectBtn) {
                mobileConnectBtn.innerHTML = html;
                mobileConnectBtn.classList.add('connected');
            }
        } else {
            const html = `<i class="fas fa-wallet"></i> Connect Wallet`;
            connectBtn.innerHTML = html;
            connectBtn.classList.remove('connected');
            if (mobileConnectBtn) {
                mobileConnectBtn.innerHTML = html;
                mobileConnectBtn.classList.remove('connected');
            }
        }
    }

    async function connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                walletState.connected = true;
                walletState.address = accounts[0];
                saveWalletState();
                updateWalletUI();
                closeWalletModal();
                alert('✅ MetaMask Connected!');
            } catch (err) {
                console.error(err);
                alert('❌ Connection failed');
            }
        } else {
            alert('🦊 Please install MetaMask!');
            window.open('https://metamask.io/download/', '_blank');
        }
    }

    function simulateConnection(name) {
        walletState.connected = true;
        walletState.address = '0x' + Math.random().toString(16).slice(2, 42); // Random mock address
        saveWalletState();
        updateWalletUI();
        closeWalletModal();
        alert(`✅ Connected to ${name} (Simulation)`);
    }

    function saveWalletState() {
        localStorage.setItem('walletConnected', walletState.connected);
        localStorage.setItem('walletAddress', walletState.address);
    }

    function closeWalletModal() {
        walletModal.classList.remove('active');
    }

    function handleConnectClick() {
        if (walletState.connected) {
            if (confirm('Do you want to disconnect?')) {
                walletState.connected = false;
                walletState.address = '';
                saveWalletState();
                updateWalletUI();
            }
        } else {
            walletModal.classList.add('active');
        }
    }

    connectBtn.addEventListener('click', handleConnectClick);
    if (mobileConnectBtn) {
        mobileConnectBtn.addEventListener('click', () => {
            handleConnectClick();
            closeMenu();
        });
    }

    // Close mobile menu when links are clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    closeWalletBtn.addEventListener('click', closeWalletModal);

    metaMaskBtn.addEventListener('click', connectMetaMask);
    trustWalletBtn.addEventListener('click', () => simulateConnection('Trust Wallet'));
    coinbaseBtn.addEventListener('click', () => simulateConnection('Coinbase Wallet'));

    // Init Wallet UI
    updateWalletUI();

    // Close on overlay click
    [loginModal, signupModal, tokenModal, walletModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAuthModal();
                    closeModal();
                    closeWalletModal();
                }
            });
        }
    });

    const tokenSearchInput = document.getElementById('tokenSearchInput');
    if (tokenSearchInput) {
        tokenSearchInput.addEventListener('input', (e) => {
            renderTokens(e.target.value);
        });
    }
});