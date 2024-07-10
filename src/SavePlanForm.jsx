import React from 'react';

function SavePlanForm({ planName, setPlanName, onSave }) {
  return (
    <div>
      <input
        type="text"
        value={planName}
        onChange={(e) => setPlanName(e.target.value)}
        placeholder="Enter plan name"
      />
      <button onClick={onSave}>Save Plan</button>
    </div>
  );
}

export default SavePlanForm;