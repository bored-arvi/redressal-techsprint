// frontend/src/components/topics/Poll.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Poll = ({ poll, topicId, onVote }) => {
  const { token } = useAuth();

  const handleVote = async (optionId) => {
    try {
      const res = await fetch(`${API_BASE}/api/poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ option_id: optionId })
      });

      if (res.ok) {
        onVote();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="section-card">
      <h3 className="section-title">📊 Poll</h3>
      <p className="poll-question">{poll.question}</p>
      <div className="poll-options-detail">
        {poll.options.map(option => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100) : 0;
          return (
            <div key={option.id} className="poll-option" onClick={() => handleVote(option.id)}>
              <div className="poll-bar" style={{ width: `${percentage}%` }}></div>
              <div className="poll-content">
                <span className="poll-text">{option.text}</span>
                <span className="poll-votes">{option.votes} votes ({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Poll;