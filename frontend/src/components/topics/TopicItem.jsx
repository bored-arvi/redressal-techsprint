// frontend/src/components/topics/TopicItem.jsx
import React from 'react';

const TopicItem = ({ topic, onClick }) => {
  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const sentiment = topic.sentiment_score > 0 ? 'positive' : 
                   topic.sentiment_score < 0 ? 'negative' : 'neutral';

  return (
    <div className="topic-item" onClick={() => onClick(topic.id)}>
      <div className="topic-vote">
        <button className="vote-btn" onClick={(e) => e.stopPropagation()}> </button>
        <div className={`vote-count ${sentiment}`}>{topic.sentiment_score}</div>
        <button className="vote-btn" onClick={(e) => e.stopPropagation()}> </button>
      </div>

      <div className="topic-content">
        <div className="topic-meta">
          <span className="topic-stats">{topic.positive_count + topic.negative_count} responses</span>
          <span className="dot"> </span>
          <span className="topic-time">{getTimeAgo(topic.created_at)}</span>
        </div>

        <h2 className="topic-title">{topic.title}</h2>

        <div className="topic-footer">
          {topic.tags.length > 0 && (
            <div className="topic-tags">
              {topic.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
            </div>
          )}
          <div className="topic-badges">
            {topic.has_poll && <span className="badge">  Poll</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicItem;