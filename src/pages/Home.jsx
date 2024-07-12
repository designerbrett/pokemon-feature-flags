// Home.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import InitialInputForm from '../components/InitialInputForm';
import ProjectionTable from '../components/ProjectionTable';
import RetirementChart from '../components/RetirementChart';
import { database, ref, set, onValue } from '../firebase';

function Home() {
  const { currentUser } = useAuth();
  const { planName, setPlanName, savedPlans, savePlan, selectedPlan, setSelectedPlan } = useOutletContext();
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
    if (selectedPlan) {
      setInitialInputs(selectedPlan.initialInputs);
      setProjections(selectedPlan.projections);
      setActualData(selectedPlan.actualData);
    }
  }, [selectedPlan]);

  useEffect(() => {
    calculateProjections();
  }, [initialInputs]);

  useEffect(() => {
    if (currentUser && savedPlans.length > 0) {
      // Do something with savedPlans if needed
    }
  }, [currentUser, savedPlans]);

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
  
    setProjections(newProjections);
    setActualData(newActualData);
  };

  const updateActualData = (year, newData) => {
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

  const handleSavePlan = () => {
    savePlan({
      initialInputs,
      projections,
      actualData
    });
  };

  const deletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      const plansRef = ref(database, `users/${currentUser.uid}/plans`);
      set(plansRef, updatedPlans)
        .then(() => {
          console.log('Plan deleted successfully');
          setSavedPlans(updatedPlans);
          if (planName === savedPlans.find(plan => plan.id === planId)?.name) {
            setPlanName('Untitled Plan');
          }
        })
        .catch((error) => {
          console.error('Error deleting plan: ', error);
        });
    }
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
    setPlanName("Untitled Plan");
    setSelectedPlan(null);
  };

  return (
    <div className="home">
      <InitialInputForm 
        inputs={initialInputs} 
        setInputs={setInitialInputs}
      />
      <button onClick={clearForm}>Clear Form</button>
      <ProjectionTable 
        projections={projections} 
        actualData={actualData} 
        onActualDataUpdate={updateActualData} 
      />
      <RetirementChart projections={projections} actualData={actualData} />
    </div>
  );
}

export default Home;