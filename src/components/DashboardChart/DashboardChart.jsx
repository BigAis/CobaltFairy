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
  Filler
} from 'chart.js'

// Register all required components including Filler plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const DashboardChart = ({ 
  isPositive = true, 
  timeseriesData = null, 
  timeseriesKey = 'd7',
  metric1 = 'subs_count',
  metric2 = 'unsubs'
}) => {
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
	
	// Process actual data if available, otherwise use default data
	let chartLabels = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
	let chartData1 = [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4];
	let chartData2 = [1, 1.5, 2, 1.5, 2, 1.5, 1, 2.7, 2, 3, 3.5, 2, 1.8, 1.5, 1.7, 2.3, 0.5, 2.5, 1, 0.5, 4];
	
	// Extract and process data from timeseriesData if available
	if (timeseriesData && timeseriesData[timeseriesKey] && Array.isArray(timeseriesData[timeseriesKey])) {
		const seriesData = timeseriesData[timeseriesKey];
		
		// Format date labels based on timeseriesKey
		if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
			// For daily data: Format as "Jul 22"
			chartLabels = seriesData.map(item => {
				const date = new Date(item.date);
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			});
		} else if (timeseriesKey === 'all') {
			// For monthly data: Format as "Jul 2025"
			chartLabels = seriesData.map(item => {
				const date = new Date(item.date);
				return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			});
		}
		
		// Extract metric data
		chartData1 = seriesData.map(item => item[metric1] || 0);
		chartData2 = seriesData.map(item => item[metric2] || 0);
	}

	const data = {
		labels: chartLabels,
		datasets: [
			{
				data: chartData1,
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
				data: chartData2,
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
				enabled: true, // Enable tooltips to show actual values
				mode: 'index',
				intersect: false,
				callbacks: {
					title: function(tooltipItems) {
						return tooltipItems[0].label || '';
					},
					label: function(context) {
						let label = context.dataset.label || '';
						if (label) {
							label += ': ';
						}
						if (context.parsed.y !== null) {
							label += context.parsed.y.toLocaleString();
						}
						return label;
					}
				}
			},
		},
		scales: {
			x: {
				display: timeseriesData ? true : false, // Show axis labels if we have real data
				ticks: {
					autoSkip: true,
					maxRotation: 45,
					minRotation: 45
				}
			},
			y: {
				display: false,
				min: 0,
			},
		},
		elements: {
			line: {
				tension: 0.4, // Slightly less curved lines for better data representation
			},
		},
	}

	return <Line data={data} options={options} />
}

export default DashboardChart