// Home.jsx

import React, { useEffect, useCallback, useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import InitialInputForm from '../components/InitialInputForm';
import ProjectionTable from '../components/ProjectionTable';
import RetirementChart from '../components/RetirementChart';
import { database, ref, set, onValue } from '../firebase';

function Home() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const {
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
    loadPlan,
  } = useOutletContext();

  const [localProjections, setLocalProjections] = useState(projections);
  const [localActualData, setLocalActualData] = useState(actualData);

  useEffect(() => {
    if (currentUser && selectedPlan) {
      const planRef = ref(database, `users/${currentUser.uid}/plans/${selectedPlan.id}`);
      const unsubscribe = onValue(planRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLocalActualData(data.actualData || []);
          setActualData(data.actualData || []);
          console.log('Loaded actual data:', data.actualData); // Add this log
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser, selectedPlan, setActualData]);

  const handleActualDataUpdate = useCallback((updatedActualData) => {
    setLocalActualData(updatedActualData);
    setActualData(updatedActualData);

    if (currentUser && selectedPlan) {
      const planRef = ref(database, `users/${currentUser.uid}/plans/${selectedPlan.id}`);
      const updatedPlan = {
        ...selectedPlan,
        actualData: updatedActualData
      };
      set(planRef, updatedPlan)
        .then(() => {
          console.log('Plan with actual data saved successfully');
          console.log('Updated actual data:', updatedActualData); // Add this log
        })
        .catch((error) => {
          console.error('Error saving plan with actual data: ', error);
        });
    }
  }, [currentUser, selectedPlan, setActualData]);

  const handleInputChange = useCallback((newInputs) => {
    setInitialInputs(newInputs);
  }, [setInitialInputs]);

  useEffect(() => {
    if (selectedPlan) {
      loadPlan(selectedPlan);
      setPlanName(selectedPlan.name);
      setInitialInputs(selectedPlan.initialInputs);
      setLocalProjections(selectedPlan.projections);
      setLocalActualData(selectedPlan.actualData);
    }
  }, [selectedPlan, loadPlan, setPlanName, setInitialInputs]);

  useEffect(() => {
    if (location.state?.selectedPlan) {
      loadPlan(location.state.selectedPlan);
    }
  }, [location.state, loadPlan]);

  useEffect(() => {
    return () => {
      setSelectedPlan(null);
      clearForm();
    };
  }, [setSelectedPlan, clearForm]);

  useEffect(() => {
    return () => {
      // This will clear the navigation state when leaving the Home page
      window.history.replaceState({}, document.title);
    };
  }, []);

  useEffect(() => {
    if (Object.values(initialInputs).every(value => value !== '')) {
      const { newProjections, newActualData } = calculateProjections(initialInputs);
      setLocalProjections(newProjections);
      setLocalActualData(newActualData);
      setProjections(newProjections);
      setActualData(newActualData);
    }
  }, [initialInputs, calculateProjections, setProjections, setActualData]);

  return (
    <div className="home">
      <InitialInputForm 
        inputs={initialInputs} 
        setInputs={handleInputChange}
      />
      <button onClick={clearForm}>Clear Form</button>
      {(localProjections || []).length > 0 && (
        <>
          <ProjectionTable 
            projections={localProjections} 
            actualData={localActualData} 
            onActualDataUpdate={handleActualDataUpdate}
            expectedReturn={parseFloat(initialInputs.expectedReturn)}
          />
          <RetirementChart projections={localProjections} actualData={localActualData} />
        </>
      )}
    </div>
  );
}

export default React.memo(Home);