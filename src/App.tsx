import { useState, useEffect } from "react";
import { analyzeStock } from "./services/geminiService";
import { Stock } from "./types";
import { 
  TrendingUp, 
  Activity, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  Search,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stocks");
      const data = await response.json();
      if (data.stocks && data.stocks.length > 0) {
        setStocks(data.stocks);
      } else {
        setError("No stocks found in the screener table. Please check the URL or try again.");
      }
    } catch (err) {
      setError("Failed to fetch stocks. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleAnalyze = async (stock: Stock) => {
    if (analyzing[stock.symbol]) return;
    
    setAnalyzing(prev => ({ ...prev, [stock.symbol]: true }));
    try {
      const result = await analyzeStock(stock.name, stock.symbol);
      setAnalyses(prev => ({ ...prev, [stock.symbol]: result || "No analysis generated." }));
    } catch (err) {
      console.error(err);
      setAnalyses(prev => ({ ...prev, [stock.symbol]: "Error analyzing stock. Please try again." }));
    } finally {
      setAnalyzing(prev => ({ ...prev, [stock.symbol]: false }));
    }
  };

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  const handleAnalyzeAll = async () => {
    if (isAnalyzingAll) return;
    setIsAnalyzingAll(true);
    for (const stock of filteredStocks) {
      if (!analyses[stock.symbol]) {
        await handleAnalyze(stock);
      }
    }
    setIsAnalyzingAll(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Alpha Investing Strategy</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stock Phase Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleAnalyzeAll}
              disabled={loading || isAnalyzingAll || filteredStocks.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isAnalyzingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {isAnalyzingAll ? "Analyzing..." : "Analyze All"}
            </button>
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search stocks..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchStocks}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Refresh stock list"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
            <p className="font-medium">Fetching stocks from Screener.in...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={fetchStocks}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stock List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Stocks ({filteredStocks.length})
                </h2>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
                {filteredStocks.map((stock) => (
                  <motion.button
                    layout
                    key={stock.symbol}
                    onClick={() => handleAnalyze(stock)}
                    disabled={analyzing[stock.symbol]}
                    className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                      analyses[stock.symbol] 
                        ? 'bg-white border-indigo-100 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {stock.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-500 uppercase">{stock.symbol}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {analyzing[stock.symbol] ? (
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        ) : analyses[stock.symbol] ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                        )}
                      </div>
                    </div>
                    {analyzing[stock.symbol] && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 left-0 h-1 bg-indigo-600/20"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Analysis Detail */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {Object.keys(analyses).length > 0 ? (
                  <div className="space-y-6">
                    {filteredStocks.filter(s => analyses[s.symbol]).map(stock => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`analysis-${stock.symbol}`}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                      >
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-bold text-slate-900">{stock.name} Analysis</h2>
                          </div>
                          <a 
                            href={`https://www.screener.in/company/${stock.symbol}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            View on Screener <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="p-6 prose prose-slate max-w-none prose-headings:text-indigo-900 prose-strong:text-indigo-700 prose-a:text-indigo-600">
                          <Markdown>{analyses[stock.symbol]}</Markdown>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Activity className="w-16 h-16 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Analysis Yet</h3>
                    <p className="text-slate-400 max-w-xs">
                      Select a stock from the list to perform a detailed phase analysis using Gemini AI.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .prose h1, .prose h2, .prose h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose ul {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
}
