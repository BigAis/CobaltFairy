import React from 'react'
import { Line } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler  // Import the Filler plugin
} from 'chart.js'

// Register all required components including Filler plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const DashboardChart = ({ isPositive = true }) => {
	// Function to create gradients for chart
	const createGradients = (ctx, area) => {
		// Create gradient for first dataset
		const gradient1 = ctx.createLinearGradient(0, 0, 0, area.height);
		
		if (isPositive) {
			gradient1.addColorStop(0, 'rgba(96, 199, 0, 0.5)');
			gradient1.addColorStop(1, 'rgba(96, 199, 0, 0)');
		} else {
			gradient1.addColorStop(0, 'rgba(255, 166, 0, 0.5)');
			gradient1.addColorStop(1, 'rgba(255, 166, 0, 0)');
		}
		
		// Create gradient for second dataset
		const gradient2 = ctx.createLinearGradient(0, 0, 0, area.height);
		
		if (!isPositive) {
			gradient2.addColorStop(0, 'rgba(96, 199, 0, 0.5)');
			gradient2.addColorStop(1, 'rgba(96, 199, 0, 0)');
		} else {
			gradient2.addColorStop(0, 'rgba(255, 166, 0, 0.5)');
			gradient2.addColorStop(1, 'rgba(255, 166, 0, 0)');
		}
		
		return [gradient1, gradient2];
	};

	const data = {
		labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		datasets: [
			{
				data: [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4],
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return isPositive ? 'rgba(96, 199, 0, 0.2)' : 'rgba(255, 166, 0, 0.1)';
					}
					return createGradients(ctx, chartArea)[0];
				},
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
			{
				data: [1, 1.5, 2, 1.5, 2, 1.5, 1, 2.7, 2, 3, 3.5, 2, 1.8, 1.5, 1.7, 2.3, 0.5, 2.5, 1, 0.5, 4],
				borderColor: !isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return !isPositive ? 'rgba(96, 199, 0, 0.2)' : 'rgba(255, 166, 0, 0.1)';
					}
					return createGradients(ctx, chartArea)[1];
				},
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
		],
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
		},
		scales: {
			x: {
				display: false,
			},
			y: {
				display: false,
				min: 0,
			},
		},
		elements: {
			line: {
				tension: 1,
			},
		},
	}

	return <Line data={data} options={options} />
}

export default DashboardChart