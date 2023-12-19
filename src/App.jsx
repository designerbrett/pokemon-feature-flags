import React, { useState, useEffect } from 'react';

const RetirementPlanner = () => {
  const [currentAssets, setCurrentAssets] = useState(localStorage.getItem('currentAssets') || '');
  const [yearsTillRetirement, setYearsTillRetirement] = useState(localStorage.getItem('yearsTillRetirement') || '');
  const [endRetirementTotal, setEndRetirementTotal] = useState(localStorage.getItem('endRetirementTotal') || '');
  const [estimatedReturn, setEstimatedReturn] = useState(localStorage.getItem('estimatedReturn') || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    localStorage.setItem('currentAssets', currentAssets);
    localStorage.setItem('yearsTillRetirement', yearsTillRetirement);
    localStorage.setItem('endRetirementTotal', endRetirementTotal);
    localStorage.setItem('estimatedReturn', estimatedReturn);
  }, [currentAssets, yearsTillRetirement, endRetirementTotal, estimatedReturn]);

  const calculateRetirementPlan = () => {
    const yearlyContribution = (endRetirementTotal - currentAssets) / yearsTillRetirement;
    let currentTotal = parseFloat(currentAssets);
    const returnRate = parseFloat(estimatedReturn) / 100;

    const newResults = Array.from({ length: parseInt(yearsTillRetirement) }, (_, index) => {
      const yearlyReturn = currentTotal * returnRate;

      // Calculate the adjusted contribution as a percentage of the remaining amount needed
      const remainingAmount = endRetirementTotal - currentTotal;
      const adjustedContributionPercentage = remainingAmount > 0 ? yearlyContribution / remainingAmount : 0;
      const adjustedContribution = adjustedContributionPercentage * remainingAmount;

      currentTotal = currentTotal + adjustedContribution + yearlyReturn;

      return {
        year: index + 1,
        total: currentTotal.toFixed(2),
        contribution: adjustedContribution.toFixed(2),
        yearlyReturn: yearlyReturn.toFixed(2),
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
      <div>
        <label>Estimated Percent Return:</label>
        <input type="number" value={estimatedReturn} onChange={(e) => setEstimatedReturn(e.target.value)} />
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
              <th>Yearly Return</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.year}>
                <td>{result.year}</td>
                <td>${result.total}</td>
                <td>${result.contribution}</td>
                <td>${result.yearlyReturn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetirementPlanner;
