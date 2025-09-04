import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import yahooFinance from 'yahoo-finance2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// API to fetch stock data
app.get('/api/stock/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const quote = await yahooFinance.quote(ticker);
    const historyData = await yahooFinance.chart(ticker, { range: '1mo', interval: '1d' });
    const history = {
      dates: historyData.quotes.map(q => new Date(q.date).toLocaleDateString()),
      closes: historyData.quotes.map(q => q.close)
    };
    res.json({ quote, history });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
