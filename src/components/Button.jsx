// src/components/Button.jsx
// import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Button.scss'
import Icon from './Icon/Icon'

const Button = ({ children, icon, iconSize = null, type = 'primary', active = false, inactive = false, disabled = false, loading = false, onClick, className, ...props }) => {
	const [hovered, setHovered] = useState(false)

	const handleClick = (e) => {
		if (disabled || loading) return // Prevent clicks if disabled or loading
		if (onClick) onClick(e)
	}

	const computedClassName = classNames(
		'btn', // Base class
		{
			hovered,
			active,
			inactive,
			disabled,
			loading,
		},
		`btn-${type}`, // type === 'primary' ? 'btn-primary' : 'btn-secondary',
		// type === 'primary' ? 'btn-primary' : 'btn-secondary',
		className // clases from props
	)

	return (
		<>
			<button className={computedClassName} onClick={handleClick} disabled={disabled} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} {...props}>
				{loading && <span className="spinner"></span>}

				{icon && !loading && <Icon name={icon} size={iconSize} className="icon" />}

				{children && <span className="text">{children}</span>}
			</button>
		</>
	)
}

// Prop types validation
Button.propTypes = {
	children: PropTypes.node,
	icon: PropTypes.string,
	iconSize: PropTypes.number,
	type: PropTypes.oneOf(['primary', 'secondary', 'action', null]),
	hovered: PropTypes.bool,
	active: PropTypes.bool,
	inactive: PropTypes.bool,
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onClick: PropTypes.func,
	className: PropTypes.string,
}

export default Button
