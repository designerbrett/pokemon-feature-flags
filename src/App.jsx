import React, { useState, useEffect } from 'react';
import Header from './Header';
import InitialInputForm from './InitialInputForm';
import ProjectionTable from './ProjectionTable';
import RetirementChart from './RetirementChart';
import AuthModal from './AuthModal';
import { auth, database, ref, set, onValue } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
  const [planName, setPlanName] = useState("Untitled Plan");
  const [savedPlans, setSavedPlans] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const handleLogin = () => {
    console.log('handleLogin called');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error));
  };

  useEffect(() => {
    calculateProjections();
  }, [initialInputs]);

  useEffect(() => {
    // Recalculate actual data when projections change
    if (projections.length > 0) {
      setActualData(prevActualData => {
        return prevActualData.map(actualYear => {
          const projectionYear = projections.find(p => p.year === actualYear.year);
          if (projectionYear) {
            return {
              ...actualYear,
              startBalance: projectionYear.startBalance,
              endBalance: actualYear.startBalance + actualYear.contribution + actualYear.returns
            };
          }
          return actualYear;
        });
      });
    }
  }, [projections]);

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
  
      // Update actual data
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
  
      // If the year doesn't exist in the data, add it
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
  
      // Sort the data by year
      updatedData.sort((a, b) => a.year - b.year);
  
      // Recalculate future years
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
    setPlanName("Untitled Plan");
  };

  return (
    <div>
      <Header 
        planName={planName}
        setPlanName={setPlanName}
        savedPlans={savedPlans}
        onSave={saveData}
        onRename={renamePlan}
        onDelete={deletePlan}
        onLoad={loadPlan}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="p-4">
      <InitialInputForm 
        inputs={initialInputs} 
        setInputs={setInitialInputs}
      />
      <button onClick={clearForm} className="mt-4 bg-gray-300 px-4 py-2 rounded">Clear Form</button>
      <ProjectionTable 
        projections={projections} 
        actualData={actualData} 
        onActualDataUpdate={updateActualData} 
      />
      <RetirementChart projections={projections} actualData={actualData} />
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}

export default App;