import React from 'react';

function InitialInputForm({ inputs, setInputs }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputs(prevInputs => ({
        ...prevInputs,
        [name]: value
      }));
    }
  };

  return (
    <form>
      <div>
        <label htmlFor="startingYear">Starting Year:</label>
        <input
          type="text"
          id="startingYear"
          name="startingYear"
          value={inputs.startingYear}
          onChange={handleChange}
          pattern="\d*"
          inputMode="numeric"
        />
      </div>
      <div>
        <label htmlFor="startingAmount">Starting Amount ($):</label>
        <input
          type="text"
          id="startingAmount"
          name="startingAmount"
          value={inputs.startingAmount}
          onChange={handleChange}
          inputMode="decimal"
        />
      </div>
      <div>
        <label htmlFor="expectedReturn">Expected Annual Return (%):</label>
        <input
          type="text"
          id="expectedReturn"
          name="expectedReturn"
          value={inputs.expectedReturn}
          onChange={handleChange}
          inputMode="decimal"
        />
      </div>
      <div>
        <label htmlFor="yearlyContribution">Yearly Contribution ($):</label>
        <input
          type="text"
          id="yearlyContribution"
          name="yearlyContribution"
          value={inputs.yearlyContribution}
          onChange={handleChange}
          inputMode="decimal"
        />
      </div>
      <div>
        <label htmlFor="years">Number of Years:</label>
        <input
          type="text"
          id="years"
          name="years"
          value={inputs.years}
          onChange={handleChange}
          pattern="\d*"
          inputMode="numeric"
        />
      </div>
    </form>
  );
}

export default InitialInputForm;