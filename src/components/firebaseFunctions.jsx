// firebaseFunctions.jsx
import { getDatabase, ref, push, set, child, get, update } from 'firebase/database';

export const saveTotalAssets = (userId, totalAssets) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  return update(userRef, { totalAssets });
};

export const saveUsername = (userId, username) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  return update(userRef, { username });
};

export const getUsername = (userId) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);
  return get(userRef).then((snapshot) => snapshot.val()?.username || '');
};

export const savePlan = (userId, planName, planData) => {
  const db = getDatabase();
  const userPlansRef = ref(db, `users/${userId}/plans`);
  const newPlanRef = push(userPlansRef);

  return set(newPlanRef, { name: planName, data: planData })
    .then(() => newPlanRef.key)
    .catch((error) => {
      console.error('Error saving plan:', error);
      throw error;
    });
};

export const getPlans = (userId) => {
  const db = getDatabase();
  const userPlansRef = ref(db, `users/${userId}/plans`);

  return get(userPlansRef)
    .then((snapshot) => {
      const plans = [];
      snapshot.forEach((childSnapshot) => {
        plans.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      return plans;
    })
    .catch((error) => {
      console.error('Error fetching plans:', error);
      throw error;
    });
};