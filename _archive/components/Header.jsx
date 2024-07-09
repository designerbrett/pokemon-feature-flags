// Header.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using React Router

const Header = ({ planNames }) => {
  return (
    <div>
      <h1>Your App Name</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {planNames.map((planName) => (
            <li key={planName}>
              <Link to={`/retirement-planner/${encodeURIComponent(planName)}`}>{planName}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Header;
