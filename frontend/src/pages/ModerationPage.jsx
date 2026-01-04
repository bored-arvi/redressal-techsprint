// frontend/src/pages/ModerationPage.jsx - UPDATED VERSION
// frontend/src/pages/ModerationPage.jsx - UPDATED IMPORT SECTION
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import ResourcePanel from '../components/moderation/ResourcePanel';
import ActionRecommendations from '../components/ai/ActionRecommendations';
import QuickResolutions from '../components/moderation/QuickResolutions';
import DecisionTimeline from '../components/ai/DecisionTimeline';
import StakeholderImpact from '../components/ai/StakeholderImpact';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const ModerationPage = ({ onNavigate }) => {
  const { token } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [decisionData, setDecisionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDecision, setLoadingDecision] = useState(false);

  // Load topics (existing code)
  const loadTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const sorted = data.sort((a, b) => a.sentiment_score - b.sentiment_score);
      setTopics(sorted);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, [token]);

  // Load decision support data
  const loadDecisionSupport = async (topicId) => {
    setLoadingDecision(true);
    setSelectedTopic(topicId);
    try {
      const res = await fetch(`${API_BASE}/api/ai/decision-support/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDecisionData(data);
    } catch (error) {
      console.error('Failed to load decision support:', error);
      // Create mock data for demo
      setDecisionData(createMockDecisionData(topicId));
    }
    setLoadingDecision(false);
  };

  const getCurrentTopic = () => {
    return topics.find(t => t.id === selectedTopic);
  };

  return (
    <>
      <Header onNavigate={onNavigate} currentView="moderate" />
      <div className="page-content">
        <div className="container">
          <div className="page-header">
            <div className="page-title-section">
              <h1>   Decision Support Dashboard</h1>
              <p className="page-subtitle">AI-powered resources and actionable insights for moderators</p>
            </div>
          </div>

          <div className="moderation-layout">
            {/* Left sidebar - Topics list */}
            <div className="moderation-sidebar">
              <h3>Topics Needing Attention</h3>
              <div className="moderation-topics-list">
                {topics.map(topic => (
                  <div 
                    key={topic.id} 
                    className={`moderation-topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                    onClick={() => loadDecisionSupport(topic.id)}
                  >
                    <div className="moderation-topic-header">
                      <h4>{topic.title}</h4>
                      <span className={`sentiment-indicator ${getSentimentColor(topic.sentiment_score)}`}>
                        {topic.sentiment_score}
                      </span>
                    </div>
                    <div className="moderation-topic-stats">
                      <span className="stat-item positive">  {topic.positive_count}</span>
                      <span className="stat-item negative">  {topic.negative_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content - Decision Support */}
            <div className="moderation-main">
              {!selectedTopic ? (
                <div className="moderation-empty">
                  <div className="empty-icon"> </div>
                  <h3>Select a topic to get decision support</h3>
                  <p>Choose a topic to see AI-powered resources, recommendations, and action plans</p>
                </div>
              ) : loadingDecision ? (
                <div className="loading">Loading decision support data...</div>
              ) : decisionData && (
                <div className="decision-support-container">
                  <div className="decision-header">
                    <h2>{getCurrentTopic()?.title}</h2>
                    <div className="decision-meta">
                      <span className="ai-confidence">
                          AI Confidence: {(decisionData.recommendations?.ai_confidence * 100 || 85).toFixed(0)}%
                      </span>
                      <span className="generated-time">
                        Generated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <QuickResolutions topic={getCurrentTopic()} />

                  {/* Resource Panel */}
                  <ResourcePanel topic={getCurrentTopic()} resources={decisionData.resources} />

                  {/* Main Decision Columns */}
                  <div className="decision-columns">
                    <div className="decision-column">
                      <ActionRecommendations 
                        topic={getCurrentTopic()} 
                        recommendations={decisionData.recommendations} 
                      />
                      <StakeholderImpact 
                        topic={getCurrentTopic()} 
                        stakeholders={decisionData.stakeholders} 
                      />
                    </div>
                    
                    <div className="decision-column">
                      <DecisionTimeline 
                        topic={getCurrentTopic()} 
                        timeline={decisionData.timeline} 
                      />
                      
                      {/* Additional Insights Card */}
                      <div className="insights-card">
                        <h3>  Additional Insights</h3>
                        <div className="insights-content">
                          <p><strong>Best Time to Act:</strong> Tomorrow morning (highest response rate)</p>
                          <p><strong>Key Risk:</strong> Delayed response may trigger formal complaints</p>
                          <p><strong>Opportunity:</strong> Can be turned into positive case study if resolved well</p>
                          <p><strong>Similar Past Issues:</strong> 3 resolved with 85%+ satisfaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper functions
const getSentimentColor = (score) => {
  if (score <= -5) return 'critical';
  if (score < 0) return 'negative';
  if (score > 0) return 'positive';
  return 'neutral';
};

const createMockDecisionData = (topicId) => {
  // Mock data for demo
  return {
    topic_id: topicId,
    topic_title: "Sample Issue",
    recommendations: {
      resources_needed: ["Department contact", "Meeting room", "Feedback form"],
      stakeholders: [
        {
          name: "Department Head",
          role: "Responsible authority",
          contact: "department@college.edu",
          impact: "high"
        }
      ],
      action_plan: [
        {
          step: "Identify responsible department",
          time_estimate: "30 minutes",
          priority: "high",
          resources: ["College directory"],
          expected_outcome: "Clear ownership"
        }
      ],
      quick_actions: ["Escalate", "Schedule meeting"],
      ai_confidence: 0.85
    },
    resources: {
      available_resources: [
        {
          category: "facilities",
          resources: ["Maintenance staff", "Repair budget"],
          availability: "9AM-5PM"
        }
      ]
    },
    timeline: {
      past: { similar_issues: [] },
      present: { options: [] },
      future: { predictions: [] }
    },
    stakeholders: {
      students: { count: 1500, sentiment: "mixed" },
      faculty: { count: 120, sentiment: "neutral" }
    }
  };
};

export default ModerationPage;