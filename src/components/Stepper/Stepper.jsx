import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Stepper.scss'
import classNames from 'classnames'

const Stepper = ({ steps, current, className }) => {
	return (
		<>
			<div className={classNames('stepper-container', className)}>
				{steps.map((s, i) => {
					return (
						<>
							<div className={'circle ' + (i <= current ? 'active' : '')}>
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
