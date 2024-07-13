import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will happen in the useEffect hook
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div id='page-contained'>
      <div className='auth'>
        <h1>Login</h1>
        {error && <div className='auth__error'>{error}</div>}
        <form onSubmit={handleLogin} name='login_form'>
          <input 
            type='email' 
            value={email}
            required
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type='password'
            value={password}
            required
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type='submit'>Login</button>
        </form>
        <p>
          Don't have an account? 
          <Link to='/register'>Create one here</Link>
        </p>
        <p>
          <Link to='/passwordreset'>Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;