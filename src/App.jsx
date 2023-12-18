import React, { useState } from 'react';

function App() {
  const [currentTotal, setCurrentTotal] = useState('');
  const [yearsToRetire, setYearsToRetire] = useState('');
  const [desiredAmount, setDesiredAmount] = useState('');
  const [result, setResult] = useState(null);

  const calculateRetirement = () => {
    const total = parseFloat(currentTotal);
    const years = parseFloat(yearsToRetire);
    const goal = parseFloat(desiredAmount);

    if (!isNaN(total) && !isNaN(years) && !isNaN(goal) && years > 0) {
      const monthlyContribution = (goal - total) / (years * 12);
      setResult(`To reach your goal, contribute approximately $${monthlyContribution.toFixed(2)} per month.`);
    } else {
      setResult('Please enter valid numbers for all fields.');
    }
  };

  return (
    <div>
      <h1>Retirement Planner</h1>
      <div>
        <label>
          Current Retirement Total:
          <input type="number" value={currentTotal} onChange={(e) => setCurrentTotal(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Years Till Retirement:
          <input type="number" value={yearsToRetire} onChange={(e) => setYearsToRetire(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Desired Retirement Amount:
          <input type="number" value={desiredAmount} onChange={(e) => setDesiredAmount(e.target.value)} />
        </label>
      </div>
      <button onClick={calculateRetirement}>Calculate</button>
      {result && <p>{result}</p>}
    </div>
  );
}

export default App;
