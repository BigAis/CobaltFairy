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
  Filler  // Import the Filler plugin
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
	className = '' 
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

	const chartData = selectedOption && (parseFloat(selectedOption.value) >= 0 || typeof selectedOption.value === 'number') ? {
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
					return createGradient(ctx, chartArea);
				},
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
		],
	} : 
	{labels: ['','',''],
		datasets: [
			{
				data: [0,0,0],
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				backgroundColor: isPositive ? 'rgba(96, 199, 0, 0.2)' : 'rgba(255, 166, 0, 0.1)',
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
	
	// Handle responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}
		
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])
	
	useEffect(() => {
		for(const ss of stats){
			if(ss.label===defaultLabel){
				setSelectedOption(ss)
			}
		}
	},[stats, defaultLabel])
	
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
						<Line data={chartData} options={chartOptions} />
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
}

export default Stat