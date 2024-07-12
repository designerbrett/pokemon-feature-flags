import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState({});
  const [savedPlans, setSavedPlans] = useState([]);
  const db = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userProfileRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userProfileRef);
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }

        // Fetch saved plans
        const plansRef = ref(db, `users/${currentUser.uid}/plans`);
        const plansSnapshot = await get(plansRef);
        if (plansSnapshot.exists()) {
          setSavedPlans(Object.values(plansSnapshot.val()));
        }
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await remove(ref(db, `users/${currentUser.uid}/plans/${planId}`));
        setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleLoadPlan = (plan) => {
    navigate('/', { state: { selectedPlan: plan } });
  };

  return (
    <div id="page-contained" className="profile">
      <h1>Profile</h1>
      <img
        src={user.profileImage || '/images/default-profile.png'}
        alt="Profile"
        className="profile-image"
        width={100}
      />
      <h2>{user.username}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role || 'User'}</p>
      <div className="biography">{user.biography || 'No biography provided.'}</div>

      <Link to="/profile/edit" className="button">Edit Profile</Link>

      <h2>Saved Plans</h2>
      {savedPlans.length > 0 ? (
        <ul className="saved-plans-list">
          {savedPlans.map((plan) => (
            <li key={plan.id} className="saved-plan-item">
              <span>{plan.name}</span>
              <button onClick={() => handleLoadPlan(plan)}>Load</button>
              <button onClick={() => handleDeletePlan(plan.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No saved plans yet.</p>
      )}
    </div>
  );
}

export default Profile;