import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Checkbox.scss'

const Checkbox = ({ checked, label, onChange, className, ...props }) => {
	return (
		<label className={classNames('custom-checkbox', className)}>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => {
					if (onChange) {
						onChange(e.target.checked)
					}
				}}
				{...props}
			/>
			<span className="checkmark"></span>
			<span>{label}</span>
		</label>
	)
}

Checkbox.propTypes = {
	checked: PropTypes.bool,
	label: PropTypes.string,
	onChange: PropTypes.func,
	className: PropTypes.string,
}

export default Checkbox
