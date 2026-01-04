// frontend/src/pages/TopicDetailPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import AISummary from '../components/ai/AISummary';
import SentimentChart from '../components/ai/SentimentChart';
import RiskPrediction from '../components/ai/RiskPrediction';
import SimilarTopics from '../components/ai/SimilarTopics';
import Poll from '../components/topics/Poll';
import Comment from '../components/topics/Comment';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TopicDetailPage = ({ topicId, onBack, onNavigate }) => {
  const { token } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTopic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTopic(data);
    } catch (error) {
      console.error('Failed to load topic:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic_id: topicId, content: postContent })
      });

      if (res.ok) {
        setPostContent('');
        loadTopic();
      } else {
        const data = await res.json();
        alert('Failed to add post: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <>
        <Header onNavigate={onNavigate} currentView="topics" />
        <div className="page-content">
          <div className="loading">Loading topic...</div>
        </div>
      </>
    );
  }

  if (!topic) return null;

  const sentiment = topic.sentiment_score > 0 ? 'positive' : 
                   topic.sentiment_score < 0 ? 'negative' : 'neutral';

  return (
    <>
      <Header onNavigate={onNavigate} currentView="topics" />
      <div className="page-content">
        <div className="container">
          <button className="back-btn" onClick={onBack}>
              Back to topics
          </button>

          <div className="topic-detail">
            <div className="topic-header-detail">
              <div className="topic-vote-section">
                <button className="vote-btn large"> </button>
                <div className={`vote-count large ${sentiment}`}>{topic.sentiment_score}</div>
                <button className="vote-btn large"> </button>
              </div>

              <div className="topic-info">
                <div className="topic-meta">
                  <span>{topic.positive_count + topic.negative_count} responses</span>
                </div>
                <h1 className="topic-title-detail">{topic.title}</h1>
                {topic.tags.length > 0 && (
                  <div className="topic-tags">
                    {topic.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* AI FEATURES */}
            <AISummary topicId={topicId} />
            <SentimentChart topicId={topicId} />
            <RiskPrediction topicId={topicId} />
            <SimilarTopics topicId={topicId} />

            {topic.poll && (
              <Poll poll={topic.poll} topicId={topicId} onVote={loadTopic} />
            )}

            <div className="section-card">
              <h3 className="section-title">  Add your response</h3>
              <form onSubmit={handlePostSubmit}>
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows="4"
                  disabled={submitting}
                />
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={!postContent.trim() || submitting}>
                    {submitting ? 'Posting...' : 'Post Response'}
                  </button>
                </div>
              </form>
            </div>

            <div className="comments-section">
              <h3 className="section-title-comments">
                {topic.posts.length} {topic.posts.length === 1 ? 'Response' : 'Responses'}
              </h3>

              <div className="comments-list">
                {topic.posts.map(post => (
                  <Comment key={post.id} post={post} />
                ))}

                {topic.posts.length === 0 && (
                  <div className="empty-comments">
                    <p>No responses yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicDetailPage;