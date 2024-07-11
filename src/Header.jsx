import React, { useState } from 'react';

function Header({ planName, setPlanName, savedPlans, onSave, onRename, onDelete, onLoad }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [newPlanName, setNewPlanName] = useState('');

  const handleSave = () => {
    onSave();
    setIsDropdownOpen(false);
  };

  const handleRename = (planId, name) => {
    onRename(planId, name);
    setEditingPlanId(null);
  };

  const handleDelete = (planId) => {
    onDelete(planId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="">
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-xl font-bold"
        >
          {planName || 'Plan name'} <span className="ml-2">▼</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md">
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-2 border-b"
              placeholder="Enter plan name"
            />
            {savedPlans.map((plan) => (
              <div key={plan.id} className="p-2 hover:bg-gray-100 flex justify-between items-center">
                {editingPlanId === plan.id ? (
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    onBlur={() => handleRename(plan.id, newPlanName)}
                    autoFocus
                  />
                ) : (
                  <span onClick={() => onLoad(plan)}>{plan.name}</span>
                )}
                <div>
                  <button 
                    onClick={() => {
                      setEditingPlanId(plan.id);
                      setNewPlanName(plan.name);
                    }}
                    className="text-blue-500 mr-2"
                  >
                    Rename
                  </button>
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Plan
      </button>

      
    </div>
  );
}

export default Header;