import React, { useState, useEffect } from 'react';
import { formatCurrency } from './utils';

function ProjectionRow({ data, actualData, onActualDataUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    contribution: actualData.contribution !== undefined ? actualData.contribution : data.contribution,
    returns: actualData.returns !== undefined ? actualData.returns : data.returns
  });

  useEffect(() => {
    setEditData({
      contribution: actualData.contribution !== undefined ? actualData.contribution : data.contribution,
      returns: actualData.returns !== undefined ? actualData.returns : data.returns
    });
  }, [actualData, data]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onActualDataUpdate(data.year, editData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const actualStartBalance = actualData.startBalance !== undefined ? actualData.startBalance : data.startBalance;
  const actualContribution = actualData.contribution !== undefined ? parseFloat(actualData.contribution) : parseFloat(data.contribution);
  const actualReturns = actualData.returns !== undefined ? parseFloat(actualData.returns) : parseFloat(data.returns);
  const actualEndBalance = actualStartBalance + actualContribution + actualReturns;

  const difference = actualEndBalance - data.endBalance;
  const differenceClass = difference > 0 ? 'positive' : difference < 0 ? 'negative' : '';

  return (
    <tr>
      <td>{data.year}</td>
      <td>{formatCurrency(data.startBalance)}</td>
      <td>{formatCurrency(data.contribution)}</td>
      <td>{formatCurrency(data.returns)}</td>
      <td>{formatCurrency(data.endBalance)}</td>
      <td>
        {isEditing ? (
          <input
            type="text"
            name="contribution"
            value={editData.contribution}
            onChange={handleChange}
            inputMode="decimal"
          />
        ) : formatCurrency(actualContribution)}
      </td>
      <td>
        {isEditing ? (
          <input
            type="text"
            name="returns"
            value={editData.returns}
            onChange={handleChange}
            inputMode='decimal'
          />
        ) : formatCurrency(actualReturns)}
      </td>
      <td>{formatCurrency(actualEndBalance)}</td>
      <td className={differenceClass}>{formatCurrency(difference)}</td>
      <td>
        {isEditing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={handleEdit}>Edit</button>
        )}
      </td>
    </tr>
  );
}

export default ProjectionRow;