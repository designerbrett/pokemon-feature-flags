import React, { useMemo, useCallback } from 'react';
import ProjectionRow from './ProjectionRow';

const ProjectionTable = React.memo(({ projections = [], actualData = [], onActualDataUpdate, expectedReturn }) => {
  const processedData = useMemo(() => {
    console.log('Processing data with actualData:', actualData); // Add this log
    return projections.map((projection) => {
      const actual = actualData.find(d => d.year === projection.year) || {};
      const startBalance = projection.startBalance;
      const projectedContribution = projection.contribution;
      const projectedReturns = projection.returns;
      const projectedEndBalance = projection.endBalance;
      const actualContribution = actual.contribution !== undefined ? parseFloat(actual.contribution) : projectedContribution;
      const actualReturns = actual.returns !== undefined ? parseFloat(actual.returns) : projectedReturns;
      const actualEndBalance = startBalance + actualContribution + actualReturns;

      return {
        year: projection.year,
        startBalance,
        projectedContribution,
        projectedReturns,
        projectedEndBalance,
        actualContribution,
        actualReturns,
        actualEndBalance,
      };
    });
  }, [projections, actualData]);

  const handleSaveRow = useCallback((year, newData) => {
    console.log('Saving row data:', year, newData); // Add this log
    const updatedActualData = actualData.map(item => 
      item.year === year ? { ...item, ...newData } : item
    );
    if (!updatedActualData.some(item => item.year === year)) {
      updatedActualData.push({ year, ...newData });
    }
    onActualDataUpdate(updatedActualData);
  }, [actualData, onActualDataUpdate]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Start Balance</th>
            <th>Projected Contribution</th>
            <th>Projected Returns</th>
            <th>Projected End Balance</th>
            <th>Actual Contribution</th>
            <th>Actual Returns</th>
            <th>Actual End Balance</th>
            <th>Difference</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {processedData.map((rowData) => (
            <ProjectionRow
              key={rowData.year}
              data={rowData}
              onSaveRow={handleSaveRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(ProjectionTable);