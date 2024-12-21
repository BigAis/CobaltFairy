// src/components/Button.jsx
// import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
// import './Button.css'

const CFButton = ({ children, icon, hovered = false, active = false, disabled = false, loading = false, onClick, className, ...props }) => {
	const handleClick = (e) => {
		if (disabled || loading) return // Prevent clicks if disabled or loading
		if (onClick) onClick(e)
	}

	const computedClassName = classNames(
		'custom-button', // Default base class
		{
			hovered,
			active,
			disabled,
			loading,
		},
		className // User-defined classes
	)

	return (
		<>
			<style>{`

                .cf-button {
                    border: 2px solid #FF635D;
                    background-color: rgba(255, 195, 173, 0.5);
                    color: rgba(0,0,0,1);
                    font-family:'Inter', sans-serif;
                }
                .cf-button .icon {
                    margin-right: 5px;
                    font-size: 1.2em;
                }
                .spinner {
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    border: 2px solid rgba(0,0,0,0.3);
                    border-radius: 50%;
                    border-top-color: rgba(0,0,0,1);
                    animation: spin .5s linear infinite;
                    margin-right: 8px;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
			<button className={`cf-button ${computedClassName}`} onClick={handleClick} disabled={disabled} {...props}>
				{loading && <span className="spinner"></span>}

				{icon && icon === 'plus' && !loading ? <span className="icon">+</span> : <span className="icon"></span>}

				{children && <span className="text">{children}</span>}
			</button>
		</>
	)
}

// Prop types validation
CFButton.propTypes = {
	children: PropTypes.node,
	icon: PropTypes.node,
	hovered: PropTypes.bool,
	active: PropTypes.bool,
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onClick: PropTypes.func,
	className: PropTypes.string,
}

export default CFButton
