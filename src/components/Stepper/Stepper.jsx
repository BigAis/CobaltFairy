import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Stepper.scss'
import classNames from 'classnames'

const Stepper = ({ steps, current, className, ...props }) => {
	return (
		<>
			<div className={classNames('stepper-container', className)} {...props}>
				{steps.map((s, i) => {
					return (
						<>
							<div key={i} className={'circle ' + (i <= current ? 'active' : '')}>
								{i + 1}
								<div className={'label ' + (i <= current ? 'active' : '')}>{s.label}</div>
							</div>
						</>
					)
				})}
			</div>
		</>
	)
}

export default Stepper
