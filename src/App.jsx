import React, { useState, useEffect } from 'react';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseFormattedNumber = (formattedNumber) => {
  return parseFloat(formattedNumber.replace(/,/g, '')) || 0;
};

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

    calculateRetirementPlan();
  }, [currentAssets, yearsTillRetirement, endRetirementTotal, estimatedReturn]);

  const calculateRetirementPlan = () => {
    let currentTotal = parseFloat(currentAssets);
    const returnRate = parseFloat(estimatedReturn) / 100;

    const newResults = Array.from({ length: parseInt(yearsTillRetirement) }, (_, index) => {
      const yearlyReturn = currentTotal * returnRate;

      currentTotal = currentTotal + yearlyReturn;

      return {
        year: index + 1,
        total: formatNumberWithCommas(currentTotal.toFixed(2)),
        yearlyReturn: formatNumberWithCommas(yearlyReturn.toFixed(2)),
      };
    });

    setResults(newResults);
  };

  return (
    <div>
      
      <h1>Retirement Planner</h1>

      <div className='inputs'>
      <div>
        <label>Current Retirement Assets:</label>
        <input type="text" value={`$${currentAssets}`} onChange={(e) => setCurrentAssets(e.target.value.replace('$', ''))} />
      </div>
      <div>
        <label>Years Till Retirement:</label>
        <input type="text" value={yearsTillRetirement} onChange={(e) => setYearsTillRetirement(e.target.value)} />
      </div>
      <div>
        <label>Estimated Percent Return:</label>
        <input type="text" value={estimatedReturn} onChange={(e) => setEstimatedReturn(e.target.value)} />
      </div>
      </div>

      <div>
        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Total</th>
              <th>Yearly Return</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.year}>
                <td>{result.year}</td>
                <td>${result.total}</td>
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
