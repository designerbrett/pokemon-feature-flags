import React, { useState } from 'react';

const RetirementPlanner = () => {
  const [currentAssets, setCurrentAssets] = useState('');
  const [yearsTillRetirement, setYearsTillRetirement] = useState('');
  const [endRetirementTotal, setEndRetirementTotal] = useState('');
  const [results, setResults] = useState([]);

  const calculateRetirementPlan = () => {
    const yearlyContribution = (endRetirementTotal - currentAssets) / yearsTillRetirement;
    let currentTotal = parseFloat(currentAssets);

    const newResults = Array.from({ length: parseInt(yearsTillRetirement) }, (_, index) => {
      currentTotal += yearlyContribution;
      return {
        year: index + 1,
        total: currentTotal.toFixed(2),
        contribution: yearlyContribution.toFixed(2),
      };
    });

    setResults(newResults);
  };

  return (
    <div>
      <h1>Retirement Planner</h1>
      <div>
        <label>Current Retirement Assets:</label>
        <input type="number" value={currentAssets} onChange={(e) => setCurrentAssets(e.target.value)} />
      </div>
      <div>
        <label>Years Till Retirement:</label>
        <input type="number" value={yearsTillRetirement} onChange={(e) => setYearsTillRetirement(e.target.value)} />
      </div>
      <div>
        <label>End Retirement Total:</label>
        <input type="number" value={endRetirementTotal} onChange={(e) => setEndRetirementTotal(e.target.value)} />
      </div>
      <button onClick={calculateRetirementPlan}>Calculate</button>
      <div>
        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Total</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.year}>
                <td>{result.year}</td>
                <td>${result.total}</td>
                <td>${result.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetirementPlanner;
