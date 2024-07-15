import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Header';
import InitialInputForm from './InitialInputForm';
import ProjectionTable from './ProjectionTable';
import RetirementChart from './RetirementChart';
import { auth, database, ref, set, onValue } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import PassReset from './PassReset';
import Profile from './Profile';
import ProfileEdit from './ProfileEdit';
import Register from './Register';
import VerifyEmail from './VerifyEmail';

function App() {
  const [initialInputs, setInitialInputs] = useState({
    startingYear: new Date().getFullYear().toString(),
    startingAmount: '',
    expectedReturn: '',
    yearlyContribution: '',
    years: '5',
  });
  const [projections, setProjections] = useState([]);
  const [actualData, setActualData] = useState([]);
  const [user, setUser] = useState(null);
  const [planName, setPlanName] = useState("Untitled Plan");
  const [savedPlans, setSavedPlans] = useState([]);

  const handleInitialInputChange = useCallback((name, value) => {
    setInitialInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }));
  }, []);

  const memoizedInputs = useMemo(() => initialInputs, [initialInputs]);

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
    let newActualData = [];

    for (let i = 0; i < years; i++) {
      const year = startingYear + i;
      let yearStart = balance;
      let contribution = yearlyContribution;
      let returns = (yearStart + contribution) * (expectedReturn / 100);
      let yearEnd = yearStart + contribution + returns;

      const projectionData = {
        year: year,
        startBalance: parseFloat(yearStart.toFixed(2)),
        contribution: parseFloat(contribution.toFixed(2)),
        returns: parseFloat(returns.toFixed(2)),
        endBalance: parseFloat(yearEnd.toFixed(2)),
      };

      newProjections.push(projectionData);

      const existingActual = actualData.find(d => d.year === year);
      if (existingActual) {
        const actualStartBalance = i === 0 ? startingAmount : newActualData[i-1].endBalance;
        const actualContribution = existingActual.edited ? parseFloat(existingActual.contribution) : projectionData.contribution;
        const actualReturns = existingActual.edited ? parseFloat(existingActual.returns) : projectionData.returns;
        const actualEndBalance = parseFloat((actualStartBalance + actualContribution + actualReturns).toFixed(2));
        
        newActualData.push({
          ...existingActual,
          year: year,
          startBalance: actualStartBalance,
          contribution: actualContribution,
          returns: actualReturns,
          endBalance: actualEndBalance,
          difference: parseFloat((actualEndBalance - projectionData.endBalance).toFixed(2)),
        });

        balance = actualEndBalance;
      } else {
        newActualData.push({
          ...projectionData,
          edited: false,
          difference: 0,
        });

        balance = yearEnd;
      }
    }

    setProjections(newProjections);
    setActualData(newActualData);
  };

  const updateActualData = (year, newData) => {
    setActualData(prevData => {
      let updatedData = [...prevData];
      const index = updatedData.findIndex(d => d.year === year);
      
      if (index !== -1) {
        const projectionData = projections.find(p => p.year === year);
        const actualStartBalance = index === 0 ? parseFloat(initialInputs.startingAmount) : updatedData[index - 1].endBalance;
        const actualContribution = parseFloat(newData.contribution);
        const actualReturns = parseFloat(newData.returns);
        const actualEndBalance = parseFloat((actualStartBalance + actualContribution + actualReturns).toFixed(2));

        updatedData[index] = {
          ...updatedData[index],
          ...newData,
          startBalance: actualStartBalance,
          edited: true,
          endBalance: actualEndBalance,
          difference: parseFloat((actualEndBalance - projectionData.endBalance).toFixed(2)),
        };

        // Update subsequent years
        for (let i = index + 1; i < updatedData.length; i++) {
          const prevYear = updatedData[i - 1];
          const projectionData = projections.find(p => p.year === updatedData[i].year);
          const actualStartBalance = prevYear.endBalance;
          const actualContribution = updatedData[i].edited ? parseFloat(updatedData[i].contribution) : projectionData.contribution;
          const actualReturns = updatedData[i].edited ? parseFloat(updatedData[i].returns) : projectionData.returns;
          const actualEndBalance = parseFloat((actualStartBalance + actualContribution + actualReturns).toFixed(2));

          updatedData[i] = {
            ...updatedData[i],
            startBalance: actualStartBalance,
            endBalance: actualEndBalance,
            difference: parseFloat((actualEndBalance - projectionData.endBalance).toFixed(2)),
          };
        }
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
      years: '5',
    });
    setProjections([]);
    setActualData([]);
    setPlanName("Untitled Plan");
  };

  function Calculator() {
    return (
      <main className="p-4">
        <InitialInputForm 
          inputs={initialInputs} 
          setInputs={handleInitialInputChange}
        />
        <button onClick={clearForm} className="mt-4 bg-gray-300 px-4 py-2 rounded">Clear Form</button>
        <ProjectionTable 
          projections={projections} 
          actualData={actualData} 
          onActualDataUpdate={updateActualData} 
        />
        <RetirementChart projections={projections} actualData={actualData} />
      </main>
    );
  }

  return (
    <Router>
        <Header 
          planName={planName}
          setPlanName={setPlanName}
          savedPlans={savedPlans}
          onSave={saveData}
          onRename={renamePlan}
          onDelete={deletePlan}
          onLoad={loadPlan}
          user={user}
        />
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pass-reset" element={<PassReset />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
        </Routes>
    </Router>
  );

  

}

export default App;