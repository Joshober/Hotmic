import React, { useState } from 'react';
import './SpeakerSelector.css';

interface SpeakerSelectorProps {
  currentSpeaker: string;
  speakers: string[];
  onSpeakerChange: (speaker: string) => void;
  onAddSpeaker: (speaker: string) => void;
}

const SpeakerSelector: React.FC<SpeakerSelectorProps> = ({
  currentSpeaker,
  speakers,
  onSpeakerChange,
  onAddSpeaker,
}) => {
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleAddSpeaker = () => {
    if (newSpeakerName.trim() && !speakers.includes(newSpeakerName.trim())) {
      onAddSpeaker(newSpeakerName.trim());
      onSpeakerChange(newSpeakerName.trim());
      setNewSpeakerName('');
      setShowAddInput(false);
    }
  };

  return (
    <div className="speaker-selector">
      <div className="speaker-selector-header">
        <h3>Current Speaker</h3>
      </div>
      <div className="speaker-controls">
        <select
          className="speaker-dropdown"
          value={currentSpeaker}
          onChange={(e) => onSpeakerChange(e.target.value)}
        >
          <option value="">Select Speaker...</option>
          {speakers.map((speaker) => (
            <option key={speaker} value={speaker}>
              {speaker}
            </option>
          ))}
        </select>
        {!showAddInput ? (
          <button
            className="btn-add-speaker"
            onClick={() => setShowAddInput(true)}
          >
            + Add Speaker
          </button>
        ) : (
          <div className="add-speaker-input">
            <input
              type="text"
              placeholder="Speaker name"
              value={newSpeakerName}
              onChange={(e) => setNewSpeakerName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSpeaker();
                }
              }}
              autoFocus
            />
            <button className="btn-confirm" onClick={handleAddSpeaker}>
              ✓
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowAddInput(false);
                setNewSpeakerName('');
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {currentSpeaker && (
        <div className="current-speaker-badge">
          Speaking: <strong>{currentSpeaker}</strong>
        </div>
      )}
    </div>
  );
};

export default SpeakerSelector;

