import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-4">
        <strong>Email:</strong> {user.email}
      </div>
      {user.emailVerified ? (
        <p className="text-green-500">Email verified</p>
      ) : (
        <p className="text-red-500">Email not verified. <Link to="/verify-email" className="text-blue-500">Verify now</Link></p>
      )}
      <div className="mt-4">
        <Link to="/profile-edit" className="text-blue-500">Edit Profile</Link>
      </div>
    </div>
  );
}

export default Profile;