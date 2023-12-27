// PlanDetail.js
import React, { useEffect, useState } from 'react';
import { database } from './firebase';

const PlanDetail = ({ match }) => {
  if (!match) {
    return <div>Loading...</div>;
  }

  const planId = decodeURIComponent(match.params.planId);
  const [planDetails, setPlanDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [user, planId]);

  if (!planDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Plan Details - {planId}</h2>
      <p><strong>Current Assets:</strong> {planDetails.currentAssets}</p>
      <p><strong>Years to Save:</strong> {planDetails.yearsTillRetirement}</p>
      <p><strong>Estimated Return (%):</strong> {planDetails.estimatedReturn}</p>
      {/* Add more details based on your plan structure */}
    </div>
  );
};

export default PlanDetail;
