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
				return 'subs_count';
			case 'Unsubscribed':
				return 'unsubs';
			case 'Spam':
				return 'spam';
			default:
				// If we can't match a key, return null
				return null;
		}
	}
	
	// Extract chart data from timeseries if available
	let chartLabels = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
	let chartData = [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4];
	
	const currentMetricKey = getMetricKeyForChart();
	
	if (timeseriesData && timeseriesData[timeseriesKey] && Array.isArray(timeseriesData[timeseriesKey]) && currentMetricKey) {
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
		chartData = seriesData.map(item => item[currentMetricKey] || 0);
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
				enabled: timeseriesData ? true : false, // Enable tooltips only when using real data
				mode: 'index',
				intersect: false,
				callbacks: {
					title: function(tooltipItems) {
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