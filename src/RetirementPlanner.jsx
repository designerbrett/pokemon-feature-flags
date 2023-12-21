import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import OptionsModal from './components/OptionsModal';
import { auth } from './components/firebase';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseFormattedNumber = (formattedNumber) => {
  if (typeof formattedNumber === 'number') {
    return formattedNumber;
  }
  return parseFloat((formattedNumber || '').replace(/,/g, '')) || 0;
};

const RetirementPlanner = ({ user }) => {
  const [currentAssets, setCurrentAssets] = useState(localStorage.getItem('currentAssets') || '');
  const [yearsTillRetirement, setYearsTillRetirement] = useState(localStorage.getItem('yearsTillRetirement') || '');
  const [estimatedReturn, setEstimatedReturn] = useState(localStorage.getItem('estimatedReturn') || '');
  const [contributionAmount, setContributionAmount] = useState(localStorage.getItem('contributionAmount') || '');
  const [compoundingFrequency, setCompoundingFrequency] = useState('yearly');
  const [results, setResults] = useState([]);
  const [showInputs, setShowInputs] = useState(true);
  const [enteredValues, setEnteredValues] = useState({
    currentAssets: '',
    yearsTillRetirement: '',
    estimatedReturn: '',
    contributionAmount: '',
    compoundingFrequency: 'yearly',
  });

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const handleToggleOptionsModal = () => {
    setIsOptionsModalOpen(!isOptionsModalOpen);
  };

  const [visibleOptions, setVisibleOptions] = useState({
    period: true,
    starting: true,
    compounding: true,
    contribution: true,
    total: true,
  });

  useEffect(() => {
    setEnteredValues({
      currentAssets,
      yearsTillRetirement,
      estimatedReturn,
      contributionAmount,
      compoundingFrequency,
    });

    localStorage.setItem('currentAssets', currentAssets);
    localStorage.setItem('yearsTillRetirement', yearsTillRetirement);
    localStorage.setItem('estimatedReturn', estimatedReturn);
    localStorage.setItem('contributionAmount', contributionAmount);
    localStorage.setItem('compoundingFrequency', compoundingFrequency);

    calculateRetirementPlan();
  }, [currentAssets, yearsTillRetirement, estimatedReturn, contributionAmount, compoundingFrequency, visibleOptions]);

  useEffect(() => {
    calculateRetirementPlan();
  }, [visibleOptions]);

  const calculateRetirementPlan = () => {
    let currentTotal = parseFormattedNumber(currentAssets);
    const returnRate = parseFloat(estimatedReturn) / 100;
    const compoundingFactor = compoundingFrequency === 'yearly' ? 1 : 12;
    const contribution = parseFormattedNumber(contributionAmount);
  
    let newResults = [];
  
    for (let index = 0; index < parseInt(yearsTillRetirement) * compoundingFactor; index++) {
      const yearlyReturn = currentTotal * returnRate;
      const monthlyReturn = yearlyReturn / 12;
  
      // Calculate the starting amount based on the period
      const startingAmount = index === 0 ? currentTotal : parseFormattedNumber(newResults[index - 1].total);
  
      currentTotal = startingAmount + (compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn);
  
      const totalWithContribution = currentTotal + contribution;
  
      newResults.push({
        period: index + 1,
        startingAmount: formatNumberWithCommas(startingAmount.toFixed(2)),
        compoundingAmount: formatNumberWithCommas((compoundingFrequency === 'yearly' ? yearlyReturn : monthlyReturn).toFixed(2)),
        contributionAmount: formatNumberWithCommas(contribution.toFixed(2)),
        total: formatNumberWithCommas(totalWithContribution.toFixed(2)),
      });
    }
  
    const totalContributions = parseFormattedNumber(
      newResults.reduce((total, result) => total + parseFormattedNumber(result.contributionAmount), 0)
    ).toFixed(2);
  
    const finalBalance = newResults.length > 0 ? parseFormattedNumber(newResults[newResults.length - 1].total) : 0;
    const compoundInterestAccrued =
      newResults.length > 0
        ? finalBalance - parseFormattedNumber(newResults[0].startingAmount) - parseFormattedNumber(totalContributions)
        : 0;
  
    const returnPercentage =
      newResults.length > 0
        ? (
            (finalBalance - parseFormattedNumber(newResults[0]?.startingAmount)) /
            parseFormattedNumber(newResults[0]?.startingAmount) *
            100
          ).toFixed(2)
        : 0;
  
    // Use the newResults array for rendering
    setResults(newResults);
    setReturnPercentage(returnPercentage);
  };
  
  
  
  
  

  const handleReset = () => {
    setCurrentAssets('');
    setYearsTillRetirement('');
    setEstimatedReturn('');
    setContributionAmount('');
    setCompoundingFrequency('yearly');
  };

  const toggleInputs = () => {
    setShowInputs(!showInputs);
  };

  const handleOptionToggle = (option) => {
    setVisibleOptions((prevOptions) => ({
      ...prevOptions,
      [option]: !prevOptions[option],
    }));
  };

  const getTotal = (property) => {
    return results.reduce((total, result) => total + parseFloat(result[property].replace(/,/g, '')), 0).toFixed(2);
  };

  const [returnPercentage, setReturnPercentage] = useState(0);

  const totalContributions = getTotal('contributionAmount');
  const finalBalance = results.length > 0 ? parseFormattedNumber(results[results.length - 1].total) : 0;
  const compoundInterestAccrued = results.length > 0 ? finalBalance - parseFormattedNumber(results[0].startingAmount) - parseFormattedNumber(totalContributions) : 0;

  const getTotalWithCommas = (property) => {
    const total = getTotal(property);
    return formatNumberWithCommas(total);
  };

  return (
    <div>
      <div className='input-container'>
        <div>
          <button onClick={toggleInputs}>{showInputs ? 'Hide Inputs' : 'Edit Inputs'}</button>
        </div>

        {(showInputs || !enteredValues) && (
          <div className='inputs'>
            <div>
              <label>Current Assets:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={`$${currentAssets}`}
                onChange={(e) => setCurrentAssets(e.target.value.replace('$', ''))}
              />
            </div>
            <div>
              <label>Years to save:</label>
              <div className="numeric-input">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={yearsTillRetirement}
                  onChange={(e) => setYearsTillRetirement(e.target.value)}
                />
                <button onClick={() => setYearsTillRetirement((prev) => (prev ? parseInt(prev) - 1 : prev))}>-</button>
                <button onClick={() => setYearsTillRetirement((prev) => (prev ? parseInt(prev) + 1 : prev))}>+</button>
              </div>
            </div>
            <div>
              <label>Estimated Return (%):</label>
              <div className="numeric-input">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={estimatedReturn}
                  onChange={(e) => setEstimatedReturn(e.target.value)}
                />
                <button onClick={() => setEstimatedReturn((prev) => (prev ? parseInt(prev) - 1 : prev))}>-</button>
                <button onClick={() => setEstimatedReturn((prev) => (prev ? parseInt(prev) + 1 : prev))}>+</button>
              </div>
            </div>
            <div>
              <label>Contribution Amount:</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={`$${contributionAmount}`}
                onChange={(e) => setContributionAmount(e.target.value.replace('$', ''))}
              />
            </div>
            <div>
              <label>Compounding Frequency:</label>
              <select value={compoundingFrequency} onChange={(e) => setCompoundingFrequency(e.target.value)}>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <button onClick={handleReset}>Reset</button>
            </div>
          </div>
        )}

        <div className='display-values' style={{ display: showInputs ? 'none' : 'flex' }}>
          <p><strong>Current Assets:</strong> {`$${currentAssets}`}</p>
          <p><strong>Period:</strong> {yearsTillRetirement}</p>
          <p><strong>Est. Return (%):</strong> {estimatedReturn}</p>
          <p><strong>Contribution:</strong> {`$${contributionAmount}`}</p>
          <p><strong>Frequency:</strong> {compoundingFrequency}</p>
        </div>
      </div>

      <div>
        <h2 className='results-heading'>Results</h2>
        <div className='options-dropdown'>
          <button onClick={handleToggleOptionsModal}>Visibility</button>
          <OptionsModal
            isOpen={isOptionsModalOpen}
            onRequestClose={handleToggleOptionsModal}
            visibleOptions={visibleOptions}
            handleOptionToggle={handleOptionToggle}
          />
        </div>
        <div className='results-header'>
          {visibleOptions.period && <div className="year">Period</div>}
          {visibleOptions.starting && <div>Start</div>}
          {visibleOptions.compounding && <div>Compound</div>}
          {visibleOptions.contribution && <div>Contributions</div>}
          {visibleOptions.total && <div>End Total</div>}
        </div>
        <div className="results">
          {results.map((result) => (
            <div className="card" key={result.period}>
              {visibleOptions.period && <div className="year">{result.period}</div>}
              {visibleOptions.starting && <div><span className='dollar-sign'>$</span>{result.startingAmount}</div>}
              {visibleOptions.compounding && <div><span className='dollar-sign'>$</span>{result.compoundingAmount}</div>}
              {visibleOptions.contribution && <div><span className='dollar-sign'>$</span>{result.contributionAmount}</div>}
              {visibleOptions.total && <div><span className='dollar-sign'>$</span>{result.total}</div>}
            </div>
          ))}
        </div>

        <div className='totals-section'>
          <p><strong>Final Balance:</strong> ${formatNumberWithCommas(finalBalance)}</p>
          <p><strong>Interest Accrued:</strong> ${formatNumberWithCommas(compoundInterestAccrued.toFixed(2))}</p>
          <p><strong>Total Contributions:</strong> ${formatNumberWithCommas(totalContributions)}</p>
          <p><strong>Return:</strong> {returnPercentage}%</p>
        </div>
      </div>
    </div>
  );
};

export default RetirementPlanner;
