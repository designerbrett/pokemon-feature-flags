import React from 'react';

function InitialInputForm({ inputs, setInputs }) {
  // Add this check at the beginning of the component
  if (!inputs) {
    return <div>Loading...</div>; // Or any other placeholder you prefer
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value === '' ? '' : (name === 'startingYear' ? parseInt(value) : parseFloat(value))
    }));
  };

  return (
    <form>
      <div>
        <label htmlFor="startingYear">Starting Year:</label>
        <input
          type="number"
          id="startingYear"
          name="startingYear"
          value={inputs.startingYear || ''}
          onChange={handleChange}
          placeholder="Enter starting year"
        />
      </div>
      <div>
        <label htmlFor="startingAmount">Starting Amount ($):</label>
        <input
          type="number"
          id="startingAmount"
          name="startingAmount"
          value={inputs.startingAmount || ''}
          onChange={handleChange}
          placeholder="Enter starting amount"
        />
      </div>
      <div>
        <label htmlFor="expectedReturn">Expected Annual Return (%):</label>
        <input
          type="number"
          id="expectedReturn"
          name="expectedReturn"
          value={inputs.expectedReturn || ''}
          onChange={handleChange}
          placeholder="Enter expected return"
        />
      </div>
      <div>
        <label htmlFor="yearlyContribution">Yearly Contribution ($):</label>
        <input
          type="number"
          id="yearlyContribution"
          name="yearlyContribution"
          value={inputs.yearlyContribution || ''}
          onChange={handleChange}
          placeholder="Enter yearly contribution"
        />
      </div>
      <div>
        <label htmlFor="years">Number of Years:</label>
        <input
          type="number"
          id="years"
          name="years"
          value={inputs.years || ''}
          onChange={handleChange}
          placeholder="Enter number of years"
        />
      </div>
    </form>
  );
}

export default InitialInputForm;