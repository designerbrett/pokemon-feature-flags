import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { useParams } from 'react-router-dom';  // Import useParams

const PlanDetail = ({ user }) => {
  const [planDetails, setPlanDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { planId } = useParams();  // Use useParams to access route parameters

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const snapshot = await database.ref(`users/${user.uid}/plans/${planId}`).once('value');
        const data = snapshot.val();

        if (data) {
          setPlanDetails(data);
        } else {
          console.error('Plan not found');
        }
      } catch (error) {
        console.error('Error fetching plan details:', error);
      }
    };

    if (user && planId) {
      fetchPlanDetails();
    }
  }, [user, planId]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    // Update the local state when the user changes an input field
    setPlanDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  if (!planDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Plan Details - {planDetails.name}</h2>
      {editMode ? (
        <div>
          <div>
            <label>Current Assets:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={planDetails.currentAssets}
              onChange={(e) => handleInputChange('currentAssets', e.target.value)}
            />
          </div>
          <div>
            <label>Years to Save:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={planDetails.yearsTillRetirement}
              onChange={(e) => handleInputChange('yearsTillRetirement', e.target.value)}
            />
          </div>
          <div>
            <label>Estimated Return (%):</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={planDetails.estimatedReturn}
              onChange={(e) => handleInputChange('estimatedReturn', e.target.value)}
            />
          </div>
          {/* Add more input fields based on your plan structure */}
        </div>
      ) : (
        <div>
          <p><strong>Current Assets:</strong> {planDetails.currentAssets}</p>
          <p><strong>Years to Save:</strong> {planDetails.yearsTillRetirement}</p>
          <p><strong>Estimated Return (%):</strong> {planDetails.estimatedReturn}</p>
          {/* Add more details based on your plan structure */}
        </div>
      )}

      <div>
        <button onClick={toggleEditMode}>{editMode ? 'Save Changes' : 'Edit Plan'}</button>
      </div>
    </div>
  );
};

export default PlanDetail;
