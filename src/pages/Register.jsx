import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { ref, set, get, getDatabase } from 'firebase/database';
import { useAuth } from '../AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    navigate('/profile');
    return null;
  }

  useEffect(() => {
    if (username) {
      checkUsernameAvailability(username);
    }
  }, [username]);

  const checkUsernameAvailability = async (username) => {
    const db = getDatabase();
    const usernamesRef = ref(db, 'usernames');
    const snapshot = await get(usernamesRef);
    if (snapshot.exists()) {
      const usernames = snapshot.val();
      setUsernameAvailable(!Object.values(usernames).includes(username));
    } else {
      setUsernameAvailable(true);
    }
  };

  const validatePassword = () => {
    let isValid = true;
    if (password !== '' && confirmPassword !== '') {
      if (password !== confirmPassword) {
        isValid = false;
        setError('Passwords do not match');
      }
    }
    return isValid;
  };

  const register = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePassword() || usernameAvailable === false) {
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(auth.currentUser);
      const db = getDatabase();
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email: email,
        username: username,
        role: 'basic'
      });
      await set(ref(db, `usernames/${userCredential.user.uid}`), username);
      navigate('/verify-email');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div id='page-contained'>
      <div className='auth'>
        <h1>Register</h1>
        {error && <div className='auth__error'>{error}</div>}
        <form onSubmit={register} name='registration_form'>
          <input 
            type='email' 
            value={email}
            placeholder="Enter your email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type='text'
            value={username} 
            required
            placeholder='Choose a username'
            onChange={(e) => setUsername(e.target.value)}
          />
          {username && usernameAvailable === false && 
            <div className='username-check'>Username is not available</div>}
          {username && usernameAvailable === true && 
            <div className='username-check'>Username is available</div>}
          <input 
            type='password'
            value={password} 
            required
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type='password'
            value={confirmPassword} 
            required
            placeholder='Confirm password'
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type='submit'>Register</button>
        </form>
        <span>
          Already have an account?  
          <Link to='/login'>login</Link>
        </span>
      </div>
    </div>
  );
}

export default Register;