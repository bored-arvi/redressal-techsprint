// frontend/src/components/topics/Comment.jsx
import React from 'react';

const Comment = ({ post }) => {
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

  return (
    <div className="comment">
      <div className="comment-vote">
        <button className="vote-btn small">▲</button>
      </div>

      <div className="comment-content">
        <div className="comment-meta">
          <span className="comment-author">Anonymous</span>
          <span className="dot">•</span>
          <span className="comment-time">{getTimeAgo(post.created_at)}</span>
          <span className={`sentiment-badge ${post.sentiment || 'neutral'}`}>
            {post.sentiment || 'neutral'}
          </span>
        </div>
        <p className="comment-text">{post.content}</p>
      </div>
    </div>
  );
};

export default Comment;