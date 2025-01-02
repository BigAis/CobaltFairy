import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Dropdown.scss'
import './arrow.svg'

const Dropdown = ({ options, active = false, inactive = false, disabled = false, loading = null, onOptionSelect = null, withDivider = null, className }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [hovered, setHovered] = useState(false)
	const [selectedOption, setSelectedOption] = useState(null)
	const dropdownRef = useRef(null)

	const toggleDropdown = () => {
		if (!disabled && !inactive && !loading) {
			setIsOpen((prev) => !prev)
		}
	}

	const handleOptionClick = (option) => {
		setSelectedOption(option)
		setIsOpen(false)
		if (onOptionSelect) {
			onOptionSelect(option.value)
		}
	}

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const computedClassName = classNames(
		'dropdown',
		{
			hovered,
			active,
			inactive,
			disabled,
			loading,
		},
		className
	)

	return (
		<div className="dropdown-wrapper" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} ref={dropdownRef}>
			<div className={computedClassName} onClick={toggleDropdown}>
				{loading && <span className="spinner"></span>}

				{selectedOption ? selectedOption.label : 'Dropdown'}
				<span className="dropdown-arrow"></span>
				{withDivider && <span className="dropdown-divider"></span>}
			</div>
			{isOpen && (
				<div className="dropdown-menu">
					{options.map((option, index) => (
						<div key={index} className="dropdown-item" onClick={() => handleOptionClick(option)}>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

Dropdown.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	).isRequired,
	active: PropTypes.bool,
	inactive: PropTypes.bool,
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onOptionSelect: PropTypes.func,
	withDivider: PropTypes.bool,
	className: PropTypes.string,
}

export default Dropdown
