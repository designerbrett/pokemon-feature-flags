import React, { useState } from 'react';

function ProjectionRow({ data, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(data);  // Reset editData to current data when entering edit mode
  };

  const handleSave = () => {
    setIsEditing(false);
    onEdit(editData);
  };

  const handleChange = (e) => {
    const value = e.target.value === '' ? '' : parseFloat(e.target.value);
    setEditData({ ...editData, [e.target.name]: value });
  };

  if (isEditing) {
    return (
      <tr>
        <td>{data.year}</td>
        <td>{data.startBalance.toFixed(2)}</td>
        <td>
          <input
            type="number"
            name="contribution"
            value={editData.contribution}
            onChange={handleChange}
          />
        </td>
        <td>{data.returns.toFixed(2)}</td>
        <td>{data.endBalance.toFixed(2)}</td>
        <td><button onClick={handleSave}>Save</button></td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{data.year}</td>
      <td>{data.startBalance.toFixed(2)}</td>
      <td>{data.contribution.toFixed(2)}</td>
      <td>{data.returns.toFixed(2)}</td>
      <td>{data.endBalance.toFixed(2)}</td>
      <td><button onClick={handleEdit}>Edit</button></td>
    </tr>
  );
}

export default ProjectionRow;