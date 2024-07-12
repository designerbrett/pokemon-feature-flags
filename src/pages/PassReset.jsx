import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Check your inbox for further instructions');
      })
      .catch((error) => {
        setError('Failed to reset password. Make sure the email is correct.');
        console.error('Error sending password reset email:', error);
      });
  };

  return (
    <div id='page-contained'>
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
