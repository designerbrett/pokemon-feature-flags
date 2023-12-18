import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

function App() {
  const [currentTotal, setCurrentTotal] = useState('');
  const [yearsToRetire, setYearsToRetire] = useState('');
  const [desiredAmount, setDesiredAmount] = useState('');
  const [chartData, setChartData] = useState(null);

  const calculateRetirement = () => {
    // ... (same as before)

    if (!isNaN(total) && !isNaN(years) && !isNaN(goal) && years > 0) {
      const monthlyContribution = (goal - total) / (years * 12);
      const contributions = Array.from({ length: years }, (_, index) => {
        return parseFloat((monthlyContribution * 12 * (index + 1)).toFixed(2));
      });

      setChartData({
        labels: Array.from({ length: years }, (_, index) => `Year ${index + 1}`),
        datasets: [
          {
            label: 'Yearly Contribution',
            data: contributions,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
          },
        ],
      });
    } else {
      setChartData(null);
    }
  };

  return (
    <div>
      {/* ... (same as before) */}
      <button onClick={calculateRetirement}>Calculate</button>
      {chartData && (
        <div>
          <h2>Yearly Contributions Chart</h2>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
}

export default App;
