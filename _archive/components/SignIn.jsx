import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';


// Initialize Firebase with your configuration
const firebaseConfig = {
  apiKey: "AIzaSyByeY2xsTIp9elKp3pG6Hdta0fc0w63sPY",
  authDomain: "savings-forecast-dc11a.firebaseapp.com",
  databaseURL: "https://savings-forecast-dc11a-default-rtdb.firebaseio.com",
  projectId: "savings-forecast-dc11a",
  storageBucket: "savings-forecast-dc11a.appspot.com",
  messagingSenderId: "332607005950",
  appId: "1:332607005950:web:0285fa652d93647a74f1af",
  measurementId: "G-7G8F1QSDBM"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      // Sign in with Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);

      // If successful, redirect or perform necessary actions
      navigate('/'); // Adjust the path as needed

    } catch (error) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      const user = result.user;
      console.log('Google Sign-In Successful:', user);
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={handleSignIn}>
          Sign In
        </button>
      </form>
      <div>
        {/* Your other components */}
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      </div>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default SignIn;