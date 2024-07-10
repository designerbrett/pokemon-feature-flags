import React, { useState } from 'react';

function SavedPlansList({ plans, onLoad, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRenameClick = (plan) => {
    setEditingId(plan.id);
    setNewName(plan.name);
  };

  const handleRenameSubmit = (plan) => {
    onRename(plan.id, newName);
    setEditingId(null);
    setNewName('');
  };

  return (
    <div>
      <h2>Saved Plans</h2>
      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>
            {editingId === plan.id ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={() => handleRenameSubmit(plan)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {plan.name}
                <button onClick={() => onLoad(plan)}>Load</button>
                <button onClick={() => handleRenameClick(plan)}>Rename</button>
                <button onClick={() => onDelete(plan.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SavedPlansList;