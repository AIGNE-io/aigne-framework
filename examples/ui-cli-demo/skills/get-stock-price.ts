import { FunctionAgent } from "@aigne/core";

/**
 * Stock price skill - Get current stock price using Alpha Vantage API
 * Returns price, change, volume, and trading data for a given stock symbol
 */
export const getStockPriceSkill = FunctionAgent.from({
  name: "get_stock_price",
  description:
    "Get current stock price and detailed information for a given stock symbol (e.g., AAPL, GOOGL, MSFT, TSLA). Returns price, change, volume, and trading data.",
  process: async (input: { symbol: string }) => {
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

    if (!API_KEY) {
      throw new Error(
        "ALPHA_VANTAGE_API_KEY environment variable is not set. Please add it to your .env.local file.",
      );
    }

    const symbol = input.symbol.toUpperCase();
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Check for API errors
      if (data["Error Message"]) {
        throw new Error(`Invalid stock symbol: ${symbol}`);
      }

      if (data["Note"]) {
        throw new Error(
          "API rate limit reached. Alpha Vantage free tier allows 25 requests per day.",
        );
      }

      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      return {
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: quote["10. change percent"],
        volume: parseInt(quote["06. volume"]),
        latestTradingDay: quote["07. latest trading day"],
        previousClose: parseFloat(quote["08. previous close"]),
        open: parseFloat(quote["02. open"]),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch stock data for ${symbol}: ${String(error)}`);
    }
  },
});
