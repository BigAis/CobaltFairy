import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Dropdown.scss'
import './arrow.svg'

const Dropdown = ({
	children,
	options,
	selectedValue = null,
	active = false,
	inactive = false,
	disabled = false,
	loading = null,
	onOptionSelect = null,
	withDivider = null,
	onLeftClick = null,
	className,
	style,
	searchable = false,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [hovered, setHovered] = useState(false)
	const [selectedOption, setSelectedOption] = useState(selectedValue || null)
	const [searchTerm, setSearchTerm] = useState('')
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
			onOptionSelect(option)
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

	useEffect(() => {
		setSelectedOption(selectedValue)
	}, [selectedValue])

	useEffect(() => {
		if (!isOpen) {
			setSearchTerm('')
		}
	}, [isOpen])

	const filteredOptions = options.filter((option) => option?.label?.toLowerCase().includes(searchTerm?.toLowerCase()))

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
		<div className="dropdown-wrapper" style={style} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} ref={dropdownRef}>
			<div className={computedClassName}>
				{withDivider && (
					<div className="dropdown-left" onClick={onLeftClick}>
						{children}
					</div>
				)}

				<div style={{ width: !withDivider ? '100%' : '' }} className="dropdown-right" onClick={toggleDropdown}>
					{loading && <span className="spinner"></span>}
					{withDivider ? '' : selectedOption ? selectedOption.label : children}
					<span className="dropdown-arrow" style={!withDivider ? { marginLeft: '10px' } : { marginLeft: '0' }}></span>
				</div>
			</div>

			{isOpen && (
				<div className="dropdown-menu">
					{searchable && <input type="text" className="dropdown-search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />}
					{filteredOptions.length > 0 ? (
						filteredOptions.map((option, index) => (
							<div key={index} className="dropdown-item" onClick={() => handleOptionClick(option)}>
								{option.label}
							</div>
						))
					) : (
						<div className="dropdown-item disabled">No results</div>
					)}
				</div>
			)}
		</div>
	)
}

Dropdown.propTypes = {
	children: PropTypes.node,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	).isRequired,
	selectedValue: PropTypes.shape({
		value: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
	}),
	active: PropTypes.bool,
	inactive: PropTypes.bool,
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	onOptionSelect: PropTypes.func,
	onLeftClick: PropTypes.func,
	withDivider: PropTypes.bool,
	className: PropTypes.string,
	style: PropTypes.object,
	searchable: PropTypes.bool,
}

export default Dropdown
