import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getDatabase, ref, get } from 'firebase/database';
import { Link } from 'react-router-dom';

function Profile() {
  const { currentUser } = useAuth();
  const [user, setUser] = useState({});
  const db = getDatabase();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userProfileRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userProfileRef);
        if (snapshot.exists()) {
          setUser(snapshot.val());
        }
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  return (
    <div id="page-contained" className="profile">
      <h1>Profile</h1>
      <img
        src={user.profileImage || '/images/default-profile.png'}
        alt="Profile"
        className="profile-image"
        width={100}
      />
      <h2>{user.username}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role || 'User'}</p>
      <div className="biography">{user.biography || 'No biography provided.'}</div>

      <Link to="/profile/edit" className="button">Edit Profile</Link>
    </div>
  );
}

export default Profile;