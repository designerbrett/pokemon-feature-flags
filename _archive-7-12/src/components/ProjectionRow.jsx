import React, { useState, useCallback } from 'react';
import { formatCurrency } from '../utils';

const ProjectionRow = React.memo(({ data, onSaveRow }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    contribution: data.actualContribution,
    returns: data.actualReturns
  });

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    onSaveRow(data.year, editData);
    setIsEditing(false);
  }, [data.year, editData, onSaveRow]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditData({
      contribution: data.actualContribution,
      returns: data.actualReturns
    });
  }, [data.actualContribution, data.actualReturns]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const difference = data.actualEndBalance - data.projectedEndBalance;

  return (
    <tr>
      <td>{data.year}</td>
      <td>{formatCurrency(data.startBalance)}</td>
      <td>{formatCurrency(data.projectedContribution)}</td>
      <td>{formatCurrency(data.projectedReturns)}</td>
      <td>{formatCurrency(data.projectedEndBalance)}</td>
      <td>
        {isEditing ? (
          <input
            type="text"
            name="contribution"
            value={editData.contribution}
            onChange={handleChange}
            inputMode="decimal"
          />
        ) : formatCurrency(data.actualContribution)}
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
        ) : formatCurrency(data.actualReturns)}
      </td>
      <td>{formatCurrency(data.actualEndBalance)}</td>
      <td className={difference >= 0 ? 'positive' : 'negative'}>
        {formatCurrency(difference)}
      </td>
      <td>
        {isEditing ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button onClick={handleEdit}>Edit</button>
        )}
      </td>
    </tr>
  );
});

export default ProjectionRow;