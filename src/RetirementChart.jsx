import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RetirementChart({ projections }) {
  const data = {
    labels: projections.map(p => p.year),
    datasets: [
      {
        label: 'Starting Balance',
        data: projections.map(p => p.startBalance),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Contribution',
        data: projections.map(p => p.contribution),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
      {
        label: 'Returns',
        data: projections.map(p => p.returns),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Retirement Savings Projection',
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default RetirementChart;