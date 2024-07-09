import React from 'react';
import ProjectionRow from './ProjectionRow';

function ProjectionTable({ projections, onRowEdit }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Starting Balance</th>
          <th>Contribution</th>
          <th>Return</th>
          <th>Ending Balance</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {projections.map((yearData, index) => (
          <ProjectionRow 
            key={yearData.year} 
            data={yearData} 
            onEdit={(newData) => onRowEdit(index, newData)} 
          />
        ))}
      </tbody>
    </table>
  );
}

export default ProjectionTable;