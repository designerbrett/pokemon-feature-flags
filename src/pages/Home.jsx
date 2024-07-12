// Home.jsx

import React, { useEffect, useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import InitialInputForm from '../components/InitialInputForm';
import ProjectionTable from '../components/ProjectionTable';
import RetirementChart from '../components/RetirementChart';

function Home() {
  const { currentUser } = useAuth();
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
    clearForm
  } = useOutletContext();

  const [localProjections, setLocalProjections] = useState(projections);
  const [localActualData, setLocalActualData] = useState(actualData);

  const handleInputChange = useCallback((newInputs) => {
    setInitialInputs(newInputs);
  }, [setInitialInputs]);

  useEffect(() => {
    if (selectedPlan) {
      setPlanName(selectedPlan.name);
      setInitialInputs(selectedPlan.initialInputs);
      setLocalProjections(selectedPlan.projections);
      setLocalActualData(selectedPlan.actualData);
    }
  }, [selectedPlan, setPlanName, setInitialInputs]);

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