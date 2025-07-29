import React, { useEffect, useState } from 'react'
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
	// State for chart data and options
	const [chartData, setChartData] = useState(null);
	const [chartOptions, setChartOptions] = useState(null);
	
	// Create gradients for chart coloring
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
	
	// Build chart data when props change
	useEffect(() => {
		buildChartData();
	}, [timeseriesData, timeseriesKey, metric1, metric2, isPositive]);
	
	// Main function to build chart data from timeseries data
	const buildChartData = () => {
		// Initialize arrays for chart data
		let chartLabels = [];
		let chartData1 = [];
		let chartData2 = [];
		let seriesData = [];
		
		// Check if we have timeseries data
		if (!timeseriesData) {
			console.log('No timeseries data available');
			createEmptyChart();
			return;
		}
		
		// Check if we have data for the selected period
		if (!timeseriesData[timeseriesKey] || !Array.isArray(timeseriesData[timeseriesKey])) {
			console.log(`No data available for period ${timeseriesKey}`);
			createEmptyChart();
			return;
		}
		
		// We have data, process it
		seriesData = timeseriesData[timeseriesKey];
		
		if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
			// Daily data with 'date' field
			chartLabels = seriesData.map(item => {
				if (!item.date) return '';
				
				const date = new Date(item.date);
				if (isNaN(date.getTime())) return '';
				
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			});
			
			chartData1 = seriesData.map(item => item[metric1] || 0);
			chartData2 = seriesData.map(item => item[metric2] || 0);
		} else if (timeseriesKey === 'all') {
			// Monthly data with 'period' field
			chartLabels = seriesData.map(item => {
				if (item.period) {
					// Format is '2025-07'
					const parts = item.period.split('-');
					if (parts.length === 2) {
						// Create date from year and month (month is 0-indexed in JS)
						const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
						if (!isNaN(date.getTime())) {
							return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
						}
					}
					return item.period;
				} else if (item.date) {
					const date = new Date(item.date);
					if (!isNaN(date.getTime())) {
						return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
					}
				}
				return '';
			});
			
			chartData1 = seriesData.map(item => item[metric1] || 0);
			chartData2 = seriesData.map(item => item[metric2] || 0);
		} else if (timeseriesKey === 'today') {
			// Today's data with hourly values
			if (seriesData.length === 0) {
				// Create hourly placeholders if no data
				const hours = Array.from({length: 24}, (_, i) => i);
				chartLabels = hours.map(hour => `${hour.toString().padStart(2, '0')}:00`);
				
				chartData1 = Array(24).fill(0);
				chartData2 = Array(24).fill(0);
			} else {
				// We have actual hourly data
				chartLabels = seriesData.map(item => {
					if (!item.date) return '';
					
					const date = new Date(item.date);
					if (isNaN(date.getTime())) return '';
					
					return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
				});
				
				chartData1 = seriesData.map(item => item[metric1] || 0);
				chartData2 = seriesData.map(item => item[metric2] || 0);
			}
		}
		
		// If we still have no data, create default empty chart
		if (chartLabels.length === 0) {
			createEmptyChart();
			return;
		}
		
		// Create chart data object
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
		
		// Create chart options
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
							
							// Try to get date from series data
							if (seriesData && seriesData[index]) {
								const item = seriesData[index];
								if (item.date) {
									const date = new Date(item.date);
									
									if (!isNaN(date.getTime())) {
										if (timeseriesKey === 'all') {
											return date.toLocaleDateString('en-US', { 
												month: 'long', 
												year: 'numeric' 
											});
										} else if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
											return date.toLocaleDateString('en-US', { 
												weekday: 'long',
												month: 'long', 
												day: 'numeric',
												year: 'numeric' 
											});
										} else if (timeseriesKey === 'today') {
											return date.toLocaleString('en-US', { 
												hour: '2-digit',
												minute: '2-digit',
												hour12: true
											});
										}
									}
								} else if (item.period) {
									// Handle 'period' format for 'all' timeframe
									const parts = item.period.split('-');
									if (parts.length === 2) {
										const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
										if (!isNaN(date.getTime())) {
											return date.toLocaleDateString('en-US', { 
												month: 'long', 
												year: 'numeric' 
											});
										}
										return item.period;
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
							
							// Format label based on timeframe
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
					display: true,
					ticks: {
						autoSkip: true,
						maxRotation: 45,
						minRotation: 45
					}
				},
				y: {
					display: false,
					min: 0,
					// Add a small buffer above the maximum value
					suggestedMax: Math.max(...chartData1, ...chartData2) * 1.1 || 5,
				},
			},
			elements: {
				line: {
					tension: 0.4,
				},
			},
		}
		
		setChartData(data);
		setChartOptions(options);
	}
	
	// Create empty chart when no data is available
	const createEmptyChart = () => {
		// Create appropriate empty chart based on timeframe
		let chartLabels = [];
		
		if (timeseriesKey === 'today') {
			chartLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
		} else if (timeseriesKey === 'd7') {
			const today = new Date();
			chartLabels = Array.from({length: 7}, (_, i) => {
				const date = new Date(today);
				date.setDate(date.getDate() - (6-i));
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			});
		} else if (timeseriesKey === 'd30') {
			chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
		} else {
			chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
		}
		
		const chartData1 = Array(chartLabels.length).fill(0);
		const chartData2 = Array(chartLabels.length).fill(0);
		
		const data = {
			labels: chartLabels,
			datasets: [
				{
					label: metric1 === 'subs_count' ? 'Subscribers' : metric1,
					data: chartData1,
					borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
					backgroundColor: isPositive ? 'rgba(96, 199, 0, 0.1)' : 'rgba(255, 166, 0, 0.1)',
					borderWidth: 3,
					tension: 0.4,
					pointRadius: 0,
					fill: true,
				},
				{
					label: metric2 === 'unsubs' ? 'Unsubscribed' : metric2,
					data: chartData2,
					borderColor: !isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
					backgroundColor: !isPositive ? 'rgba(96, 199, 0, 0.1)' : 'rgba(255, 166, 0, 0.1)',
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
				},
			},
			scales: {
				x: {
					display: true,
					ticks: {
						autoSkip: true,
						maxRotation: 45,
						minRotation: 45
					}
				},
				y: {
					display: false,
					min: 0,
					max: 5, // Small max value for empty chart
				},
			},
			elements: {
				line: {
					tension: 0.4,
				},
			},
		}
		
		setChartData(data);
		setChartOptions(options);
	}

	// If data is not ready yet, show loading state
	if (!chartData || !chartOptions) {
		return (
			<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<p>Loading chart data...</p>
			</div>
		);
	}

	return <Line data={chartData} options={chartOptions} />;
}

export default DashboardChart