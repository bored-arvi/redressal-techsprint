// frontend/src/components/ai/SentimentChart.jsx - TEST VERSION
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SentimentChart = ({ topicId }) => {
  const [data, setData] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    // Use test data first to verify Recharts works
    const testData = [
      { time: '10:00', score: 0.5, movingAvg: 0.3 },
      { time: '11:00', score: 0.8, movingAvg: 0.5 },
      { time: '12:00', score: 0.2, movingAvg: 0.4 },
      { time: '13:00', score: -0.3, movingAvg: 0.1 },
      { time: '14:00', score: 0.9, movingAvg: 0.6 },
    ];
    setData(testData);
    
    // Then try to load real data
    loadSentimentData();
  }, [topicId]);

  const loadSentimentData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/sentiment-timeline/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const response = await res.json();
      
      if (response.timeline && response.timeline.length > 0) {
        const formatted = response.timeline.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          score: item.score,
          movingAvg: item.moving_avg
        }));
        setData(formatted);
      }
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    }
  };

  if (data.length === 0) {
    return (
      <div className="sentiment-chart">
        <h3>  Sentiment Timeline</h3>
        <p style={{color: '#ff9800', padding: '20px', textAlign: 'center'}}>
          No sentiment data available yet. Add more posts to generate chart.
        </p>
      </div>
    );
  }

  return (
    <div className="sentiment-chart">
      <div className="chart-header">
        <h3>  Sentiment Timeline</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color instant" style={{background: '#9147ff'}}></span>Instant
          </span>
          <span className="legend-item">
            <span className="legend-color average" style={{background: '#00c853'}}></span>24h Avg
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2e35" />
          <XAxis dataKey="time" stroke="#7d7d8a" style={{ fontSize: '12px' }} />
          <YAxis stroke="#7d7d8a" domain={[-1, 1]} style={{ fontSize: '12px' }} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#9147ff" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="movingAvg" stroke="#00c853" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="chart-footer">
        <div className="chart-stat">
          <span className="stat-label">Current:</span>
          <span className={`stat-value ${data[data.length - 1]?.score >= 0 ? 'positive' : 'negative'}`}>
            {data[data.length - 1]?.score?.toFixed(2)}
          </span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Trend:</span>
          <span className="stat-value">
            {data[data.length - 1]?.score > data[0]?.score ? ' Improving' : '  Declining'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;