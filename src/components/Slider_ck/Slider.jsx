import { useState } from 'react'
import './Slider.scss'
import PropTypes from 'prop-types'

const Slider = ({ min, max, step, defaultValue }) => {
	const [value, setValue] = useState(defaultValue)

	const handleChange = (e) => {
		setValue(e.target.value)
	}

	return (
		<div className="slider-container">
			<div className="slider-values">
				<span>{min}</span>
				<span>{max}</span>
			</div>
			<div className="slider-wrapper">
				<input type="range" min={min} max={max} step={step} value={value} onChange={handleChange} className="custom-slider" />
				<div
					className="tooltip"
					style={{
						left: `${((value - min) / (max - min)) * 100}%`,
					}}
				>
					{value}
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
}

Slider.defaultProps = {
	min: 0,
	max: 1000,
	step: 1,
	defaultValue: 500,
}

export default Slider
