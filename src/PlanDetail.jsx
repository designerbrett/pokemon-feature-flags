// PlanDetail.js
import React, { useState, useEffect } from 'react';
import { database } from './firebase';

const PlanDetail = ({ user, planId }) => {
  const [planDetails, setPlanDetails] = useState(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        console.log('Fetching plan details...');
        const snapshot = await database.ref(`users/${user.uid}/plans/${planId}`).once('value');
        const data = snapshot.val();

        console.log('Plan details:', data);

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

  if (!planDetails) {
    return <div>Loading...</div>;
  }
  const decodedPlanId = decodeURIComponent(params.planId)

  return (
    <div>
      <h2>Plan Details - {planDetails.name}</h2>
      {/* Render plan details using planDetails object */}
      <p><strong>Current Assets:</strong> {planDetails.currentAssets}</p>
      <p><strong>Years to Save:</strong> {planDetails.yearsTillRetirement}</p>
      <p><strong>Estimated Return (%):</strong> {planDetails.estimatedReturn}</p>
      {/* Add more details based on your plan structure */}
    </div>
  );
};

export default PlanDetail;
