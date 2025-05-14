import React from 'react'
import { Line } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  LineElement, 
  PointElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale,
  Filler  // Import the Filler plugin
} from 'chart.js'

// Register all required components including Filler plugin
ChartJS.register(LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale, Filler)

const AreaChart = () => {
	// Function to create a gradient - will be called when chart renders
	const createGradient = (ctx, area) => {
		const gradientGreen = ctx.createLinearGradient(0, 0, 0, area.height);
		gradientGreen.addColorStop(0, 'rgba(47, 191, 47, 0.5)');
		gradientGreen.addColorStop(1, 'rgba(47, 191, 47, 0)');
		
		const gradientOrange = ctx.createLinearGradient(0, 0, 0, area.height);
		gradientOrange.addColorStop(0, 'rgba(244, 166, 34, 0.3)');
		gradientOrange.addColorStop(1, 'rgba(244, 166, 34, 0)');
		
		return [gradientGreen, gradientOrange];
	};

	const data = {
		labels: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
		datasets: [
			{
				label: 'High',
				data: [1, 1, 1, 1, 1, 1, 1],
				borderColor: '#2FBF2F',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return 'rgba(47, 191, 47, 0.2)';
					}
					return createGradient(ctx, chartArea)[0];
				},
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 0,
			},
			{
				label: 'Low',
				data: [0, 0, 0, 0, 0, 0, 0],
				borderColor: '#F4A622',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return 'rgba(244, 166, 34, 0.1)';
					}
					return createGradient(ctx, chartArea)[1];
				},
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 0,
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
				enabled: true,
				mode: 'index',
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
			},
			y: {
				display: false,
				grid: {
					display: false,
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