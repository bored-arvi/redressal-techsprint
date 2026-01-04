// frontend/src/components/common/EmptyState.jsx
import React from 'react';

const EmptyState = ({ icon = " ", title = "No data", message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;