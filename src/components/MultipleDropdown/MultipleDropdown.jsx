import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Checkbox from '../Checkbox'
import './MultipleDropdown.scss'
import '../arrow.svg'

const MultipleDropdown = ({
	options,
	selectedValues = [],
	disabled = false,
	loading = false,
	onOptionSelect = null,
	className,
	style,
	placeholder = 'Select options', // Default text when nothing is selected
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedOptions, setSelectedOptions] = useState(selectedValues)
	const dropdownRef = useRef(null)

	const toggleDropdown = () => {
		if (!disabled && !loading) {
			setIsOpen((prev) => !prev)
		}
	}

	const handleOptionClick = (option, checked) => {
		let updatedSelection = checked
			? [...selectedOptions, option] // Add to selection if checked
			: selectedOptions.filter((selected) => selected.value !== option.value) // Remove if unchecked

		setSelectedOptions(updatedSelection)

		// If no options are selected, ensure the callback receives an empty array
		if (onOptionSelect) {
			onOptionSelect(updatedSelection.length > 0 ? updatedSelection : []) // Always return an array
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

	// Update state when `selectedValues` changes from parent
	useEffect(() => {
		setSelectedOptions(selectedValues)
	}, [selectedValues])

	const computedClassName = classNames('multiple-dropdown', { disabled, loading }, className)

	return (
		<div className="multiple-dropdown-wrapper" style={style} ref={dropdownRef}>
			<div className={computedClassName} onClick={toggleDropdown}>
				{loading ? (
					<span className="spinner"></span>
				) : selectedOptions.length > 0 ? (
					selectedOptions.map((option) => option.label).join(', ') // Show selected items
				) : (
					<span className="placeholder-text">{placeholder}</span> // Show placeholder if none selected
				)}
				<span className="dropdown-arrow"></span>
			</div>

			{isOpen && (
				<div className="dropdown-menu">
					{options.map((option) => {
						const isSelected = selectedOptions.some((selected) => selected.value == option.value)

						return (
							<div key={option.value} className="dropdown-item">
								<Checkbox checked={isSelected} label={option.label} onChange={(checked) => handleOptionClick(option, checked)} />
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

MultipleDropdown.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	).isRequired,
	selectedValues: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	),
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onOptionSelect: PropTypes.func,
	className: PropTypes.string,
	style: PropTypes.object,
	placeholder: PropTypes.string,
}

export default MultipleDropdown
