import React from 'react';
import ProjectionRow from './ProjectionRow';

function ProjectionTable({ projections, actualData, onActualDataUpdate }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Projected Start</th>
          <th>Projected Contribution</th>
          <th>Projected Return</th>
          <th>Projected End</th>
          <th>Actual Contribution</th>
          <th>Actual Return</th>
          <th>Actual End</th>
          <th>Difference</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {projections.map((yearData) => (
          <ProjectionRow
            key={yearData.year}
            data={yearData}
            actualData={actualData.find(d => d.year === yearData.year) || {}}
            onActualDataUpdate={onActualDataUpdate}
          />
        ))}
      </tbody>
    </table>
  );
}

export default ProjectionTable;