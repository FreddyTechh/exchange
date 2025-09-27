// Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    const icon = hamburger.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  /* ================= CONFIG ================ */
  const MANUAL_FALLBACK_USDT_NGN = 1499.43;
  const COINS = [
    { key: 'usdt', id: 'tether', label: 'USDT' },
    { key: 'usdc', id: 'usd-coin', label: 'USDC' },
    { key: 'btc',  id: 'bitcoin', label: 'BTC' },
    { key: 'eth',  id: 'ethereum', label: 'ETH' }
  ];
  const BINANCE_P2P_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
  const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
  const FOREX_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

  let state = { marketUSDT_NGN: null, coinUsd: {}, source: "--" };

  // Helpers
  function fmtNgn(n){
    if (n == null || !isFinite(n)) return '₦ --';
    return '₦ ' + Math.round(n).toLocaleString('en-NG');
  }
  function deducedUSDTRate(usdAmount){
    return (usdAmount >= 600) ? state.marketUSDT_NGN - 35 : state.marketUSDT_NGN - 50;
  }

  const yourListEl = document.getElementById('your-list');
  function buildRows(){
    yourListEl.innerHTML = '';
    COINS.forEach(c => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<div class="coin">${c.label}</div><div class="price" id="${c.key}-your">₦ --</div>`;
      yourListEl.appendChild(row);
    });
  }
  buildRows();

  // Fetch Binance verified P2P USDT → NGN
  async function fetchBinanceUSDT(){
    try{
      const payload = { asset:"USDT",fiat:"NGN",merchantCheck:true,tradeType:"SELL",page:1,rows:10 };
      const resp = await fetch(BINANCE_P2P_URL,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const json = await resp.json();
      const prices = json?.data?.map(i=>parseFloat(i.adv.price)) || [];
      if (!prices.length) return null;
      prices.sort((a,b)=>a-b);
      return prices.slice(0,3).reduce((s,v)=>s+v,0)/3;
    }catch(e){ return null; }
  }

  // Fetch spot USD→NGN (Forex API)
  async function fetchSpotUsdToNgnRate() {
    try {
      const resp = await fetch(FOREX_URL);
      if (!resp.ok) return null;
      const json = await resp.json();
      return json.rates?.NGN || null;
    } catch(err) { return null; }
  }

  // Fetch CoinGecko USD prices
  async function fetchCoinGecko(){
    const ids = COINS.map(c=>c.id).join(',');
    const url = `${COINGECKO_URL}?ids=${ids}&vs_currencies=usd`;
    const resp = await fetch(url);
    const json = await resp.json();
    const out = {};
    COINS.forEach(c => out[c.id] = json[c.id]?.usd || null);
    return out;
  }

  // Update UI
  function updateDisplays(){
    COINS.forEach(c=>{
      const el = document.getElementById(`${c.key}-your`);
      const usdPrice = state.coinUsd[c.id];
      if (!usdPrice || !state.marketUSDT_NGN){
        el.textContent = '₦ --'; return;
      }
      const ngn = usdPrice * (state.marketUSDT_NGN - 50);
      el.textContent = fmtNgn(ngn);
    });
  }

  // Refresh all sources
  async function refreshAll(){
    let usdt = await fetchBinanceUSDT();
    if (usdt == null) {
      const spot = await fetchSpotUsdToNgnRate();
      if (spot != null) { usdt = spot; state.source = 'Spot fallback'; }
      else { usdt = MANUAL_FALLBACK_USDT_NGN; state.source = 'Manual fallback'; }
    } else {
      state.source = 'Binance P2P verified';
    }

    state.marketUSDT_NGN = usdt;
    state.coinUsd = await fetchCoinGecko();
    updateDisplays();

    document.getElementById('last-updated').textContent = 'Updated: ' + new Date().toLocaleTimeString();
    document.getElementById('source-indicator').textContent = 'Source: ' + state.source;
  }

  refreshAll();
  setInterval(refreshAll, 60000);

  // Calculator
  document.getElementById('calc-btn').addEventListener('click',()=>{
    const coinKey = document.getElementById('calc-coin').value;
    const amt = parseFloat(document.getElementById('calc-amount').value);
    if (!amt) return document.getElementById('calc-output').textContent='Enter valid amount.';
    const coin = COINS.find(c=>c.key===coinKey);
    const usdPrice = state.coinUsd[coin.id];
    if (!usdPrice) return;
    const usdValue = amt * usdPrice;
    const ngn = usdValue * deducedUSDTRate(usdValue);
    document.getElementById('calc-output').textContent = 'You will receive: ' + fmtNgn(ngn);
  });