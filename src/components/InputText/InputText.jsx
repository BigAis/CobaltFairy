import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '../Icon/Icon'
import './InputText.scss'

const InputText = ({ placeholder, label, hasError = false, errorMessage = '' }) => {
	const [value, setValue] = useState('')

	const handleInputChange = (e) => {
		setValue(e.target.value)
	}

	return (
		<div className="input-text-wrapper">
			<div className="input-container">
				<input
					type="text"
					placeholder={label ? '' : placeholder} // Hide placeholder if label exists
					value={value}
					onChange={handleInputChange}
					className={classNames('input-text', { hasError })}
				/>
				{label && <label className={classNames('floating-label', { filled: value || placeholder })}>{label}</label>}
			</div>
			{hasError && errorMessage && (
				<span className="error-message">
					<Icon name="Attention" />
					{/* needs improvement on icon color */}
					{errorMessage}
				</span>
			)}
		</div>
	)
}

InputText.propTypes = {
	placeholder: PropTypes.string,
	label: PropTypes.string,
	hasError: PropTypes.bool,
	errorMessage: PropTypes.string,
}

export default InputText
