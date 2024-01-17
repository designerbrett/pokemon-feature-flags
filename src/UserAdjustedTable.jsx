import React, { useState } from 'react';

const initialData = (numYears) => {
  const data = [];
  for (let i = 1; i <= numYears; i++) {
    data.push({
      period: i,
      startingAmount: 0,
      compounding: 0,
      contributions: 0,
      total: 0,
    });
  }
  return data;
};

const SavingsTracker = ({ numYears }) => {
  const [data, setData] = useState(initialData(numYears));

  const recalculateRow = (row, index, newData, fieldEdited) => {
    if (index > 0) {
      row.startingAmount = newData[index - 1].total;
    }

    if (fieldEdited === 'total') {
      // Recalculate compound only if total is directly edited
      row.compounding = parseFloat(row.total) - parseFloat(row.startingAmount) - parseFloat(row.contributions);
    } else {
      // Calculate total based on startingAmount and contributions
      row.total = parseFloat(row.startingAmount) + parseFloat(row.contributions);
      row.compounding = parseFloat(row.total) - parseFloat(row.startingAmount) - parseFloat(row.contributions);
    }

    return row;
  };

  const handleChange = (index, field, value) => {
    let newData = [...data];
    newData[index][field] = parseFloat(value);

    // Recalculate the current row and subsequent rows
    for (let i = index; i < newData.length; i++) {
      newData[i] = recalculateRow(newData[i], i, newData, field);
    }

    setData(newData);
  };

  return (
    <div>
      <h2>User Adjusted</h2>
      <table>
        <thead>
          <tr>
            <th className='sticky'>Period</th>
            <th>Updated Start</th>
            <th>Real Compound</th>
            <th>Real Contributions</th>
            <th>Real Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.period}</td>
              <td>
                {index === 0 ? (
                  <input
                    type="number"
                    value={row.startingAmount}
                    onChange={(e) => handleChange(index, 'startingAmount', e.target.value)}
                  />
                ) : (
                  row.startingAmount.toFixed(2)
                )}
              </td>
              <td>{row.compounding.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  value={row.contributions}
                  onChange={(e) => handleChange(index, 'contributions', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.total}
                  onChange={(e) => handleChange(index, 'total', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SavingsTracker;
