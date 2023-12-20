import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      // Check if the email is already in use
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // If successful, you can access the user information using userCredential.user
      const user = userCredential.user;

      // Clear the form and reset the error state
      setEmail('');
      setPassword('');
      setError('');

      // Redirect to the homepage
      navigate('/');

      // Optionally, you can redirect the user to a success page or show a success message.
    } catch (error) {
      // Handle errors, for example, if the email is already in use
      if (error.code === 'auth/email-already-in-use') {
        setError(
          <div style={{ color: 'red' }}>
            Email is already in use. Please <Link to="/signin">sign in</Link> instead.
          </div>
        );
      } else {
        setError(<div style={{ color: 'red' }}>{error.message}</div>);
      }
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && (
        <div style={{ color: 'red' }}>
          {error}
        </div>
      )}
      <form>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={handleSignUp}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
