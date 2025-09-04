import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Replace with your API keys
const API_KEYS = {
  alphaVantage: 'YOUR_ALPHA_VANTAGE_API_KEY',
  finnhub: 'YOUR_FINNHUB_API_KEY',
  marketstack: 'YOUR_MARKETSTACK_API_KEY',
  twelveData: 'YOUR_TWELVE_DATA_API_KEY',
};

app.use(express.static(path.join(__dirname, 'public')));

const fetchAlphaVantageData = async (ticker) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEYS.alphaVantage}`;
  const res = await axios.get(url);
  return res.data;
};

const fetchFinnhubData = async (ticker) => {
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEYS.finnhub}`;
  const res = await axios.get(url);
  return res.data;
};

const fetchMarketstackData = async (ticker) => {
  const url = `http://api.marketstack.com/v1/eod?access_key=${API_KEYS.marketstack}&symbols=${ticker}`;
  const res = await axios.get(url);
  return res.data;
};

const fetchTwelveData = async (ticker) => {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&apikey=${API_KEYS.twelveData}`;
  const res = await axios.get(url);
  return res.data;
};

app.get('/api/stock/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  if (!ticker) return res.json({ error: 'Invalid ticker symbol' });

  try {
    const [alphaVantage, finnhub, marketstack, twelveData] = await Promise.all([
      fetchAlphaVantageData(ticker),
      fetchFinnhubData(ticker),
      fetchMarketstackData(ticker),
      fetchTwelveData(ticker),
    ]);

    res.json({ alphaVantage, finnhub, marketstack, twelveData });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
