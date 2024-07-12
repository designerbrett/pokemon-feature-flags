// Layout.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';
import { database, ref, set, onValue, get } from './firebase';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [planName, setPlanName] = useState("Untitled Plan");
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [initialInputs, setInitialInputs] = useState({
    startingYear: new Date().getFullYear(),
    startingAmount: '',
    expectedReturn: '',
    yearlyContribution: '',
    years: 5,
  });
  const [projections, setProjections] = useState([]);
  const [actualData, setActualData] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadSavedPlans(currentUser.uid);
    }
  }, [currentUser]);

  const loadSavedPlans = useCallback((userId) => {
    const plansRef = ref(database, `users/${userId}/plans`);
    onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSavedPlans(Object.values(data));
      }
    }, (error) => {
      console.error('Error loading saved plans: ', error);
    });
  }, []);

  const loadPlan = useCallback((plan) => {
    setPlanName(plan.name);
    setSelectedPlan(plan);
    setInitialInputs(plan.initialInputs);
    setProjections(plan.projections);
    setActualData(plan.actualData);
  }, []);

  const clearForm = useCallback(() => {
    setInitialInputs({
      startingYear: new Date().getFullYear(),
      startingAmount: '',
      expectedReturn: '',
      yearlyContribution: '',
      years: 5,
    });
    setProjections([]);
    setActualData([]);
    setPlanName("Untitled Plan");
    setSelectedPlan(null);
  }, []);

  const savePlan = useCallback((planData) => {
    if (currentUser && planData.name.trim()) {
      const planRef = ref(database, `users/${currentUser.uid}/plans/${planData.id}`);
  
      set(planRef, planData)
        .then(() => {
          console.log('Plan saved successfully');
          setSavedPlans(prevPlans => {
            const index = prevPlans.findIndex(p => p.id === planData.id);
            if (index !== -1) {
              return prevPlans.map(p => p.id === planData.id ? planData : p);
            } else {
              return [...prevPlans, planData];
            }
          });
        })
        .catch((error) => {
          console.error('Error saving plan: ', error);
        });
    } else if (!planData.name.trim()) {
      alert('Please enter a name for your plan before saving.');
    }
  }, [currentUser]);

  const renamePlan = useCallback((planId, newName) => {
    setSavedPlans(prevPlans => 
      prevPlans.map(plan => plan.id === planId ? { ...plan, name: newName } : plan)
    );
    const plansRef = ref(database, `users/${currentUser.uid}/plans`);
    set(plansRef, savedPlans)
      .then(() => {
        console.log('Plan renamed successfully');
        if (planId === savedPlans.find(p => p.name === planName)?.id) {
          setPlanName(newName);
        }
      })
      .catch((error) => {
        console.error('Error renaming plan: ', error);
      });
  }, [currentUser, savedPlans, planName]);

  const deletePlan = useCallback((planId) => {
    setSavedPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    const plansRef = ref(database, `users/${currentUser.uid}/plans`);
    set(plansRef, savedPlans.filter(plan => plan.id !== planId))
      .then(() => {
        console.log('Plan deleted successfully');
        if (planName === savedPlans.find(plan => plan.id === planId)?.name) {
          setPlanName('Untitled Plan');
        }
      })
      .catch((error) => {
        console.error('Error deleting plan: ', error);
      });
  }, [currentUser, savedPlans, planName]);

  const calculateProjections = useCallback((inputs) => {
    if (!inputs.startingYear || !inputs.startingAmount || !inputs.expectedReturn || !inputs.yearlyContribution || !inputs.years) {
      return { newProjections: [], newActualData: [] };
    }
    const startingYear = parseInt(inputs.startingYear);
    const startingAmount = parseFloat(inputs.startingAmount);
    const expectedReturn = parseFloat(inputs.expectedReturn);
    const yearlyContribution = parseFloat(inputs.yearlyContribution);
    const years = parseInt(inputs.years);
  
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
        newActualData.push({
          ...existingActual,
          startBalance: projectionData.startBalance,
          contribution: existingActual.edited ? existingActual.contribution : projectionData.contribution,
          returns: existingActual.edited ? existingActual.returns : projectionData.returns,
          endBalance: existingActual.edited 
            ? existingActual.startBalance + existingActual.contribution + existingActual.returns
            : projectionData.endBalance,
        });
      } else {
        newActualData.push({...projectionData, edited: false});
      }
  
      balance = existingActual && existingActual.edited ? existingActual.endBalance : yearEnd;
    }
  
    return { newProjections, newActualData };
  }, []);

  const updateActualData = useCallback((year, newData) => {
    setActualData(prevData => {
      let updatedData = prevData.map(d => {
        if (d.year === year) {
          return {
            ...d,
            ...newData,
            edited: true,
            endBalance: d.startBalance + parseFloat(newData.contribution) + parseFloat(newData.returns)
          };
        }
        return d;
      });
  
      if (!updatedData.some(d => d.year === year)) {
        const projectionForYear = projections.find(p => p.year === year);
        updatedData.push({
          year,
          startBalance: projectionForYear.startBalance,
          ...newData,
          edited: true,
          endBalance: projectionForYear.startBalance + parseFloat(newData.contribution) + parseFloat(newData.returns)
        });
      }
  
      updatedData.sort((a, b) => a.year - b.year);
  
      const updatedYearIndex = updatedData.findIndex(d => d.year === year);
      for (let i = updatedYearIndex + 1; i < projections.length; i++) {
        const prevYear = updatedData[i - 1];
        const currentProjection = projections[i];
        
        const startBalance = prevYear.endBalance;
        const contribution = updatedData[i]?.edited ? updatedData[i].contribution : currentProjection.contribution;
        const returns = ((startBalance + contribution) * (parseFloat(initialInputs.expectedReturn) / 100));
        const endBalance = startBalance + contribution + returns;
  
        updatedData[i] = {
          year: currentProjection.year,
          startBalance,
          contribution,
          returns,
          endBalance,
          edited: updatedData[i]?.edited || false
        };
      }
  
      return updatedData;
    });
  }, [projections, initialInputs.expectedReturn]);

  const contextValue = useMemo(() => ({
    planName,
    setPlanName,
    initialInputs,
    setInitialInputs,
    projections,
    setProjections,
    actualData,
    setActualData,
    selectedPlan,
    setSelectedPlan,
    calculateProjections,
    updateActualData,
    clearForm,
    savedPlans,
    setSavedPlans,
    savePlan,
    loadPlan,
    deletePlan,
    currentUser,
  }), [
    planName, initialInputs, projections, actualData, selectedPlan,
    calculateProjections, updateActualData, clearForm, savedPlans,
    savePlan, loadPlan, deletePlan, currentUser
  ]);

  return (
    <div>
      <Header 
        showPlanSelector={location.pathname === '/'}
        planName={planName}
        setPlanName={setPlanName}
        savedPlans={savedPlans}
        onSave={() => {
          if (currentUser) {
            const planData = {
              id: Date.now(),
              name: planName.trim(),
              initialInputs,
              projections,
              actualData
            };
            savePlan(planData);
          } else {
            alert("Please log in to save your plan.");
          }
        }}
        onRename={renamePlan}
        onDelete={deletePlan}
        onLoad={loadPlan}
      />
      <main>
        <Outlet context={contextValue} />
      </main>
    </div>
  );
}

export default Layout;