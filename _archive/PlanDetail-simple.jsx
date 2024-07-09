// PlanDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { database, db, onValue } from './firebase';

const PlanDetail = ({ user }) => {
  const [planDetails, setPlanDetails] = useState(null);
  let { planId } = useParams();
  useEffect(() => {
    console.log("user", user)
    console.log("planId", planId)

    const fetchPlanDetails = async () => {
      try {
        console.log('Fetching plan details...');
        const planRef = db.ref(database, `users/${user.uid}/plans/${planId}`);
        onValue(planRef, (snapshot) => {
          const data = snapshot.val();
          console.log('data', data)
          if (!planDetails) {
            setPlanDetails(data)
          }
        })
      } catch (error) {
        console.error('Error fetching plan details:', error);
      }
    };

    if (user && planId) {
      fetchPlanDetails();
    }
  }, [user, planId]);

  const handleChange = (e) => {
    // Handle changes to the input field value if needed
  };

  if (!planDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Plan Details - {planDetails.name}</h2>
      <p><strong>Current Assets:</strong> {planDetails.data.currentAssets}</p>
      <input
      type="text"
      value={planDetails.data.currentAssets}
      onChange={handleChange}
    />
      <p><strong>Years to Save:</strong> {planDetails.data.yearsTillRetirement}</p>
      <p><strong>Estimated Return (%):</strong> {planDetails.estimatedReturn}</p>
    </div>
  );
};

export default PlanDetail;
