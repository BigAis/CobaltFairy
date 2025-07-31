import { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Icon from '../Icon/Icon'
import './InputText.scss'
import EmojiPicker from 'emoji-picker-react'

const InputText = ({
	value,
	onChange,
	placeholder,
	label,
	hasError = false,
	errorMessage = '',
	disabled,
	isRequired,
	icon,
	name,
	style = {},
	emojiPicker = false,
	className,
	type = 'text',
	passwordToggle = false,
	...props
}) => {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

	const handleInputChange = (e) => {
		if (onChange) {
			onChange(e) // Pass the updated value to the parent
		}
	}

	const handleEmojiClick = (emojiData) => {
		if (onChange) {
			onChange({ target: { value: value + emojiData.emoji } }) // Append emoji to input
		}
		setShowEmojiPicker(false) // Close emoji picker after selection
	}

	const handlePasswordToggle = () => {
		setShowPassword(!showPassword)
	}

	const getInputType = () => {
		if (passwordToggle) {
			return showPassword ? 'text' : 'password'
		}
		return type
	}

	const getPasswordIcon = () => {
		return showPassword ? 'EyeOff' : 'Eye'
	}

	const computedClassName = classNames('input-text', className, { hasError, disabled })

	return (
		<>
			<div className="input-text-wrapper" style={style}>
				<div className="input-container">
					{icon && !emojiPicker && !passwordToggle && (
						<Icon
							name={icon}
							className="input-icon"
							onClick={() => {
								console.log('asda')
							}} // Handle icon click
						/>
					)}
					{icon === 'Emoji' && emojiPicker && (
						<div className="icon-wrapper" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ cursor: 'pointer' }}>
							<Icon name={icon} className="input-icon" />
						</div>
					)}
					{passwordToggle && (
						<div
							className="password-toggle-icon"
							onClick={handlePasswordToggle}
							style={{
								position: 'absolute',
								right: '16px',
								top: '50%',
								transform: 'translateY(-50%)',
								cursor: 'pointer',
								zIndex: 10,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '20px',
								height: '20px',
							}}
						>
							<Icon name={getPasswordIcon()} size={16} />
						</div>
					)}
					<input
						style={{ paddingRight: emojiPicker || passwordToggle ? '40px' : '' }}
						type={getInputType()}
						placeholder={label ? '' : placeholder}
						value={value}
						onChange={handleInputChange}
						className={computedClassName}
						disabled={disabled}
						name={name}
						{...props}
					/>
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
				{/* Emoji Picker (Only if emojiPicker is true and icon clicked) */}
			</div>
			{emojiPicker && showEmojiPicker && (
				<div className="emoji-picker-container">
					<EmojiPicker onEmojiClick={handleEmojiClick} />
				</div>
			)}
		</>
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
	emojiPicker: PropTypes.bool,
	style: PropTypes.object,
	className: PropTypes.string,
	type: PropTypes.string,
	passwordToggle: PropTypes.bool,
}

export default InputText
