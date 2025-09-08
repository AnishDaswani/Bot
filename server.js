import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Replace with your Alpha Vantage API key
const ALPHA_VANTAGE_API_KEY = 'N4DTXMAJAN9JIZWC';

// Example tickers (expand as needed)
const TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'TSLA', 'NVDA', 'JPM', 'V', 'UNH'
];

app.use(express.static(path.join(__dirname, 'public')));

const fetchAlphaVantageData = async (ticker) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${N4DTXMAJAN9JIZWC}`;
  const res = await axios.get(url);
  return res.data;
};

const getDailyGain = (data) => {
  const series = data['Time Series (Daily)'];
  if (!series) return null;
  const dates = Object.keys(series).sort((a, b) => new Date(b) - new Date(a));
  if (dates.length < 2) return null;
  const today = parseFloat(series[dates[0]]['4. close']);
  const prev = parseFloat(series[dates[1]]['4. close']);
  return ((today - prev) / prev) * 100;
};

app.get('/api/top-stocks', async (req, res) => {
  try {
    const results = await Promise.all(
      TICKERS.map(async (ticker) => {
        const data = await fetchAlphaVantageData(ticker);
        const gain = getDailyGain(data);
        return { ticker, gain, chart: data['Time Series (Daily)'] };
      })
    );
    const top10 = results
      .filter(r => r.gain !== null)
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 10);
    res.json(top10);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
