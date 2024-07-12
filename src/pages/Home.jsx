// Home.jsx

import React, { useEffect, useCallback, useState } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import InitialInputForm from '../components/InitialInputForm';
import ProjectionTable from '../components/ProjectionTable';
import RetirementChart from '../components/RetirementChart';

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

  const handleActualDataUpdate = useCallback((year, newData) => {
    updateActualData(year, newData);
    setLocalActualData(prev => {
      const updated = prev.map(item => 
        item.year === year ? { ...item, ...newData } : item
      );
      setActualData(updated);
      return updated;
    });
  }, [updateActualData, setActualData]);

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
          />
          <RetirementChart projections={localProjections} actualData={localActualData} />
        </>
      )}
    </div>
  );
}

export default React.memo(Home);