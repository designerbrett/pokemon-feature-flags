import React, { useState, useEffect } from 'react';
import InitialInputForm from './InitialInputForm';
import ProjectionTable from './ProjectionTable';
import RetirementChart from './RetirementChart';
import SavePlanForm from './SavePlanForm';
import SavedPlansList from './SavedPlansList';
import AuthUI from './AuthUI';
import { auth, database, ref, set, onValue } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [initialInputs, setInitialInputs] = useState({
    startingYear: new Date().getFullYear(),
    startingAmount: '',
    expectedReturn: '',
    yearlyContribution: '',
    years: 5,
  });
  const [projections, setProjections] = useState([]);
  const [actualData, setActualData] = useState([]);
  const [user, setUser] = useState(null);
  const [planName, setPlanName] = useState('');
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
        endBalance: parseFloat(yearEnd.toFixed(2)),
      });

      balance = yearEnd;
    }

    setProjections(newProjections);
  };

  const updateActualData = (year, newData) => {
    setActualData(prevData => {
      let updatedData = [...prevData];
      const yearIndex = updatedData.findIndex(d => d.year === year);
      const projectionForYear = projections.find(p => p.year === year);
      
      let actualContribution = parseFloat(newData.contribution);
      let actualReturns = parseFloat(newData.returns);
      
      // If both contribution and returns are 0 or empty, don't update
      if (actualContribution === 0 && actualReturns === 0) {
        return prevData;
      }

      const startBalance = year === projections[0].year 
        ? projectionForYear.startBalance 
        : (updatedData[yearIndex - 1]?.endBalance || projectionForYear.startBalance);

      const endBalance = startBalance + actualContribution + actualReturns;

      updatedData[yearIndex] = {
        year,
        startBalance,
        contribution: actualContribution,
        returns: actualReturns,
        endBalance
      };

      // Recalculate future years
      for (let i = yearIndex + 1; i < projections.length; i++) {
        const prevYear = updatedData[i - 1];
        const currentProjection = projections[i];
        
        const startBalance = prevYear.endBalance;
        const contribution = updatedData[i]?.contribution || currentProjection.contribution;
        const returns = ((startBalance + contribution) * (parseFloat(initialInputs.expectedReturn) / 100));
        const endBalance = startBalance + contribution + returns;

        updatedData[i] = {
          year: currentProjection.year,
          startBalance,
          contribution,
          returns,
          endBalance
        };
      }

      return updatedData;
    });
  };

  const loadSavedPlans = (userId) => {
    const plansRef = ref(database, `users/${userId}/plans`);
    onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSavedPlans(Object.values(data));
      }
    }, (error) => {
      console.error('Error loading saved plans: ', error);
    });
  };

  const loadPlan = (plan) => {
    setInitialInputs(plan.initialInputs);
    setProjections(plan.projections);
    setActualData(plan.actualData || []);
    setPlanName(plan.name);
  };

  const saveData = () => {
    if (user && planName.trim()) {
      const existingPlan = savedPlans.find(plan => plan.name === planName.trim());
      
      const savePlan = () => {
        const newPlan = {
          id: existingPlan ? existingPlan.id : Date.now(),
          name: planName.trim(),
          initialInputs,
          projections,
          actualData
        };
        
        const updatedPlans = existingPlan 
          ? savedPlans.map(plan => plan.id === existingPlan.id ? newPlan : plan)
          : [...savedPlans, newPlan];

        const plansRef = ref(database, `users/${user.uid}/plans`);
        set(plansRef, updatedPlans)
          .then(() => {
            console.log('Plan saved successfully');
            setSavedPlans(updatedPlans);
          })
          .catch((error) => {
            console.error('Error saving plan: ', error);
          });
      };

      if (existingPlan) {
        if (window.confirm(`A plan with the name "${planName}" already exists. Do you want to overwrite it?`)) {
          savePlan();
        }
      } else {
        savePlan();
      }
    } else if (!planName.trim()) {
      alert('Please enter a name for your plan before saving.');
    }
  };

  const deletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      const plansRef = ref(database, `users/${user.uid}/plans`);
      set(plansRef, updatedPlans)
        .then(() => {
          console.log('Plan deleted successfully');
          setSavedPlans(updatedPlans);
          if (planName === savedPlans.find(plan => plan.id === planId)?.name) {
            setPlanName('');
          }
        })
        .catch((error) => {
          console.error('Error deleting plan: ', error);
        });
    }
  };

  const renamePlan = (planId, newName) => {
    const updatedPlans = savedPlans.map(plan =>
      plan.id === planId ? { ...plan, name: newName } : plan
    );
    const plansRef = ref(database, `users/${user.uid}/plans`);
    set(plansRef, updatedPlans)
      .then(() => {
        console.log('Plan renamed successfully');
        setSavedPlans(updatedPlans);
        if (planName === savedPlans.find(plan => plan.id === planId)?.name) {
          setPlanName(newName);
        }
      })
      .catch((error) => {
        console.error('Error renaming plan: ', error);
      });
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
    setActualData([]);
    setPlanName('');
  };

  return (
    <div>
      <h1>Retirement Calculator</h1>
      <AuthUI user={user} />
      <InitialInputForm 
        inputs={initialInputs} 
        setInputs={setInitialInputs}
        planName={planName}
        setPlanName={setPlanName}
      />
      <ProjectionTable 
        projections={projections} 
        actualData={actualData} 
        onActualDataUpdate={updateActualData} 
      />
      <RetirementChart projections={projections} actualData={actualData} />
      <div>
        <button onClick={clearForm}>Clear Form</button>
        {user && (
          <SavePlanForm 
            planName={planName} 
            setPlanName={setPlanName} 
            onSave={saveData}
          />
        )}
      </div>
      {user && savedPlans.length > 0 && (
        <SavedPlansList 
          plans={savedPlans}
          onLoad={loadPlan}
          onDelete={deletePlan}
          onRename={renamePlan}
        />
      )}
      {!user && <p>Log in to save your plans and access your saved plans.</p>}
    </div>
  );
}

export default App;