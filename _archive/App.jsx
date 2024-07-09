// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Header from './components/Header';
import RetirementPlanner from './RetirementPlanner';
import PlanDetail from './PlanDetail';
import UserAccount from './UserAccount';
import { onAuthStateChange } from './components/firebase';
import { auth } from './components/firebase';
import { getPlans, deletePlan } from './components/firebaseFunctions';
import logo from '/images/wd-logo.png';

console.log(logo);

const App = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);

        // Fetch plans (including IDs) when the user is authenticated
        getPlans(authUser.uid)
          .then((plans) => {
            setPlans(plans);
          })
          .catch((error) => console.error('Error fetching plans:', error));
      } else {
        setUser(null);
        setPlans([]); // Clear plans when the user is not authenticated
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handlePlanSelection = (selectedPlanId) => {
    // Use the plan ID directly for navigation
    navigate(`/plan/${encodeURIComponent(selectedPlanId)}`);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(user.uid, planId);
        // After deleting the plan, update the list of plans
        const updatedPlans = await getPlans(user.uid);
        setPlans(updatedPlans);
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  return (
    <Router>
      <div>
        

        {/* Slide-in Menu */}
        <div id="doodleNav" className={`doodles-menu ${menuVisible ? 'visible' : ''}`}>
        <button className="close-btn" onClick={() => setMenuVisible(false)}>
            &times;
          </button>
          <ul>
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link to={`/plan/${encodeURIComponent(plan.id)}`} onClick={() => handlePlanSelection(plan.id)}>
                  {plan.name}
                </Link>
                <p className='menu-timestamp'>{plan.timestamp ? new Date(plan.timestamp).toLocaleString() : ''}</p>
                <button className='btn-no-bg' onClick={() => handleDeletePlan(plan.id)}><i className='fa fa-trash-o'></i></button>
              </li>
            ))}
          </ul>

          {!user ? (
          <div>
            <Link to="/signup">Sign Up</Link>
            <Link to="/signin">Sign In</Link>
          </div>
        ) : (
          <div>
            <p>
              Welcome, <Link to="/user-account">{user.email}</Link>
            </p>
            <button onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        )}
        </div>
        <h1>
          {/* Hamburger Menu Button */}
        <button className="hamburger-menu" onClick={toggleMenu}>
          ☰
        </button>
          <Link to="/"><img className='applogo' src={logo} alt="Logo" /></Link>
          <div></div>
        </h1>
        

        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/user-account" element={<UserAccount user={user} />} />
          <Route path="/retirement-planner" element={<RetirementPlanner user={user} />} />
          <Route path="/retirement-planner/:planId" element={<RetirementPlanner user={user} />} />
          <Route path="/plan/:planId" element={<PlanDetail user={user} />}
/>
          <Route path="*" element={<Home user={user} />} />
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
