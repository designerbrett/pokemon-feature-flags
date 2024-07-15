import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';


function Header({ planName, setPlanName, savedPlans, onSave, onRename, onDelete, onLoad, user, onLogin, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    if (!planName) {
      setPlanName("Untitled Plan");
    }
  }, [planName, setPlanName]);

  const handleSave = () => {
    if (user) {
      onSave();
      setIsDropdownOpen(false);
    } else {
      alert("Please log in to save your plan.");
      onLogin();
    }
  };

  const handleRename = (planId, name) => {
    onRename(planId, name);
    setEditingPlanId(null);
  };

  const handleDelete = (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      onDelete(planId);
      setIsDropdownOpen(false);
    }
  };

  const handleAuth = () => {
    if (user) {
      signOut(auth).catch((error) => console.error('Error signing out:', error));
    } else {
      onLogin();
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-xl font-bold"
        >
          {planName} <span className="ml-2">▼</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md">
            {!user && <p className="p-4">Log in to save your plans and access your saved plans.</p>}
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-2 border-b"
              placeholder="Enter plan name"
            />
            <button 
              onClick={handleSave}
              className="w-full bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
            >
              Save Plan
            </button>
            {user && savedPlans.map((plan) => (
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
      <div>
        {user ? (
          <>
            <span>Welcome,<Link to="/profile" className="ml-4 text-blue-500">{user.email}</Link></span>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-500">Login</Link>
            <Link to="/register" className="ml-4 text-blue-500">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;