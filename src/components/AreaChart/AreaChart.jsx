import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale)

const AreaChart = () => {
	const data = {
		labels: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
		datasets: [
			{
				label: 'High',
				data: [1, 1, 1, 1, 1, 1, 1],
				borderColor: '#2FBF2F',
				backgroundColor: 'rgba(47, 191, 47, 0.2)',
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0, // Removes points
				pointHoverRadius: 0, // Prevents points from appearing on hover
			},
			{
				label: 'Low',
				data: [0, 0, 0, 0, 0, 0, 0],
				borderColor: '#F4A622',
				backgroundColor: 'rgba(244, 166, 34, 0.1)',
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0, // Removes points
				pointHoverRadius: 0, // Prevents points from appearing on hover
			},
		],
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false, // Hide legend for cleaner UI
			},
			tooltip: {
				enabled: true,
				mode: 'index',
			},
		},
		scales: {
			x: {
				grid: {
					display: false, // Removes vertical grid lines
				},
			},
			y: {
				display: false, // Hide Y-axis labels
				grid: {
					display: false, // Hide horizontal grid lines
				},
			},
		},
	}

	return (
		<div style={{ width: '100%', height: '300px' }}>
			<Line data={data} options={options} />
		</div>
	)
}

export default AreaChart
