import React, { useMemo } from 'react';
import ProjectionRow from './ProjectionRow';

function ProjectionTable({ projections = [], actualData = [], onActualDataUpdate }) {
  const processedActualData = useMemo(() => {
    return projections.map(projection => {
      const actual = actualData.find(d => d.year === projection.year) || {};
      return {
        year: projection.year,
        startBalance: actual.startBalance !== undefined ? actual.startBalance : projection.startBalance,
        contribution: actual.contribution !== undefined ? actual.contribution : projection.contribution,
        returns: actual.returns !== undefined ? actual.returns : projection.returns,
        endBalance: actual.endBalance !== undefined ? actual.endBalance : 
          (actual.startBalance !== undefined ? actual.startBalance : projection.startBalance) +
          (actual.contribution !== undefined ? actual.contribution : projection.contribution) +
          (actual.returns !== undefined ? actual.returns : projection.returns)
      };
    });
  }, [projections, actualData]);

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
        {projections.map((yearData, index) => (
          <ProjectionRow
            key={yearData.year}
            data={yearData}
            actualData={processedActualData[index]}
            onActualDataUpdate={onActualDataUpdate}
          />
        ))}
      </tbody>
    </table>
  );
}

export default React.memo(ProjectionTable);