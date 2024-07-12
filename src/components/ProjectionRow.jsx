import React, { useState, useCallback } from 'react';
import { formatCurrency } from '../utils';

function ProjectionRow({ data, actualData, onActualDataUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    contribution: actualData.contribution,
    returns: actualData.returns
  });

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditData({
      contribution: actualData.contribution,
      returns: actualData.returns
    });
  }, [actualData]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    onActualDataUpdate(data.year, editData);
  }, [data.year, editData, onActualDataUpdate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const difference = actualData.endBalance - data.endBalance;
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
        ) : formatCurrency(actualData.contribution)}
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
        ) : formatCurrency(actualData.returns)}
      </td>
      <td>{formatCurrency(actualData.endBalance)}</td>
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

export default React.memo(ProjectionRow);