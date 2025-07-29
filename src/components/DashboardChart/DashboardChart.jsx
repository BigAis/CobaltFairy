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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const DashboardChart = ({ 
  isPositive = true, 
  timeseriesData = null, 
  timeseriesKey = 'd7',
  metric1 = 'subs_count',
  metric2 = 'unsubs'
}) => {
	const createGradients = (ctx, area) => {
		const gradient1 = ctx.createLinearGradient(0, 0, 0, area.height);
		
		if (isPositive) {
			gradient1.addColorStop(0, 'rgba(96, 199, 0, 0.5)');
			gradient1.addColorStop(1, 'rgba(96, 199, 0, 0)');
		} else {
			gradient1.addColorStop(0, 'rgba(255, 166, 0, 0.5)');
			gradient1.addColorStop(1, 'rgba(255, 166, 0, 0)');
		}
		
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
	
	// Initialize with empty arrays instead of hardcoded data
	let chartLabels = [];
	let chartData1 = [];
	let chartData2 = [];
	
	let seriesData = [];
	if (timeseriesData && timeseriesData[timeseriesKey] && Array.isArray(timeseriesData[timeseriesKey])) {
		seriesData = timeseriesData[timeseriesKey];
		
		if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
			chartLabels = seriesData.map(item => {
				const date = new Date(item.date);
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			});
		} else if (timeseriesKey === 'all') {
			chartLabels = seriesData.map(item => {
				const date = new Date(item.date);
				// For monthly data, show month and year
				return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			});
		} else if (timeseriesKey === 'today') {
			// For today, show hourly labels if available
			chartLabels = seriesData.map(item => {
				const date = new Date(item.date);
				return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
			});
		}
		
		// Extract actual data from the API response
		chartData1 = seriesData.map(item => item[metric1] || 0);
		chartData2 = seriesData.map(item => item[metric2] || 0);
	} else {
		// If no data available, create empty arrays with appropriate length
		// This ensures we show a flat line at zero instead of sample data
		chartLabels = Array(7).fill('');
		chartData1 = Array(7).fill(0);
		chartData2 = Array(7).fill(0);
	}

	// Get total values for context
	const totalMetric1 = seriesData.length > 0 ? 
		seriesData.reduce((sum, item) => sum + (item[metric1] || 0), 0) : 0;
	const totalMetric2 = seriesData.length > 0 ? 
		seriesData.reduce((sum, item) => sum + (item[metric2] || 0), 0) : 0;

	const data = {
		labels: chartLabels,
		datasets: [
			{
				label: metric1 === 'subs_count' ? 'Subscribers' : metric1,
				data: chartData1,
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
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
				label: metric2 === 'unsubs' ? 'Unsubscribed' : metric2,
				data: chartData2,
				borderColor: !isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
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
				enabled: true,
				mode: 'index',
				intersect: false,
				callbacks: {
					title: function(tooltipItems) {
						if (!tooltipItems || tooltipItems.length === 0) {
							return '';
						}
						
						const index = tooltipItems[0].dataIndex;
						
						// Use the series data directly to get the date
						if (seriesData && seriesData[index] && seriesData[index].date) {
							const dateStr = seriesData[index].date;
							const date = new Date(dateStr);
							
							// Check if date is valid
							if (!isNaN(date.getTime())) {
								if (timeseriesKey === 'all') {
									// For monthly data, show full month and year
									return date.toLocaleDateString('en-US', { 
										month: 'long', 
										year: 'numeric' 
									});
								} else if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
									// For daily data, show full date
									return date.toLocaleDateString('en-US', { 
										weekday: 'long',
										month: 'long', 
										day: 'numeric',
										year: 'numeric' 
									});
								} else if (timeseriesKey === 'today') {
									// For today's data, show time
									return date.toLocaleString('en-US', { 
										hour: '2-digit',
										minute: '2-digit',
										hour12: true
									});
								}
							}
						}
						
						// Fallback to the label if date parsing fails
						return tooltipItems[0].label || '';
					},
					label: function(context) {
						const datasetIndex = context.datasetIndex;
						const value = context.parsed.y;
						const datasetLabel = context.dataset.label;
						
						// Determine the proper label based on the timeframe
						let valueLabel = '';
						if (timeseriesKey === 'today') {
							valueLabel = `${datasetLabel}: ${value.toLocaleString()} (hourly)`;
						} else if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
							valueLabel = `${datasetLabel}: ${value.toLocaleString()} (daily)`;
						} else if (timeseriesKey === 'all') {
							valueLabel = `${datasetLabel}: ${value.toLocaleString()} (monthly)`;
						} else {
							valueLabel = `${datasetLabel}: ${value.toLocaleString()}`;
						}
						
						return valueLabel;
					}
				}
			},
		},
		scales: {
			x: {
				display: timeseriesData ? true : false,
				ticks: {
					autoSkip: true,
					maxRotation: 45,
					minRotation: 45
				}
			},
			y: {
				display: false,
				min: 0,
				// Add a small buffer above the maximum value for better visualization
				suggestedMax: Math.max(...chartData1, ...chartData2) * 1.1 || 5,
			},
		},
		elements: {
			line: {
				tension: 0.4,
			},
		},
	}

	return <Line data={data} options={options} />
}

export default DashboardChart