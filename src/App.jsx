import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Header from './components/Header';
import RetirementPlanner from './RetirementPlanner';
import UserAccount from './UserAccount';
import { onAuthStateChange } from './components/firebase';
import { auth } from './components/firebase';
import { getPlans } from './components/firebaseFunctions';


const App = () => {
  const [user, setUser] = useState(null);
  const [planNames, setPlanNames] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);

        // Fetch plan names when the user is authenticated
        getPlans(authUser.uid)
          .then((plans) => {
            const names = plans.map((plan) => plan.name);
            setPlanNames(names);
          })
          .catch((error) => console.error('Error fetching plan names:', error));
      } else {
        setUser(null);
        setPlanNames([]); // Clear plan names when the user is not authenticated
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePlanSelection = (selectedPlan) => {
    // Navigate to the Retirement Planner with the selected plan
    window.location.href = `/retirement-planner/${encodeURIComponent(selectedPlan)}`;
  };

  return (
    <Router>
      <div>
        <div>
        <ul>
              {planNames.map((planName) => (
                <li key={planName} onClick={() => handlePlanSelection(planName)}>
                  {planName}
                </li>
              ))}
            </ul>
      </div>
        <h1><Link to="/">WealthDoodle</Link></h1>
        {!user ? (
          <div>
            <Link to="/signup">Sign Up</Link>
            <Link to="/signin">Sign In</Link>
          </div>
        ) : (
          <div>
            <p>Welcome, <Link to="/user-account">{user.email}</Link></p>
            <button onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        )}

        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/retirement-planner" element={<RetirementPlanner user={user} />} />
          <Route path="/user-account" element={<UserAccount user={user} />} />
          <Route path="*" element={<Home user={user} />} /> {/* Change the route path to "*" */}
          <Route path="/retirement-planner/:planName" element={<RetirementPlanner user={user} />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

const Home = ({ user }) => {
  return (
    <div>
      {/* Content for the home page */}
      {<RetirementPlanner user={user} />}
    </div>
  );
};

export default App;
