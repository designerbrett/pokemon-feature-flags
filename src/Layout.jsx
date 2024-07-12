// Layout.jsx

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';
import { database, ref, set, onValue } from './firebase';
import { useState, useEffect } from 'react';

function Layout() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [planName, setPlanName] = useState("Untitled Plan");
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadSavedPlans(currentUser.uid);
    }
  }, [currentUser]);

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
    setPlanName(plan.name);
    setSelectedPlan(plan);
  };

  const savePlan = (plan) => {
    if (currentUser && planName.trim()) {
      const existingPlan = savedPlans.find(p => p.name === planName.trim());
      
      const saveAction = () => {
        const newPlan = {
          id: existingPlan ? existingPlan.id : Date.now(),
          name: planName.trim(),
          ...plan
        };
        
        const updatedPlans = existingPlan 
          ? savedPlans.map(p => p.id === existingPlan.id ? newPlan : p)
          : [...savedPlans, newPlan];

        const plansRef = ref(database, `users/${currentUser.uid}/plans`);
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
          saveAction();
        }
      } else {
        saveAction();
      }
    } else if (!planName.trim()) {
      alert('Please enter a name for your plan before saving.');
    }
  };

  const renamePlan = (planId, newName) => {
    const updatedPlans = savedPlans.map(plan => 
      plan.id === planId ? { ...plan, name: newName } : plan
    );
    const plansRef = ref(database, `users/${currentUser.uid}/plans`);
    set(plansRef, updatedPlans)
      .then(() => {
        console.log('Plan renamed successfully');
        setSavedPlans(updatedPlans);
        if (planId === savedPlans.find(p => p.name === planName)?.id) {
          setPlanName(newName);
        }
      })
      .catch((error) => {
        console.error('Error renaming plan: ', error);
      });
  };

  const deletePlan = (planId) => {
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
  };

  return (
    <div>
      <Header 
        showPlanSelector={location.pathname === '/'}
        planName={planName}
        setPlanName={setPlanName}
        savedPlans={savedPlans}
        onSave={savePlan}
        onRename={renamePlan}
        onDelete={deletePlan}
        onLoad={loadPlan}
      />
      <main>
      <Outlet context={{ planName, setPlanName, savedPlans, setSavedPlans, savePlan, selectedPlan, setSelectedPlan }} />
      </main>
    </div>
  );
}

export default Layout;