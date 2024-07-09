import React, { useState, useEffect } from 'react';
import InitialInputForm from './InitialInputForm';
import ProjectionTable from './ProjectionTable';
import RetirementChart from './RetirementChart';
import AuthUI from './AuthUI';
import { auth, database, ref, set, onValue } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [initialInputs, setInitialInputs] = useState({
    startingYear: new Date().getFullYear(), // Default to current year
    startingAmount: '',
    expectedReturn: '',
    yearlyContribution: '',
    years: 5,
  });
  const [projections, setProjections] = useState([]);
  const [user, setUser] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadSavedPlans(user.uid);
      } else {
        setUser(null);
        setSavedPlans([]);
      }
    });

    // This will now work correctly
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    calculateProjections();
  }, [initialInputs]);

  const calculateProjections = () => {
    const startingYear = parseInt(initialInputs.startingYear) || new Date().getFullYear();
    const startingAmount = parseFloat(initialInputs.startingAmount) || 0;
    const expectedReturn = parseFloat(initialInputs.expectedReturn) || 0;
    const yearlyContribution = parseFloat(initialInputs.yearlyContribution) || 0;
    const years = parseInt(initialInputs.years) || 0;

    let balance = startingAmount;
    let newProjections = [];

    for (let i = 0; i < years; i++) {
      let yearStart = balance;
      let contribution = yearlyContribution;
      let returns = (yearStart + contribution) * (expectedReturn / 100);
      let yearEnd = yearStart + contribution + returns;

      newProjections.push({
        year: startingYear + i,
        startBalance: parseFloat(yearStart.toFixed(2)),
        contribution: parseFloat(contribution.toFixed(2)),
        returns: parseFloat(returns.toFixed(2)),
        endBalance: parseFloat(yearEnd.toFixed(2))
      });

      balance = yearEnd;
    }

    setProjections(newProjections);
  };

  const handleRowEdit = (year, newData) => {
    const updatedProjections = [...projections];
    updatedProjections[year] = { ...updatedProjections[year], ...newData };
  
    // Recalculate all subsequent years
    for (let i = year; i < updatedProjections.length; i++) {
      let prevYear = i === 0 ? { endBalance: initialInputs.startingAmount } : updatedProjections[i - 1];
      let currentYear = updatedProjections[i];
  
      let yearStart = parseFloat(prevYear.endBalance) || 0;
      let contribution = parseFloat(currentYear.contribution) || 0;
      let returns = (yearStart + contribution) * (initialInputs.expectedReturn / 100);
      let yearEnd = yearStart + contribution + returns;
  
      updatedProjections[i] = {
        ...currentYear,
        startBalance: parseFloat(yearStart.toFixed(2)),
        contribution: contribution,
        returns: parseFloat(returns.toFixed(2)),
        endBalance: parseFloat(yearEnd.toFixed(2))
      };
    }
  
    setProjections(updatedProjections);
  };

  const saveData = () => {
    if (user) {
      const newPlan = {
        id: Date.now(),
        name: `Plan ${savedPlans.length + 1}`,
        initialInputs,
        projections
      };
      const plansRef = ref(database, `users/${user.uid}/plans`);
      set(plansRef, [...savedPlans, newPlan])
        .then(() => {
          console.log('Plan saved successfully');
          setSavedPlans([...savedPlans, newPlan]);
          // You might want to show a success message to the user here
        })
        .catch((error) => {
          console.error('Error saving plan: ', error);
          // You might want to show an error message to the user here
        });
    }
  };

  const loadSavedPlans = (userId) => {
    const plansRef = ref(database, `users/${userId}/plans`);
    onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSavedPlans(data);
      }
    }, (error) => {
      console.error('Error loading saved plans: ', error);
      // You might want to show an error message to the user here
    });
  };

  const loadPlan = (plan) => {
    setInitialInputs(plan.initialInputs);
    setProjections(plan.projections);
  };

  const clearForm = () => {
    setInitialInputs({
      startingYear: new Date().getFullYear(),
      startingAmount: '',
      expectedReturn: '',
      yearlyContribution: '',
      years: 5,
    });
    setProjections([]);
  };

  return (
    <div>
      <h1>Retirement Calculator</h1>
      <AuthUI user={user} />
      <InitialInputForm inputs={initialInputs} setInputs={setInitialInputs} />
      <ProjectionTable projections={projections} onRowEdit={handleRowEdit} />
      <RetirementChart projections={projections} />
      <div>
        <button onClick={clearForm}>Clear Form</button>
        {user && <button onClick={saveData}>Save Plan</button>}
      </div>
      {user && savedPlans.length > 0 && (
        <div>
          <h2>Saved Plans</h2>
          <ul>
            {savedPlans.map((plan) => (
              <li key={plan.id}>
                {plan.name} <button onClick={() => loadPlan(plan)}>Load</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!user && <p>Log in to save your plans and access your saved plans.</p>}
    </div>
  );
}

export default App;