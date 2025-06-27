"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface AnalysisResult {
  positive: number;
  negative: number;
  neutral: number;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!videoUrl) {
      setError('YouTube URLを入力してください。');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/analyze?video_url=${encodeURIComponent(videoUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '分析中にエラーが発生しました。');
      }

      setAnalysisResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ネットワークエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  // analysisResultがnullの場合、グラフは表示しない
  if (!analysisResult) {
    return (
      <div className="container">
        <h1>YouTubeコメント感情分析</h1>
        <p>YouTube動画のURLを入力して、コメントのポジティブ・ネガティブ度を分析します。</p>

        <div className="input-section">
          <input
            type="text"
            placeholder="YouTube動画のURLを入力してください (例: https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="url-input"
          />
          <button onClick={handleAnalyze} disabled={loading} className="analyze-button">
            {loading ? '分析中...' : '分析開始'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  // analysisResultが存在する場合のみ、以下のレンダリングを行う
  // グラフデータの準備 (Recharts用)
  const chartData = [
    { name: 'ポジティブ', value: analysisResult.positive },
    { name: 'ネガティブ', value: analysisResult.negative },
    { name: 'ニュートラル', value: analysisResult.neutral },
  ];

  const COLORS = ['#4CAF50', '#F44336', '#FFC107']; // Positive, Negative, Neutral

  const total = analysisResult.positive + analysisResult.negative + analysisResult.neutral;
  const positivePercentage = total === 0 ? "0.00" : ((analysisResult.positive / total) * 100).toFixed(2);
  const negativePercentage = total === 0 ? "0.00" : ((analysisResult.negative / total) * 100).toFixed(2);
  const neutralPercentage = total === 0 ? "0.00" : ((analysisResult.neutral / total) * 100).toFixed(2);

  return (
    <div className="container">
      <h1>YouTubeコメント感情分析</h1>
      <p>YouTube動画のURLを入力して、コメントのポジティブ・ネガティブ度を分析します。</p>

      <div className="input-section">
        <input
          type="text"
          placeholder="YouTube動画のURLを入力してください (例: https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="url-input"
        />
        <button onClick={handleAnalyze} disabled={loading} className="analyze-button">
          {loading ? '分析中...' : '分析開始'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="results-section">
        <h2>分析結果</h2>
        <p>ポジティブ: {analysisResult.positive} 件</p>
        <p>ネガティブ: {analysisResult.negative} 件</p>
        <p>ニュートラル: {analysisResult.neutral} 件</p>

        <div className="percentages">
          <h3>割合:</h3>
          <p>ポジティブ: {positivePercentage}%</p>
          <p>ネガティブ: {negativePercentage}%</p>
          <p>ニュートラル: {neutralPercentage}%</p>
          <div className="chart-container">
            <PieChart width={400} height={400}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
}