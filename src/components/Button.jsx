// src/components/Button.jsx
// import React from 'react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Button.scss'

const Button = ({ children, icon, type = 'primary', active = false, inactive = false, disabled = false, loading = false, onClick, className, ...props }) => {
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
		type === 'primary' ? 'btn-primary' : 'btn-secondary',
		className // clases from props
	)

	return (
		<>
			<button className={computedClassName} onClick={handleClick} disabled={disabled} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} {...props}>
				{loading && <span className="spinner"></span>}

				{icon && icon === 'plus' && !loading ? <span className="icon">+</span> : <span className="icon"></span>}

				{children && <span className="text">{children}</span>}
			</button>
		</>
	)
}

// Prop types validation
Button.propTypes = {
	children: PropTypes.node,
	icon: PropTypes.node,
	type: PropTypes.oneOf(['primary', 'secondary', null]),
	hovered: PropTypes.bool,
	active: PropTypes.bool,
	inactive: PropTypes.bool,
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onClick: PropTypes.func,
	className: PropTypes.string,
}

export default Button
