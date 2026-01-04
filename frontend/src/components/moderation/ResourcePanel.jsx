// frontend/src/components/moderation/ResourcePanel.jsx
import React, { useState } from 'react';

const ResourcePanel = ({ topic, resources }) => {
  const [expanded, setExpanded] = useState(true);

  if (!resources) return null;

  return (
    <div className="resource-panel">
      <div className="panel-header" onClick={() => setExpanded(!expanded)}>
        <h3>   Available Resources</h3>
        <span className="toggle-icon">{expanded ? ' ' : ' '}</span>
      </div>
      
      {expanded && (
        <div className="panel-content">
          {/* Available Resources */}
          <div className="resource-section">
            <h4>  Resources & Tools</h4>
            <div className="resources-grid">
              {resources.available_resources?.map((category, idx) => (
                <div key={idx} className="resource-category">
                  <h5>{category.category.toUpperCase()}</h5>
                  <ul>
                    {category.resources.map((resource, rIdx) => (
                      <li key={rIdx}>{resource}</li>
                    ))}
                  </ul>
                  <small>Availability: {category.availability}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="resource-section">
            <h4>  Recommended Contacts</h4>
            <div className="contacts-grid">
              {resources.recommended_contacts?.map((contact, idx) => (
                <div key={idx} className="contact-card">
                  <strong>{contact.name}</strong>
                  <div className="contact-details">
                    <span>Ext: {contact.extension}</span>
                    <span>{contact.email}</span>
                  </div>
                  <div className="contact-actions">
                    <button className="btn-small">Email</button>
                    <button className="btn-small">Call</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          {resources.budget_status && (
            <div className="resource-section">
              <h4>  Budget Status</h4>
              <div className="budget-card">
                <div className="budget-estimate">
                  <strong>Estimated Cost:</strong>
                  <span className="budget-amount">{resources.budget_status.estimated_budget}</span>
                </div>
                <div className="budget-sources">
                  <strong>Funding Sources:</strong>
                  <div className="source-tags">
                    {resources.budget_status.funding_sources?.map((source, idx) => (
                      <span key={idx} className="source-tag">{source}</span>
                    ))}
                  </div>
                </div>
                <div className="budget-approval">
                  <strong>Approval Required:</strong>
                  <span>{resources.budget_status.approval_required}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourcePanel;