// UserAccount.jsx
import React, { useState } from 'react';

const UserAccount = ({ user }) => {
  const [totalAssets, setTotalAssets] = useState('');

  const handleTotalAssetsChange = (e) => {
    setTotalAssets(e.target.value);
  };

  const saveTotalAssets = () => {
    // Here, you can implement the logic to save the total assets to your database or perform any other necessary actions
    console.log('Total Assets:', totalAssets);
    // You might want to use Firebase or another backend service to save the user's data
  };

  return (
    <div>
      <h2>User Account</h2>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <div>
            <label>Total Assets:</label>
            <input
              type="text"
              value={totalAssets}
              onChange={handleTotalAssetsChange}
            />
            <button onClick={saveTotalAssets}>Save Total Assets</button>
          </div>
        </div>
      ) : (
        <p>Please sign in to view and update your account information.</p>
      )}
    </div>
  );
};

export default UserAccount;
