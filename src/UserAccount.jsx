// UserAccount.jsx
import React, { useState, useEffect } from 'react';
import { auth, firebaseApp } from './firebase';
import { saveTotalAssets, saveUsername, getUsername } from './components/firebaseFunctions';

const UserAccount = ({ user }) => {
  const [totalAssets, setTotalAssets] = useState('');
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState('');

  const handleTotalAssetsChange = (e) => {
    setTotalAssets(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSaveTotalAssets = () => {
    if (!user) {
      console.error('User not signed in. Unable to save total assets.');
      return;
    }

    const userId = user.uid;

    saveTotalAssets(userId, Number(totalAssets))
      .then(() => {
        console.log('Total Assets saved successfully.');
      })
      .catch((error) => {
        console.error('Error saving Total Assets:', error);
      });
  };

  const handleSaveUsername = () => {
    if (!user) {
      console.error('User not signed in. Unable to save username.');
      return;
    }

    const userId = user.uid;

    saveUsername(userId, username)
      .then(() => {
        console.log('Username saved successfully.');
        // Update the savedUsername state after saving
        setSavedUsername(username);
      })
      .catch((error) => {
        console.error('Error saving Username:', error);
      });
  };

  useEffect(() => {
    if (user) {
      getUsername(user.uid)
        .then((userUsername) => setSavedUsername(userUsername))
        .catch((error) => console.error('Error fetching username:', error));
    }
  }, [user]);

  return (
    <div>
      <h2>User Account</h2>
      {user ? (
        <div>
          <div className='user-info-display-section'>
            <p>Email: {user.email}</p>
          </div>

          <div className='user-assets'>
            <label>Saved Username:</label>
            <p>{savedUsername}</p>
          </div>

          <div className='user-assets'>
            <label>Total Assets:</label>
            <input
              type="text"
              value={totalAssets}
              onChange={handleTotalAssetsChange}
            />
            <button onClick={handleSaveTotalAssets}>Save Total Assets</button>
          </div>

          <div className='user-assets'>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
            <button onClick={handleSaveUsername}>Save Username</button>
          </div>
        </div>
      ) : (
        <p>Please sign in to view and update your account information.</p>
      )}
    </div>
  );
};

export default UserAccount;
