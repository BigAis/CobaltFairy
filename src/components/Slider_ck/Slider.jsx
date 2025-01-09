import { useEffect, useState, useRef } from 'react'
import './Slider.scss'
import PropTypes from 'prop-types'

const Slider = ({ min, max, step, defaultValue, staticTooltip }) => {
	const [value, setValue] = useState(defaultValue)
	const [tooltipLeft, setTooltipLeft] = useState(0)
	const [showTooltip, setShowTooltip] = useState(true)
	const rangeRef = useRef(null)
	const tooltipRef = useRef(null)
	const thumbWidth = 20
	const handleChange = (e) => {
		setValue(e.target.value)
	}
	const handleMouseOver = (e) => {
		setShowTooltip(true)
	}
	const handleMouseOut = (e) => {
		setShowTooltip(false)
	}
	const formatNum = (num) => {
		if (num < 1000) {
			return num
		}
		if (num < 1000000) {
			return (num / 1000).toFixed(1) + 'k'
		}
		if (num < 1000000000) {
			return (num / 1000000).toFixed(1) + 'M'
		}
		if (num < 1000000000000) {
			return (num / 1000000000).toFixed(1) + 'B'
		}
		return (num / 1000000000000).toFixed(1) + 'T'
	}
	useEffect(() => {
		const range = rangeRef.current
		const left = ((value - min) / (max - min)) * (range.clientWidth - thumbWidth) + thumbWidth / 2
		setTooltipLeft(left)
	}, [value])
	return (
		<div className="slider-container">
			<div className="slider-values">
				<span>{min}</span>
				<span>{max}</span>
			</div>
			<div className="slider-wrapper">
				<input
					type="range"
					ref={rangeRef}
					min={min}
					max={max}
					step={step}
					value={value}
					onMouseOver={handleMouseOver}
					onMouseLeave={handleMouseOut}
					onChange={handleChange}
					className="custom-slider"
				/>
				<div
					className="tooltip"
					ref={tooltipRef}
					style={{
						display: showTooltip || staticTooltip ? 'block' : 'none',
						left: `${tooltipLeft}px`,
					}}
				>
					{formatNum(value)}
				</div>
			</div>
		</div>
	)
}

Slider.propTypes = {
	min: PropTypes.number,
	max: PropTypes.number,
	step: PropTypes.number,
	defaultValue: PropTypes.number,
	staticTooltip: PropTypes.bool,
}

Slider.defaultProps = {
	min: 0,
	max: 1000,
	step: 1,
	defaultValue: 500,
	staticTooltip: false,
}

export default Slider
