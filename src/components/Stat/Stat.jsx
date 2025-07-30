import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './Stat.scss'
import classNames from 'classnames'
import Icon from '../Icon/Icon'

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
import { Line } from 'react-chartjs-2'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Register all required components including Filler plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const Stat = ({ 
	stats, 
	hasChart = false, 
	defaultLabel = '', 
	className = '',
	timeseriesData = null,
	timeseriesKey = 'd7',
	metricKey = null
}) => {
	if(!stats) return <></>
	
	const defaultOption = stats.find((stat) => stat.label === defaultLabel) || stats[0]
	const [selectedOption, setSelectedOption] = useState(defaultOption)
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

	const isPositive = selectedOption && selectedOption.percentage > 0
	
	// Function to create gradients for chart
	const createGradient = (ctx, area) => {
		// Create gradient for chart backgrounds
		const gradient = ctx.createLinearGradient(0, 0, 0, area.height);
		
		if (isPositive) {
			gradient.addColorStop(0, 'rgba(96, 199, 0, 0.5)');
			gradient.addColorStop(1, 'rgba(96, 199, 0, 0)');
		} else {
			gradient.addColorStop(0, 'rgba(255, 166, 0, 0.5)');
			gradient.addColorStop(1, 'rgba(255, 166, 0, 0)');
		}
		
		return gradient;
	};

	const handleOptionSelect = (selected) => {
		setSelectedOption(selected)
		setIsOpen(false)
	}

	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const computedClassName = classNames('stat-wrapper', className)
	
	// Get the appropriate metric key for the chart based on the selected option
	const getMetricKeyForChart = () => {
		if (metricKey) return metricKey;
		
		// Map stat label to metric key in timeseries data
		switch(selectedOption?.label) {
			case 'Emails Sent':
				return 'emails';
			case 'Total Opens':
				return 'opens';
			case 'Total Clicks':
				return 'clicks';
			case 'Open Rate':
				return 'open_rate';
			case 'Click Rate':
				return 'click_rate';
			case 'Total':
			case 'Total Subscribers':
			case 'New Subscribers Today':
			case 'New Subscribers (7 days)':
			case 'New Subscribers (30 days)':
				return 'subs_count';
			case 'Unsubscribed':
			case 'Unsubscribed Today':
			case 'Unsubscribed (7 days)':
			case 'Unsubscribed (30 days)':
			case 'Total Unsubscribed':
				return 'unsubs';
			case 'Spam':
				return 'spam';
			default:
				// If we can't match a key, return null
				return null;
		}
	}
	
	// Extract chart data from timeseries if available
	// Initialize with empty arrays instead of hardcoded sample data
	let chartLabels = [];
	let chartData = [];
	
	const currentMetricKey = getMetricKeyForChart();
	
	if (timeseriesData && timeseriesData[timeseriesKey] && Array.isArray(timeseriesData[timeseriesKey]) && currentMetricKey) {
		const seriesData = timeseriesData[timeseriesKey];
		
		// Format date labels based on timeseriesKey
		if (timeseriesKey === 'd7' || timeseriesKey === 'd30') {
			// For daily data: Format as "Jul 22"
			chartLabels = seriesData.map(item => {
				if (!item.date) return '';
				
				const date = new Date(item.date);
				if (isNaN(date.getTime())) return '';
				
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			});
			
			// Extract metric data
			chartData = seriesData.map(item => item[currentMetricKey] || 0);
		} else if (timeseriesKey === 'all') {
			// For monthly data, handle 'period' format
			chartLabels = seriesData.map(item => {
				if (item.period) {
					// Format is '2025-07'
					const parts = item.period.split('-');
					if (parts.length === 2) {
						const date = new Date(parts[0], parts[1] - 1); // months are 0-indexed in JS
						return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
					}
					return item.period;
				} else if (item.date) {
					const date = new Date(item.date);
					return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
				}
				return '';
			});
			
			// Extract metric data
			chartData = seriesData.map(item => item[currentMetricKey] || 0);
		} else if (timeseriesKey === 'today') {
			// For hourly data: Format as "13:00"
			chartLabels = seriesData.map(item => {
				if (!item.date) return '';
				
				const date = new Date(item.date);
				if (isNaN(date.getTime())) return '';
				
				return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
			});
			
			// Ειδική διαχείριση για το unsubs στο today
			if (currentMetricKey === 'unsubs') {
				// Ψάχνουμε στο d7 για τη σημερινή ημερομηνία
				const today = new Date();
				const todayString = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
				
				let todayUnsubs = 0;
				
				// Έλεγχος αν υπάρχει d7 timeseries
				if (timeseriesData.d7 && Array.isArray(timeseriesData.d7)) {
					const todayData = timeseriesData.d7.find(item => {
						if (!item.date) return false;
						const itemDate = new Date(item.date).toISOString().split('T')[0];
						return itemDate === todayString;
					});
					
					if (todayData) {
						todayUnsubs = todayData.unsubs || 0;
					}
				}
				
				// Βάζουμε την τιμή από το d7 για το today
				chartData = seriesData.map((item, index) => {
					const date = new Date(item.date);
					const currentHour = new Date().getHours();
					
					// Αν είναι η τρέχουσα ώρα, επιστρέφουμε το todayUnsubs
					if (date.getHours() === currentHour) {
						return todayUnsubs;
					}
					return 0;
				});
			} else {
				// Για άλλα metrics, χρησιμοποιούμε κανονικά την τιμή
				chartData = seriesData.map(item => item[currentMetricKey] || 0);
			}
		}
	}
	
	// If we still have no data, create some reasonable empty dataset
	if (chartLabels.length === 0) {
		if (timeseriesKey === 'today') {
			chartLabels = ['00:00', '06:00', '12:00', '18:00', '23:59'];
		} else if (timeseriesKey === 'd7') {
			const today = new Date();
			chartLabels = Array.from({length: 7}, (_, i) => {
				const date = new Date(today);
				date.setDate(date.getDate() - i);
				return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			}).reverse();
		} else if (timeseriesKey === 'd30') {
			chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
		} else {
			chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
		}
		
		chartData = Array(chartLabels.length).fill(0);
	}

	const chartData2 = {
		labels: chartLabels,
		datasets: [
			{
				data: chartData,
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: function(context) {
					const chart = context.chart;
					const {ctx, chartArea} = chart;
					
					if (!chartArea) {
						// This can happen when the chart is not yet rendered
						return isPositive ? 'rgba(96, 199, 0, 0.2)' : 'rgba(255, 166, 0, 0.1)';
					}
					return createGradient(ctx, chartArea);
				},
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
		],
	}
	
	const formatNumber = (num) => {
		// Handle both string and number types
		const numValue = typeof num === 'string' ? parseFloat(num) : num;
		
		if (isNaN(numValue)) return '0';
		
		if (numValue >= 1000000) {
		  return (numValue / 1000000).toFixed(1) + 'm';
		} else if (numValue >= 1000) {
		  return (numValue / 1000).toFixed(1) + 'k';
		} else {
		  return Math.round(numValue).toString();
		}
	}

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: true, // Enable tooltips
				mode: 'index',
				intersect: false,
				callbacks: {
					title: function(tooltipItems) {
						if (!tooltipItems || tooltipItems.length === 0) {
							return '';
						}
						
						// Get the date from timeseries data if available
						if (timeseriesData && timeseriesData[timeseriesKey] && 
							Array.isArray(timeseriesData[timeseriesKey]) && 
							tooltipItems[0].dataIndex < timeseriesData[timeseriesKey].length) {
							
							const item = timeseriesData[timeseriesKey][tooltipItems[0].dataIndex];
							if (item && item.date) {
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
											day: 'numeric'
										});
									} else if (timeseriesKey === 'today') {
										return date.toLocaleTimeString('en-US', { 
											hour: '2-digit',
											minute: '2-digit',
											hour12: true
										});
									}
								}
							} else if (item && item.period) {
								// Handle 'period' format for 'all' timeframe
								const parts = item.period.split('-');
								if (parts.length === 2) {
									const date = new Date(parts[0], parts[1] - 1); // months are 0-indexed in JS
									return date.toLocaleDateString('en-US', { 
										month: 'long', 
										year: 'numeric' 
									});
								}
								return item.period;
							}
						}
						
						return tooltipItems[0].label || '';
					},
					label: function(context) {
						let label = selectedOption?.label || '';
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
				display: false,
			},
			y: {
				display: false,
				min: 0,
				// Add a small buffer above the maximum value for better visualization
				suggestedMax: Math.max(...chartData) * 1.1 || 5,
			},
		},
		elements: {
			line: {
				tension: 0.4,
			},
		},
	}
	
	// Handle responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}
		
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])
	
	useEffect(() => {
		const option = stats.find((stat) => stat.label === defaultLabel);
		if (option) {
			setSelectedOption(option);
		}
	}, [stats, defaultLabel])
	
	return (
		<div className={computedClassName}>
			<div className="stat-select" onClick={toggleDropdown}>
				<span className="stat-selected-option">{selectedOption?.label}</span>
				<span className="arrow">
					<Icon name="ArrowDown" size={isMobile ? 16 : 24} />
				</span>
			</div>

			{isOpen && (
				<div className="stat-menu">
					{stats.map((stat) => (
						<div key={stat.label} className="stat-option" onClick={() => handleOptionSelect(stat)}>
							{stat.label === selectedOption?.label ? <span style={{ color: 'rgba(255, 76, 73, 1)' }}>{stat.label}</span> : stat.label}
						</div>
					))}
				</div>
			)}

			<div>
				{selectedOption && (selectedOption.value || selectedOption.value === 0) ? 
					(<p className="stat-value">{formatNumber(selectedOption.value)}</p>) : 
					(<Skeleton style={{minHeight: isMobile ? '30px' : '40px'}}/>)
				}
			</div>
			{hasChart && (
				<div>
					<div style={{ height: isMobile ? '50px' : '70px' }}>
						<Line data={chartData2} options={chartOptions} />
					</div>

					{selectedOption && selectedOption.value ? 
						(<p style={{ color: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)' }} className="stat-percentage"> {selectedOption.percentage}% </p>) : 
						(<></>)
					}
				</div>
			)}
		</div>
	)
}

Stat.propTypes = {
	stats: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.number
			]).isRequired,
			percentage: PropTypes.number.isRequired,
			defaultValue: PropTypes.bool,
		})
	).isRequired,
	hasChart: PropTypes.bool,
	defaultLabel: PropTypes.string,
	className: PropTypes.string,
	timeseriesData: PropTypes.object, // New prop for timeseries data
	timeseriesKey: PropTypes.string, // Which time period to use
	metricKey: PropTypes.string, // Optional explicit metric key
}

export default Stat