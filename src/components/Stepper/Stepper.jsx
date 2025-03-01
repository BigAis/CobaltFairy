import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Stepper.scss'
import classNames from 'classnames'
import Icon from '../Icon/Icon'
import { transform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Stepper = ({ steps, current, className, setStep, hasBack=true, minStep={step:1,url:''}, ...props }) => {
	const navigate = useNavigate();
	return (
		<>
			{hasBack && (
				<div className='stepper-goback' onClick={()=>{if(current+1==minStep.step){navigate(minStep.url);return;} setStep(current)}}>
					<Icon name="Caret" />
					Go back
				</div>
			)}
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
