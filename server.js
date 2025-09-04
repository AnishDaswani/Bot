import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import yahooFinance from 'yahoo-finance2';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Helper: check if Ollama is running
async function checkOllama() {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    return res.ok;
  } catch (err) {
    return false;
  }
}

// API: analyze stock
app.get('/api/analyze/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const ollamaUp = await checkOllama();
  if (!ollamaUp) {
    return res.json({ error: "Ollama is not running. Please install/start Ollama (https://ollama.com)." });
  }

  try {
    // Fetch stock data
    const quote = await yahooFinance.quote(ticker);
    const history = await yahooFinance.chart(ticker, { range: '1mo', interval: '1d' });

    // Prepare summary for AI
    const context = `
    Stock: ${ticker}
    Current Price: ${quote.regularMarketPrice}
    52w High/Low: ${quote.fiftyTwoWeekHigh} / ${quote.fiftyTwoWeekLow}
    Sector: ${quote.sector || 'N/A'}
    Recent closing prices: ${history.quotes.slice(-5).map(q => q.close).join(', ')}
    `;

    // Call Ollama
    const ai = spawn('ollama', ['run', 'phi3:3.8b'], { stdio: ['pipe', 'pipe', 'pipe'] });
    ai.stdin.write(`Explain this stock to a beginner in simple language:\n${context}`);
    ai.stdin.end();

    let output = '';
    ai.stdout.on('data', data => output += data.toString());
    ai.stderr.on('data', err => console.error(err.toString()));
    ai.on('close', () => {
      res.json({
        ticker,
        quote: {
          ...quote,
          history: {
            dates: history.quotes.map(q => new Date(q.date).toLocaleDateString()),
            closes: history.quotes.map(q => q.close)
          }
        },
        explanation: output.trim()
      });
    });

  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
