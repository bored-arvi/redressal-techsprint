// frontend/src/components/common/CreateTopicModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateTopicModal = ({ onClose, onCreated }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const addOption = () => setPollOptions([...pollOptions, '']);
  const removeOption = (idx) => setPollOptions(pollOptions.filter((_, i) => i !== idx));
  const updateOption = (idx, value) => {
    const newOptions = [...pollOptions];
    newOptions[idx] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!token) {
      alert('Please login to create a topic');
      setSubmitting(false);
      return;
    }

    const body = {
      title,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      has_poll: hasPoll
    };

    if (hasPoll) {
      body.poll_question = pollQuestion;
      body.poll_options = pollOptions.filter(opt => opt.trim());
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/topics`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        alert('Failed to create topic');
      }
    } catch (error) {
      alert('Network error');
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a new topic</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your topic about?"
                required
              />
            </div>

            <div className="form-group">
              <label>Tags <span className="label-hint">(comma separated)</span></label>
              <input 
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="facilities, IT, HR"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={hasPoll}
                  onChange={(e) => setHasPoll(e.target.checked)}
                />
                <span>Include a poll</span>
              </label>
            </div>

            {hasPoll && (
              <div className="poll-section">
                <div className="form-group">
                  <label>Poll Question</label>
                  <input 
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What would you like to ask?"
                  />
                </div>

                <div className="form-group">
                  <label>Options</label>
                  <div className="poll-options-input">
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="poll-option-row">
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                        {pollOptions.length > 2 && (
                          <button type="button" className="btn-icon btn-danger" onClick={() => removeOption(idx)}>
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn btn-secondary btn-small" onClick={addOption}>
                    + Add option
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;