// frontend/src/components/ai/DecisionTimeline.jsx
import React, { useState } from 'react';
import '../../App.css';

const DecisionTimeline = ({ topic, timeline }) => {
  const [activeTab, setActiveTab] = useState('present');

  const timelineData = timeline || {
    past: {
      similar_issues: [
        {
          title: "Cafeteria Quality Issue",
          when: "3 months ago",
          resolution: "Formed food committee with student representatives",
          outcome: "90% satisfaction improvement, implemented regular feedback system"
        }
      ],
      lessons_learned: [
        "Quick response prevents escalation to formal complaints",
        "Involving stakeholders from the beginning improves buy-in",
        "Transparent communication reduces rumors and misinformation"
      ]
    },
    present: {
      options: [
        {
          option: "Immediate Action",
          pros: ["Quick resolution shows responsiveness", "Prevents issue from worsening", "Builds trust with affected parties"],
          cons: ["May not address root cause fully", "Limited stakeholder consultation", "Potential for rushed decisions"],
          time: "1-2 days",
          resources: ["On-call staff", "Emergency budget", "Quick response team"]
        },
        {
          option: "Committee Approach",
          pros: ["Thorough analysis of root causes", "Stakeholder buy-in through participation", "Sustainable long-term solution"],
          cons: ["Slower initial response", "More resource intensive", "Requires coordination between departments"],
          time: "1-2 weeks",
          resources: ["Committee members", "Meeting coordination", "Research time"]
        }
      ],
      ai_recommendation: "Start with immediate stabilization actions while forming a committee for comprehensive solution"
    },
    future: {
      predictions: [
        {
          scenario: "If resolved within 48 hours",
          outcome: "High satisfaction (85%+), positive community feedback, improved trust"
        },
        {
          scenario: "If delayed beyond 1 week",
          outcome: "Moderate dissatisfaction (60%), potential formal complaints, trust erosion"
        },
        {
          scenario: "If addressed with stakeholder involvement",
          outcome: "Sustainable solution, improved processes, potential for positive case study"
        }
      ],
      success_metrics: [
        "Reduction in similar complaints by 80%",
        "Sentiment score improvement to +8",
        "Resolution time under 72 hours",
        "Stakeholder satisfaction above 90%"
      ]
    }
  };

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="section-title">  Decision Timeline</h3>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
          <button 
            className={`btn btn-small ${activeTab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('past')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
              Past
          </button>
          <button 
            className={`btn btn-small ${activeTab === 'present' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('present')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
              Present
          </button>
          <button 
            className={`btn btn-small ${activeTab === 'future' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('future')}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
              Future
          </button>
        </div>
      </div>

      <div className="timeline-content" style={{ minHeight: '300px' }}>
        {activeTab === 'past' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Similar Past Issues
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {timelineData.past.similar_issues.map((issue, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h5 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {issue.title}
                      </h5>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {issue.when}
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Resolution:
                      </strong>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                        {issue.resolution}
                      </p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Outcome:
                      </strong>
                      <p style={{ fontSize: '14px', color: 'var(--success)', margin: 0 }}>
                        {issue.outcome}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Lessons Learned:
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {timelineData.past.lessons_learned.map((lesson, idx) => (
                  <li key={idx} style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'present' && (
          <div>
            <div style={{
              background: 'var(--bg-tertiary)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}> </span>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)' }}>
                  AI Recommendation
                </h4>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                {timelineData.present.ai_recommendation}
              </p>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Available Options:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {timelineData.present.options.map((option, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {option.option}
                    </h5>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      background: 'var(--bg-hover)',
                      borderRadius: '12px',
                      color: 'var(--text-tertiary)',
                      fontWeight: 600
                    }}>
                      {option.time}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--success)', display: 'block', marginBottom: '8px' }}>
                          Pros
                      </strong>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {option.pros.map((pro, pIdx) => (
                          <li key={pIdx} style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--danger)', display: 'block', marginBottom: '8px' }}>
                          Cons
                      </strong>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {option.cons.map((con, cIdx) => (
                          <li key={cIdx} style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Resources needed:
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {option.resources.map((res, rIdx) => (
                        <span key={rIdx} style={{
                          fontSize: '12px',
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
                  
                  <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                    Select this option
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'future' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                AI Predictions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {timelineData.future.predictions.map((prediction, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        If:
                      </strong>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                        {prediction.scenario}
                      </p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Then:
                      </strong>
                      <p style={{ fontSize: '14px', color: idx === 0 ? 'var(--success)' : idx === 1 ? 'var(--danger)' : 'var(--accent)', margin: 0 }}>
                        {prediction.outcome}
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          AI Confidence
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {(85 - idx * 15)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--bg-hover)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${85 - idx * 15}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, var(--accent), ${idx === 0 ? 'var(--success)' : idx === 1 ? 'var(--danger)' : 'var(--accent)'})`,
                          borderRadius: '3px'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Success Metrics:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {timelineData.future.success_metrics.map((metric, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '16px' }}> </span>
                    <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {metric}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      background: 'var(--bg-hover)',
                      borderRadius: '12px',
                      color: 'var(--text-tertiary)',
                      fontWeight: 600
                    }}>
                      Target: 90%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionTimeline;