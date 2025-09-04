# Bolt Munching Number Crunching Tin Skin Clanker

This project provides a simple web UI for analyzing stocks with AI explanations.

## Features
- Fetches live stock data from Yahoo Finance (free API).
- Uses Ollama (local AI models) to explain stock trends in simple terms.
- Visualizes stock price history with Chart.js.
- Simple HTML/JS frontend + Node.js backend.

## Setup
1. Install [Ollama](https://ollama.com/) and pull models:
   ```bash
   ollama pull phi3:3.8b
