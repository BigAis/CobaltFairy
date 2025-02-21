import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Stat.scss'
import classNames from 'classnames'
import Icon from '../Icon/Icon'

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Ticks } from 'chart.js'
import { Line } from 'react-chartjs-2'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Stat = ({ stats, hasChart, defaultLabel, className }) => {
	if(!stats) return <></>
	// const defaultOption = stats.find((stat) => stat.defaultValue) || stats[0]
	const defaultOption = stats.find((stat) => stat.label === defaultLabel) || stats[0]
	const [selectedOption, setSelectedOption] = useState(defaultOption)
	const [isOpen, setIsOpen] = useState(false)

	const isPositive = selectedOption && selectedOption.percentage > 0

	const handleOptionSelect = (selected) => {
		setSelectedOption(selected)
		setIsOpen(false)
	}

	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const computedClassName = classNames('stat-wrapper', className)

	const chartData = selectedOption && selectedOption.value ? {
		labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		datasets: [
			{
				data: [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4],
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
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
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
		],
	} 
	const formatNumber = (num) => {
		if (num >= 1000000) {
		  return (num / 1000000).toFixed(1) + 'm';
		} else if (num >= 1000) {
		  return (num / 1000).toFixed(1) + 'k';
		} else {
		  return parseInt(num)
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
	useEffect(()=>{},[])
	return (
		<div className={computedClassName}>
			<div className="stat-select" onClick={toggleDropdown}>
				<span className="stat-selected-option">{selectedOption?.label}</span>
				<span className="arrow">
					<Icon name="ArrowDown" size={24} />
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
				{selectedOption && selectedOption.value ? (<p className="stat-value">{formatNumber(selectedOption.value)}</p>) : (<Skeleton style={{minHeight:'40px'}}/>)}
			</div>
			{hasChart && (
				<div>
					<div style={{ height: '70px' }}>
						<Line data={chartData} options={chartOptions} />
					</div>

					{selectedOption && selectedOption.value ? (<p style={{ color: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)' }} className="stat-percentage"> {selectedOption.percentage}% </p>) : (<></>)}
					
				</div>
			)}
		</div>
	)
}

Stat.propTypes = {
	stats: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.string.isRequired,
			percentage: PropTypes.number.isRequired,
			defaultValue: PropTypes.bool,
		})
	).isRequired,
	hasChart: PropTypes.bool,
	defaultLabel: PropTypes.string,
	className: PropTypes.string,
}

Stat.defaultProps = {
	hasChart: false,
	defaultLabel: '',
	className: '',
}

export default Stat
