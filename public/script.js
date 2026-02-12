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

    let currentRate = 28.64; // BTC to ETH

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
    swapIcon.addEventListener('click', async function () {
        // Swap token texts
        const tempToken = fromTokenText.innerText;
        fromTokenText.innerText = toTokenText.innerText;
        toTokenText.innerText = tempToken;

        // Swap icons
        const tempIconHtml = fromTokenIcon.innerHTML;
        const tempIconClass = fromTokenIcon.className;
        fromTokenIcon.innerHTML = toTokenIcon.innerHTML;
        fromTokenIcon.className = toTokenIcon.className;
        toTokenIcon.innerHTML = tempIconHtml;
        toTokenIcon.className = tempIconClass;

        // Swap amounts
        const fromVal = fromInput.value;
        const toVal = toInput.value;
        fromInput.value = toVal;
        toInput.value = fromVal;

        // Update rate display
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;

        // Trigger calculation with new from amount
        if (fromInput.value && parseFloat(fromInput.value) >= 0) {
            const result = await calculateSwap(fromInput.value, fromToken, toToken);
            if (result && result.success) {
                toInput.value = result.toAmount;
                updateRateDisplay(fromToken, toToken, result.rate);
            }
        }
    });

    // Update rate display
    function updateRateDisplay(fromToken, toToken, rate) {
        rateValue.innerText = `1 ${fromToken} ≈ ${rate} ${toToken}`;
    }

    // Swap button click
    swapBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        const fromAmt = fromInput.value || '0';
        const toAmt = toInput.value || '0';
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;

        if (parseFloat(fromAmt) <= 0) {
            alert('❌ Please enter a valid amount');
            return;
        }

        // Call API again to get latest rate
        const result = await calculateSwap(fromAmt, fromToken, toToken);

        if (result && result.success) {
            alert(`✅ Swap Successful (Simulated)!\n\n` +
                `You swapped: ${result.fromAmount} ${result.fromToken}\n` +
                `You received: ${result.toAmount} ${result.toToken}\n` +
                `Rate: 1 ${result.fromToken} ≈ ${result.rate} ${result.toToken}\n\n` +
                `(Demo - No real transaction occurred)`);
        } else {
            alert('❌ Swap failed. Please try again.');
        }
    });

    // Initial calculation
    setTimeout(async () => {
        if (fromInput.value) {
            const result = await calculateSwap(fromInput.value, 'BTC', 'ETH');
            if (result && result.success) {
                toInput.value = result.toAmount;
            }
        }
    }, 100);

    // ---------- NEW: TOKEN MODAL LOGIC ----------
    const tokenModal = document.getElementById('tokenModal');
    const closeTokenModal = document.getElementById('closeTokenModal');
    const tokenSearchInput = document.getElementById('tokenSearchInput');
    const tokenList = document.getElementById('tokenList');
    const fromTokenSelector = document.getElementById('fromTokenSelector');
    const toTokenSelector = document.getElementById('toTokenSelector');

    let activeSelectionSide = 'from'; // 'from' or 'to'

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

    function renderTokens(filter = '') {
        tokenList.innerHTML = '';
        const filteredTokens = tokens.filter(t =>
            t.symbol.toLowerCase().includes(filter.toLowerCase()) ||
            t.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredTokens.length === 0) {
            tokenList.innerHTML = '<div class="no-results">No tokens found</div>';
            return;
        }

        filteredTokens.forEach(token => {
            const item = document.createElement('div');
            item.className = 'token-item';

            // Check if selected
            const currentFrom = fromTokenText.innerText;
            const currentTo = toTokenText.innerText;
            if ((activeSelectionSide === 'from' && token.symbol === currentFrom) ||
                (activeSelectionSide === 'to' && token.symbol === currentTo)) {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <div class="token-item-icon ${token.class || ''}" style="${!token.class ? `background: ${token.color}; color: white;` : ''}">
                    ${token.icon}
                </div>
                <div class="token-item-info">
                    <span class="token-item-symbol">${token.symbol}</span>
                    <span class="token-item-name">${token.name}</span>
                </div>
            `;

            item.addEventListener('click', () => {
                selectToken(token);
            });

            tokenList.appendChild(item);
        });
    }

    function selectToken(token) {
        if (activeSelectionSide === 'from') {
            // Prevent same token on both sides
            if (token.symbol === toTokenText.innerText) {
                // Swap if trying to select the same
                toTokenText.innerText = fromTokenText.innerText;
                const tempIconHtml = toTokenIcon.innerHTML;
                const tempIconClass = toTokenIcon.className;
                toTokenIcon.innerHTML = fromTokenIcon.innerHTML;
                toTokenIcon.className = fromTokenIcon.className;
                fromTokenIcon.innerHTML = tempIconHtml;
                fromTokenIcon.className = tempIconClass;
            }

            fromTokenText.innerText = token.symbol;
            fromTokenIcon.innerText = token.icon;
            fromTokenIcon.className = `token-icon ${token.class || ''}`;
            if (!token.class) fromTokenIcon.style.background = token.color;
            else fromTokenIcon.style.background = '';
        } else {
            // Prevent same token on both sides
            if (token.symbol === fromTokenText.innerText) {
                fromTokenText.innerText = toTokenText.innerText;
                const tempIconHtml = fromTokenIcon.innerHTML;
                const tempIconClass = fromTokenIcon.className;
                fromTokenIcon.innerHTML = toTokenIcon.innerHTML;
                fromTokenIcon.className = toTokenIcon.className;
                toTokenIcon.innerHTML = tempIconHtml;
                toTokenIcon.className = tempIconClass;
            }

            toTokenText.innerText = token.symbol;
            toTokenIcon.innerText = token.icon;
            toTokenIcon.className = `token-icon ${token.class || ''}`;
            if (!token.class) toTokenIcon.style.background = token.color;
            else toTokenIcon.style.background = '';
        }

        closeModal();
        // Trigger calculation
        const fromAmt = fromInput.value || '0';
        triggerCalculate(fromAmt);
    }

    async function triggerCalculate(amount) {
        const fromToken = fromTokenText.innerText;
        const toToken = toTokenText.innerText;
        const result = await calculateSwap(amount, fromToken, toToken);
        if (result && result.success) {
            toInput.value = result.toAmount;
            updateRateDisplay(fromToken, toToken, result.rate);
        }
    }

    function openModal(side) {
        activeSelectionSide = side;
        tokenModal.classList.add('active');
        tokenSearchInput.value = '';
        renderTokens();
        setTimeout(() => tokenSearchInput.focus(), 100);
    }

    function closeModal() {
        tokenModal.classList.remove('active');
    }

    // Event Listeners
    fromTokenSelector.addEventListener('click', () => openModal('from'));
    toTokenSelector.addEventListener('click', () => openModal('to'));
    closeTokenModal.addEventListener('click', closeModal);

    tokenModal.addEventListener('click', (e) => {
        if (e.target === tokenModal) closeModal();
    });

    tokenSearchInput.addEventListener('input', (e) => {
        renderTokens(e.target.value);
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeAuthModal();
        }
    });

    // ---------- NEW: AUTH MODAL LOGIC ----------
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    const loginBtns = [document.getElementById('loginBtn'), document.getElementById('mobileLoginBtn')];
    const signupBtns = [document.getElementById('signupBtn'), document.getElementById('mobileSignupBtn')];

    const closeLoginBtn = document.getElementById('closeLoginModal');
    const closeSignupBtn = document.getElementById('closeSignupModal');

    const toSignup = document.getElementById('toSignup');
    const toLogin = document.getElementById('toLogin');

    function openAuthModal(type) {
        // Close mobile menu if open
        if (typeof closeMenu === 'function') closeMenu();

        if (type === 'login') {
            signupModal.classList.remove('active');
            loginModal.classList.add('active');
        } else {
            loginModal.classList.remove('active');
            signupModal.classList.add('active');
        }
    }

    function closeAuthModal() {
        loginModal.classList.remove('active');
        signupModal.classList.remove('active'); // Fixed: Should remove active from both
    }

    loginBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => openAuthModal('login'));
    });

    signupBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => openAuthModal('signup'));
    });

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeAuthModal);
    if (closeSignupBtn) closeSignupBtn.addEventListener('click', closeAuthModal);

    if (toSignup) toSignup.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('signup');
    });

    if (toLogin) toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });

    // Close on overlay click
    [loginModal, signupModal].forEach(modal => {
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModal();
        });
    });
});