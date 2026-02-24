"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AIInsight {
  success: boolean;
  insight?: string;
  error?: string;
}

export function AIPulseSummary(): React.ReactNode {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch("/api/insights");
        const data: AIInsight = await res.json();
        if (data.success && data.insight) {
          setInsight(data.insight);
        } else {
          setInsight("AI insights temporarily unavailable.");
        }
      } catch (error) {
        console.error("Failed to fetch AI insight:", error);
        setInsight("Unable to load AI insights at this time.");
      } finally {
        setLoading(false);
      }
    };

    void fetchInsight();
  }, []);

  // Determine icon based on insight content
  const getInsightIcon = () => {
    const text = insight.toLowerCase();
    if (text.includes("more") || text.includes("increase") || text.includes("higher")) {
      return <TrendingUp className="h-3.5 w-3.5 text-green-600 sm:h-4 sm:w-4" />;
    }
    if (text.includes("less") || text.includes("decrease") || text.includes("lower") || text.includes("fewer")) {
      return <TrendingDown className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />;
    }
    return <Minus className="h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4" />;
  };

  const getIconBg = () => {
    const text = insight.toLowerCase();
    if (text.includes("more") || text.includes("increase") || text.includes("higher")) {
      return "bg-green-100";
    }
    if (text.includes("less") || text.includes("decrease") || text.includes("lower") || text.includes("fewer")) {
      return "bg-red-100";
    }
    return "bg-blue-100";
  };

  const getCardBg = () => {
    const text = insight.toLowerCase();
    if (text.includes("more") || text.includes("increase") || text.includes("higher")) {
      return "bg-green-50";
    }
    if (text.includes("less") || text.includes("decrease") || text.includes("lower") || text.includes("fewer")) {
      return "bg-red-50";
    }
    return "bg-blue-50";
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <Sparkles className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">AI Pulse Summary</h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 sm:mb-4">Real time insights from your data</p>

      {loading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : (
        <div className={`flex gap-2 rounded-xl ${getCardBg()} p-2.5 sm:gap-3 sm:p-3`}>
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getIconBg()} sm:h-8 sm:w-8`}>
            {getInsightIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-700 sm:text-sm">{insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
