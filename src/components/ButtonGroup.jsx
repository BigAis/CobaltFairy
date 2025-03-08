import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import './ButtonGroup.scss'

const ButtonGroup = ({ children, options, value, onChange, className, ...props }) => {
	const [activeValue, setActiveValue] = useState('')
	useEffect(() => {
		setActiveValue(value)
	}, [value])
	const computedClassName = classNames('btn-group', 'btn-sm', className)

	return (
		<>
			<div className={computedClassName}>
				{options.map((opt) => {
					return (
						<Button
							key={opt.value}
							className={className}
							active={opt.value == activeValue}
							type="secondary"
							onClick={() => {
								setActiveValue(opt.value)
								onChange(opt.value)
							}}
						>
							{opt.label}
						</Button>
					)
				})}
			</div>
		</>
	)
}

ButtonGroup.propTypes = {
	children: PropTypes.node,
	options: PropTypes.array,
	value: PropTypes.string,
	onChange: PropTypes.func,
	className: PropTypes.string,
}

export default ButtonGroup
