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
    <div className="table-container">
      <table>
        <thead>
        <tr>
            <th className="sticky top-header">Year</th>
            <th className="sticky top-header">Projected Start</th>
            <th className="sticky top-header">Projected Contribution</th>
            <th className="sticky top-header">Projected Return</th>
            <th className="sticky top-header">Projected End</th>
            <th className="sticky top-header">Actual Contribution</th>
            <th className="sticky top-header">Actual Return</th>
            <th className="sticky top-header">Actual End</th>
            <th className="sticky top-header">Difference</th>
            <th className="sticky top-header">Action</th>
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
    </div>
  );
}

export default React.memo(ProjectionTable);