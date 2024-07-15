import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        navigate('/profile');
      } else if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleResendVerification = async () => {
    setMessage(null);
    setError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage('Verification email sent. Check your inbox.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="mb-4">Please check your email and click on the verification link to complete the registration process.</p>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button 
        onClick={handleResendVerification}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Resend Verification Email
      </button>
    </div>
  );
}

export default VerifyEmail;