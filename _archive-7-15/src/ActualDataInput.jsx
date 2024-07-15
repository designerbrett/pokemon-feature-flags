import React, { useState } from 'react';

function ActualDataInput({ onUpdate }) {
  const [year, setYear] = useState('');
  const [contribution, setContribution] = useState('');
  const [returns, setReturns] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parseInt(year), {
      contribution: parseFloat(contribution) || 0,
      returns: parseFloat(returns) || 0
    });
    setYear('');
    setContribution('');
    setReturns('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Update Actual Data</h3>
      <div>
        <label>
          Year:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Actual Contribution:
          <input
            type="number"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Actual Returns:
          <input
            type="number"
            value={returns}
            onChange={(e) => setReturns(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Update</button>
    </form>
  );
}

export default ActualDataInput;