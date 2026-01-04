// frontend/src/components/moderation/QuickResolutions.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

const QuickResolutions = ({ topic }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(null);
  const API_BASE = 'http://localhost:5000';

  const quickActions = [
    {
      id: 1,
      title: "  Escalate",
      description: "Send to relevant department with all context",
      time: "2 min",
      endpoint: `/api/moderation/topic/${topic?.id}/escalate`,
      method: "POST",
      type: "escalate",
      priority: "high",
      requiresConfirmation: true
    },
    {
      id: 2,
      title: "  Create Plan",
      description: "Generate step-by-step resolution plan",
      time: "5 min",
      endpoint: `/api/ai/action-plan/${topic?.id}`,
      method: "POST",
      type: "plan",
      priority: "medium",
      requiresConfirmation: false
    },
    {
      id: 3,
      title: "  Team",
      description: "Assemble cross-functional response team",
      time: "10 min",
      endpoint: `/api/moderation/team/${topic?.id}`,
      method: "POST",
      type: "team",
      priority: "medium",
      requiresConfirmation: true
    },
    {
      id: 4,
      title: "  Resolve",
      description: "Close issue with resolution notes",
      time: "1 min",
      endpoint: `/api/moderation/topic/${topic?.id}/resolve`,
      method: "POST",
      type: "resolve",
      priority: "low",
      requiresConfirmation: true
    },
    {
      id: 5,
      title: "  Report",
      description: "Create management summary report",
      time: "3 min",
      endpoint: `/api/ai/report/${topic?.id}`,
      method: "POST",
      type: "report",
      priority: "low",
      requiresConfirmation: false
    }
  ];

  const handleAction = async (action) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to ${action.title.split(' ')[1].toLowerCase()} this issue?\n\n` +
        `Action: ${action.title}\n` +
        `Time: ${action.time}\n` +
        `Topic: ${topic?.title}`
      );
      
      if (!confirmed) return;
    }

    setLoading(action.id);
    try {
      const res = await fetch(`${API_BASE}${action.endpoint}`, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: action.method === 'POST' ? JSON.stringify({
          topic_id: topic?.id,
          action_type: action.type,
          timestamp: new Date().toISOString()
        }) : undefined
      });

      if (res.ok) {
        // Show success notification
        const message = action.type === 'resolve' 
          ? `Issue marked as resolved!` 
          : `${action.title.split(' ')[1]} action completed successfully!`;
        
        // Create success notification
        showNotification('success', message);
        
        // Refresh the page or update state as needed
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification('error', data.error || `Failed to ${action.type} issue`);
      }
    } catch (error) {
      showNotification('error', 'Network error. Please try again.');
      console.error('Action error:', error);
    } finally {
      setLoading(null);
    }
  };

  const showNotification = (type, message) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">${type === 'success' ? ' ' : ' '}</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Add CSS animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'var(--danger)',
      'medium': 'var(--warning)',
      'low': 'var(--success)'
    };
    return colors[priority] || 'var(--text-tertiary)';
  };

  const getActionIcon = (type) => {
    const icons = {
      'escalate': ' ',
      'plan': ' ',
      'team': ' ',
      'resolve': ' ',
      'report': ' '
    };
    return icons[type] || ' ';
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            marginBottom: '4px' 
          }}>
              Quick Resolution Actions
          </h3>
          <p style={{ 
            fontSize: '13px', 
            color: 'var(--text-secondary)' 
          }}>
            One-click actions for immediate response
          </p>
        </div>
        <div style={{
          padding: '6px 12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
            AI Suggestion: Start with escalation if urgent
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={loading === action.id}
            style={{
              background: 'var(--bg-tertiary)',
              border: `2px solid ${getPriorityColor(action.priority)}`,
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              minHeight: '140px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = `${getPriorityColor(action.priority)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${getPriorityColor(action.priority)}`;
            }}
          >
            {loading === action.id && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                borderRadius: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid var(--bg-hover)',
                    borderTop: '3px solid var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    Processing...
                  </span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>{getActionIcon(action.type)}</span>
              <div style={{
                padding: '2px 8px',
                background: getPriorityColor(action.priority) + '20',
                color: getPriorityColor(action.priority),
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: `1px solid ${getPriorityColor(action.priority)}40`
              }}>
                {action.priority} priority
              </div>
            </div>
            
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              marginBottom: '8px' 
            }}>
              {action.title}
            </h4>
            
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-secondary)', 
              marginBottom: '16px',
              lineHeight: '1.5',
              flex: 1
            }}>
              {action.description}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              width: '100%',
              marginTop: 'auto'
            }}>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-tertiary)',
                fontWeight: 600
              }}>
                {loading === action.id ? 'Processing...' : action.time}
              </span>
              <span style={{
                fontSize: '12px',
                padding: '3px 8px',
                background: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                fontWeight: 600
              }}>
                Click to execute
              </span>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuickResolutions;