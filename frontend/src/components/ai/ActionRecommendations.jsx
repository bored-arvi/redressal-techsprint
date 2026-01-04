// frontend/src/components/ai/ActionRecommendations.jsx
import React, { useState } from 'react';
import '../../App.css';

const ActionRecommendations = ({ topic, recommendations }) => {
  const [selectedStep, setSelectedStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleStepCompletion = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(idx => idx !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const actionPlan = recommendations?.action_plan || [];
  const resourcesNeeded = recommendations?.resources_needed || [];

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': { text: 'High Priority', color: 'var(--danger)' },
      'medium': { text: 'Medium Priority', color: 'var(--warning)' },
      'low': { text: 'Low Priority', color: 'var(--success)' }
    };
    
    const badge = badges[priority] || badges.medium;
    return (
      <span className="badge" style={{ backgroundColor: badge.color + '20', color: badge.color, border: `1px solid ${badge.color}40` }}>
        {badge.text}
      </span>
    );
  };

  const getHighestPriority = (actionPlan) => {
    if (!actionPlan.length) return 'medium';
    const priorities = actionPlan.map(step => step.priority);
    if (priorities.includes('high')) return 'high';
    if (priorities.includes('medium')) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'var(--danger)',
      'medium': 'var(--warning)',
      'low': 'var(--success)'
    };
    return colors[priority] || 'var(--text-tertiary)';
  };

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 className="section-title">  Recommended Actions</h3>
        <div className="ai-confidence">
          AI Confidence: {((recommendations?.ai_confidence || 0.85) * 100).toFixed(0)}%
        </div>
      </div>

      {resourcesNeeded.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Resources Needed
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resourcesNeeded.map((resource, idx) => (
              <span key={idx} className="tag" style={{ 
                background: 'var(--bg-tertiary)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}>
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Action Plan
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {actionPlan.map((step, index) => (
            <div 
              key={index} 
              style={{
                background: selectedStep === index ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                border: `1px solid ${selectedStep === index ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: completedSteps.includes(index) ? 0.7 : 1
              }}
              onClick={() => setSelectedStep(index)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: completedSteps.includes(index) ? 'var(--success)' : 
                            getPriorityColor(step.priority) + '40',
                  color: completedSteps.includes(index) ? 'white' : getPriorityColor(step.priority),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: `2px solid ${completedSteps.includes(index) ? 'var(--success)' : getPriorityColor(step.priority)}`
                }}>
                  {completedSteps.includes(index) ? ' ' : index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {step.step}
                  </h5>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                         {step.time_estimate}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: getPriorityColor(step.priority) + '20',
                      color: getPriorityColor(step.priority),
                      border: `1px solid ${getPriorityColor(step.priority)}40`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {step.priority}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn btn-small"
                  style={{
                    background: completedSteps.includes(index) ? 'var(--success)' : 'var(--accent)',
                    color: 'white',
                    padding: '6px 12px',
                    fontSize: '13px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepCompletion(index);
                  }}
                >
                  {completedSteps.includes(index) ? 'Undo' : 'Complete'}
                </button>
              </div>
              
              {selectedStep === index && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {step.resources && step.resources.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Resources:
                      </strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {step.resources.map((res, idx) => (
                          <span key={idx} style={{
                            fontSize: '13px',
                            padding: '3px 8px',
                            background: 'var(--bg-hover)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)'
                          }}>
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Expected Outcome:
                    </strong>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                      {step.expected_outcome}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-small" style={{ background: 'var(--accent)' }}>
                      Assign
                    </button>
                    <button className="btn btn-small btn-secondary">
                      Snooze
                    </button>
                    <button className="btn btn-small btn-secondary">
                      Add Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {recommendations?.quick_actions && recommendations.quick_actions.length > 0 && (
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Quick Actions
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recommendations.quick_actions.map((action, idx) => (
              <button key={idx} className="btn btn-small" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionRecommendations;