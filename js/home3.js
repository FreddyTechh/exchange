 // Store current prices
    let currentPrices = {
      btc: { price: null, change: null },
      eth: { price: null, change: null },
      sol: { price: null, change: null },
      xrp: { price: null, change: null }
    };

    const cryptocurrencies = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
      { id: 'solana', symbol: 'sol', name: 'Solana' },
      { id: 'ripple', symbol: 'xrp', name: 'Ripple' }
    ];

    async function fetchCryptoPrices() {
      try {
        const ids = cryptocurrencies.map(crypto => crypto.id).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        if (!response.ok) throw new Error('CoinGecko API failed');
        return await response.json();
      } catch (error) {
        return await fetchFromBinance();
      }
    }

    async function fetchFromBinance() {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!response.ok) throw new Error('Binance API failed');
        const data = await response.json();
        const formattedData = {};
        const symbolMap = {
          btc: 'BTCUSDT',
          eth: 'ETHUSDT',
          sol: 'SOLUSDT',
          xrp: 'XRPUSDT'
        };
        cryptocurrencies.forEach(crypto => {
          const ticker = data.find(item => item.symbol === symbolMap[crypto.symbol]);
          if (ticker) {
            formattedData[crypto.id] = {
              usd: parseFloat(ticker.lastPrice),
              usd_24h_change: parseFloat(ticker.priceChangePercent)
            };
          }
        });
        return formattedData;
      } catch (error) {
        throw new Error('All APIs failed');
      }
    }

    async function updatePrices() {
      const updatedElement = document.getElementById('update-time');
      const apiStatusElement = document.getElementById('api-status');
      try {
        const cryptoData = await fetchCryptoPrices();
        apiStatusElement.textContent = 'Online';
        apiStatusElement.className = 'api-status status-online';
        cryptocurrencies.forEach(crypto => {
          const priceElement = document.getElementById(`${crypto.symbol}-price`);
          const changeElement = document.getElementById(`${crypto.symbol}-change`);
          if (cryptoData && cryptoData[crypto.id]) {
            const coinData = cryptoData[crypto.id];
            currentPrices[crypto.symbol] = {
              price: coinData.usd,
              change: coinData.usd_24h_change
            };
            const formattedPrice = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: coinData.usd < 1 ? 4 : 2
            }).format(coinData.usd);
            priceElement.textContent = '$' + formattedPrice;
            const change = coinData.usd_24h_change.toFixed(2);
            changeElement.textContent = (change > 0 ? '+' : '') + change + '% (24h)';
            changeElement.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
          }
        });
        updatedElement.textContent = 'Updated: ' + new Date().toLocaleTimeString();
      } catch (error) {
        apiStatusElement.textContent = 'Offline';
        apiStatusElement.className = 'api-status status-offline';
        updatedElement.textContent = 'Last update attempt: ' + new Date().toLocaleTimeString();
      }
    }

    updatePrices();
    setInterval(updatePrices, 30000);