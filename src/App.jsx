import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import RetirementPlanner from './RetirementPlanner';
import UserAccount from './UserAccount';
import { onAuthStateChange } from './firebase';
import { auth } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div>
        <h1><Link to="/">Savings Planner</Link></h1>
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
