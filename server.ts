import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to fetch and parse Screener.in stocks
  app.get("/api/stocks", async (req, res) => {
    try {
      const url = "https://www.screener.in/screens/2151461/dr-finance-quality-alpha-investing-strategy/";
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      
      const $ = cheerio.load(response.data);
      const stocks: any[] = [];
      
      const extractSymbol = (href: string | undefined) => {
        if (!href) return null;
        const parts = href.split("/").filter(Boolean);
        const companyIndex = parts.indexOf("company");
        if (companyIndex !== -1 && parts.length > companyIndex + 1) {
          return parts[companyIndex + 1];
        }
        return parts.pop() || null;
      };

      // Screener tables usually have links to company pages
      const table = $("table.data-table");
      if (table.length === 0) {
        console.warn("No table found with class 'data-table'. Trying generic table.");
        $("table").each((i, t) => {
          $(t).find("tbody tr").each((j, el) => {
            const nameCell = $(el).find("td a").first();
            const name = nameCell.text().trim();
            const symbol = extractSymbol(nameCell.attr("href"));
            if (name && symbol && !stocks.some(s => s.symbol === symbol)) {
              stocks.push({ name, symbol });
            }
          });
        });
      } else {
        table.find("tbody tr").each((i, el) => {
          const nameCell = $(el).find("td:nth-child(2) a");
          const name = nameCell.text().trim();
          const symbol = extractSymbol(nameCell.attr("href"));
          
          if (name && symbol && !stocks.some(s => s.symbol === symbol)) {
            stocks.push({ name, symbol });
          }
        });
      }

      res.json({ stocks });
    } catch (error: any) {
      console.error("Error fetching stocks:", error.message);
      res.status(500).json({ error: "Failed to fetch stocks from Screener.in" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
