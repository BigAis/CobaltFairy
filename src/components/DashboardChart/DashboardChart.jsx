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
	
	let chartLabels = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
	let chartData1 = [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4];
	let chartData2 = [1, 1.5, 2, 1.5, 2, 1.5, 1, 2.7, 2, 3, 3.5, 2, 1.8, 1.5, 1.7, 2.3, 0.5, 2.5, 1, 0.5, 4];
	
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
				return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			});
		}
		
		chartData1 = seriesData.map(item => item[metric1] || 0);
		chartData2 = seriesData.map(item => item[metric2] || 0);
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
						if (timeseriesKey === 'all') {
							if (seriesData.length > 0 && tooltipItems.length > 0) {
								const index = tooltipItems[0].dataIndex;
								if (index >= 0 && index < seriesData.length) {
									const date = new Date(seriesData[index].date);
									if (!isNaN(date.getTime())) {
										return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
									}
								}
							}
						}
						return tooltipItems[0].label || '';
					},
					label: function(context) {
						const datasetIndex = context.datasetIndex;
						const value = context.parsed.y;
						
						const metricName = datasetIndex === 0 ? 
							(metric1 === 'subs_count' ? 'Subscribers' : metric1) : 
							(metric2 === 'unsubs' ? 'Unsubscribed' : metric2);
						
						return `${metricName}: ${value.toLocaleString()} (daily value)`;
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