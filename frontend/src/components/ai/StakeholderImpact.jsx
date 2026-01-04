// frontend/src/components/ai/StakeholderImpact.jsx
import React from 'react';
import '../../App.css';

const StakeholderImpact = ({ topic, stakeholders }) => {
  const stakeholdersData = stakeholders || {
    students: {
      count: 1500,
      sentiment: "mixed",
      key_concerns: ["quality", "availability", "cost"],
      representation: "Student Council",
      contact: "scouncil@college.edu",
      priority: "high"
    },
    faculty: {
      count: 120,
      sentiment: "neutral",
      key_concerns: ["standards", "consistency", "implementation"],
      representation: "Faculty Association",
      contact: "faculty@college.edu",
      priority: "medium"
    },
    staff: {
      count: 80,
      sentiment: "concerned",
      key_concerns: ["implementation", "workload", "resources"],
      representation: "Staff Union",
      contact: "staffunion@college.edu",
      priority: "medium"
    },
    administration: {
      count: 25,
      sentiment: "monitoring",
      key_concerns: ["budget", "compliance", "reputation"],
      representation: "College Administration",
      contact: "admin@college.edu",
      priority: "high"
    }
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      'positive': ' ',
      'negative': ' ',
      'mixed': ' ',
      'neutral': ' ',
      'concerned': ' ',
      'monitoring': '  '
    };
    return icons[sentiment] || ' ';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      'positive': 'var(--success)',
      'negative': 'var(--danger)',
      'mixed': 'var(--warning)',
      'neutral': 'var(--text-tertiary)',
      'concerned': 'var(--warning)',
      'monitoring': 'var(--accent)'
    };
    return colors[sentiment] || 'var(--text-tertiary)';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'var(--danger)',
      'medium': 'var(--warning)',
      'low': 'var(--success)'
    };
    return colors[priority] || 'var(--text-tertiary)';
  };

  const totalAffected = Object.values(stakeholdersData).reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title">  Stakeholder Impact Analysis</h3>
        <div className="badge" style={{ 
          background: 'var(--bg-tertiary)', 
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        }}>
          Total affected: {totalAffected}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(stakeholdersData).map(([group, data]) => (
          <div key={group} style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    {getSentimentIcon(data.sentiment)} {data.sentiment}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: 800, 
                  color: getPriorityColor(data.priority),
                  marginBottom: '4px'
                }}>
                  {data.count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Affected
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Representation:
              </strong>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                {data.representation}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                {data.contact}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Key Concerns:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.key_concerns.map((concern, idx) => (
                  <span key={idx} style={{
                    fontSize: '12px',
                    padding: '3px 10px',
                    background: 'var(--bg-hover)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}>
                    {concern}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <button className="btn btn-small" style={{ flex: 1, background: 'var(--accent)' }}>
                Engage
              </button>
              <button className="btn btn-small btn-secondary" style={{ flex: 1 }}>
                Survey
              </button>
              <button className="btn btn-small btn-secondary" style={{ flex: 1 }}>
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '20px'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Recommended Engagement Strategy
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Immediate Outreach (Within 24 hours)
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Contact Student Council representatives via scheduled meeting and email briefing
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Information Session (This week)
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Schedule joint meeting with all stakeholder representatives to present facts and proposed solutions
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Regular Updates (Weekly)
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Establish communication channel for progress updates via email and community portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderImpact;