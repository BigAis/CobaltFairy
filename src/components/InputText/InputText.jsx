import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '../Icon/Icon'
import './InputText.scss'

const InputText = ({ value, onChange, placeholder, label, hasError = false, errorMessage = '', disabled, isRequired, icon, name, style = {}, className, ...props }) => {
	const handleInputChange = (e) => {
		if (onChange) {
			onChange(e) // Pass the updated value to the parent
		}
	}

	const computedClassName = classNames('input-text', className, { hasError, disabled })

	return (
		<div className="input-text-wrapper" style={style}>
			<div className="input-container">
				{icon && <Icon name={icon} className="input-icon" />}
				<input type="text" placeholder={label ? '' : placeholder} value={value} onChange={handleInputChange} className={computedClassName} disabled={disabled} name={name} {...props} />
				{label && (
					<label className={classNames('floating-label', { filled: value || placeholder })}>
						{isRequired && '*'}
						{label}
					</label>
				)}
			</div>
			{hasError && errorMessage && (
				<span className="error-message d-flex gap-5">
					<Icon name="Attention" size={16} />
					{/* needs improvement on icon color */}
					{errorMessage}
				</span>
			)}
		</div>
	)
}

InputText.propTypes = {
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	label: PropTypes.string,
	name: PropTypes.string,
	hasError: PropTypes.bool,
	errorMessage: PropTypes.string,
	disabled: PropTypes.bool,
	isRequired: PropTypes.bool,
	icon: PropTypes.string,
	style: PropTypes.object,
}

export default InputText
