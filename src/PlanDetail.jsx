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
        // const snapshot = db.ref(database, `users/${user.uid}/plans/${planId}`);
        // console.log('snapshot', snapshot)
        // const data = snapshot.val();

        // console.log('Plan details:', data);

        // if (data) {
        //   setPlanDetails(data);
        // } else {
        //   console.error('Plan not found');
        // }
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

  return (
    <div>
      <h2>Plan Details - {planDetails.name}</h2>
      {/* Render plan details using planDetails object */}
      <p><strong>Current Assets:</strong> {planDetails.data.currentAssets}</p>
      <p><strong>Years to Save:</strong> {planDetails.data.yearsTillRetirement}</p>
      <p><strong>Estimated Return (%):</strong> {planDetails.estimatedReturn}</p>
      {/* Add more details based on your plan structure */}
    </div>
  );
};

export default PlanDetail;
