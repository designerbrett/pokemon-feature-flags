import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { database, db, onValue, ref, set, update } from './firebase';

const PlanDetail = ({ user }) => {
  const [planDetails, setPlanDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  let { planId } = useParams();

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        console.log('Fetching plan details...');
        const planRef = db.ref(database, `users/${user.uid}/plans/${planId}`);
        onValue(planRef, (snapshot) => {
          const data = snapshot.val();
          console.log('data', data);
          if (!planDetails) {
            setPlanDetails(data);
          }
        });
      } catch (error) {
        console.error('Error fetching plan details:', error);
      }
    };

    if (user && planId) {
      fetchPlanDetails();
    }
  }, [user, planId, planDetails]);

  useEffect(() => {
    if (planDetails) {
      calculateRetirementPlan();
    }
  }, [planDetails]);

  useEffect(() => {
    // Call calculateRetirementPlan when estimatedReturn changes
    calculateRetirementPlan();
  }, [planDetails?.data?.estimatedReturn]);

  const handleChange = (property, value) => {
    setPlanDetails((prevPlanDetails) => ({
      ...prevPlanDetails,
      data: {
        ...prevPlanDetails.data,
        [property]: value,
      },
    }));

    // Set isDirty to true when a change occurs
    setIsDirty(true);
  };

  const calculateRetirementPlan = () => {
    let currentTotal = parseFloat(planDetails?.data?.currentAssets) || 0;
    const returnRate = parseFloat(planDetails?.data?.estimatedReturn) / 100 || 0;
    const compoundingFactor = planDetails?.data?.compoundingFrequency === 'yearly' ? 1 : 12;
    const contribution = parseFloat(planDetails?.data?.contributionAmount) || 0;

    let newResults = [];

    for (let index = 0; index < parseInt(planDetails?.data?.yearsTillRetirement) * compoundingFactor; index++) {
      const yearlyReturn = currentTotal * returnRate;
      const monthlyReturn = yearlyReturn / 12;

      // Calculate the starting amount based on the period
      const startingAmount = index === 0 ? currentTotal : parseFloat(newResults[index - 1].total);

      currentTotal = startingAmount + (planDetails?.data?.compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn);

      const totalWithContribution = currentTotal + contribution;

      newResults.push({
        period: index + 1,
        startingAmount: startingAmount.toFixed(2),
        compoundingAmount: (planDetails?.data?.compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn).toFixed(2),
        contributionAmount: contribution.toFixed(2),
        total: totalWithContribution.toFixed(2),
      });
    }

    setResults(newResults);
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
  
      // Extracting planId and data from planDetails
      const { data, ...rest } = planDetails;
  
      // Update the existing plan with the modified details
      await update(ref(database, `users/${user.uid}/plans/${planId}/data`), data);
      // Optionally, you can also update other properties of the plan like name, timestamp, etc.
  
      setSaving(false);
  
      // Reset isDirty after saving
      setIsDirty(false);
  
      // Use navigate to go back to the plan details page
      navigate(`/plan/${planId}`);
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaving(false);
    }
  };

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Stacked Bar Chart',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Period',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };
  
  const labels = results.map((result) => result.period);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Starting Amount',
        data: results.map((result) => (result.startingAmount)),
        backgroundColor: 'rgba(75,192,192,1)',
      },
      {
        label: 'Interest',
        data: results.map((result) => (result.compoundingAmount)),
        backgroundColor: 'rgba(255,99,132,1)',
      },
      {
        label: 'Additional Funds',
        data: results.map((result) => (result.contributionAmount)),
        backgroundColor: 'rgba(255,205,86,1)',
      },
    ],
  };

  return (
    <div>
      <h1>{planDetails?.name || ''}</h1>
      <div className="input-container">
        <div className="inputs">
          <div>
            <label>Current Assets:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={planDetails?.data?.currentAssets || ''}
              onChange={(e) => handleChange('currentAssets', e.target.value.replace('$', ''))}
            />
          </div>
          <div>
            <label>Years to save:</label>
            <div className="numeric-input">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={planDetails?.data?.yearsTillRetirement || ''}
                onChange={(e) => handleChange('yearsTillRetirement', e.target.value)}
              />
              <button onClick={() => handleChange('yearsTillRetirement', parseInt(planDetails?.data?.yearsTillRetirement || 0) - 1)}>-</button>
              <button onClick={() => handleChange('yearsTillRetirement', parseInt(planDetails?.data?.yearsTillRetirement || 0) + 1)}>+</button>
            </div>
          </div>
          <div>
            <label>Estimated Return (%):</label>
            <div className="numeric-input">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={planDetails?.data?.estimatedReturn || ''}
                onChange={(e) => handleChange('estimatedReturn', e.target.value)}
              />
              <button onClick={() => handleChange('estimatedReturn', parseInt(planDetails?.data?.estimatedReturn || 0) - 1)}>-</button>
              <button onClick={() => handleChange('estimatedReturn', parseInt(planDetails?.data?.estimatedReturn || 0) + 1)}>+</button>
            </div>
          </div>
          <div>
            <label>Contribution Amount:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={planDetails?.data?.contributionAmount || ''}
              onChange={(e) => handleChange('contributionAmount', e.target.value.replace('$', ''))}
            />
          </div>
          <button onClick={saveChanges} disabled={!isDirty || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="results">
        {results.map((result) => (
          <div className="card" key={result.period}>
            <div className="year">{result.period}</div>
            <div><span className='dollar-sign'>$</span>{result.startingAmount}</div>
            <div><span className='dollar-sign'>$</span>{result.compoundingAmount}</div>
            <div><span className='dollar-sign'>$</span>{result.contributionAmount}</div>
            <div><span className='dollar-sign'>$</span>{result.total}</div>
          </div>
        ))}
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PlanDetail;
