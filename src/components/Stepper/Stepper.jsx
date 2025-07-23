import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import './Stepper.scss'
import classNames from 'classnames'
import Icon from '../Icon/Icon'
import { useNavigate } from 'react-router-dom'

const Stepper = ({ steps, current, className, setStep, hasBack=true, minStep={step:1,url:''}, ...props }) => {
	const navigate = useNavigate();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	const handleGoBack = (e) => {
		// Prevent event bubbling and default behavior
		e.preventDefault();
		e.stopPropagation();
		
		// Special handling for campaign flow on mobile devices
		if (isMobile) {
			// Check if we're in the campaign flow (based on step labels)
			const campaignFlow = steps.some(step => step.label === 'Design' || step.label === 'Preview');
			
			// If we're on step 4 (Preview) in campaign flow on mobile, go directly to step 2 (Details)
			if (campaignFlow && current === 3) { // current is 0-indexed, so 3 means step 4
				if (setStep) {
					setStep(2); // Go to step 2 (Details)
				}
				return;
			}
		}
		
		// Normal back behavior for all other cases
		if (current+1 == minStep.step) {
			navigate(minStep.url);
			return;
		}
		
		// If setStep is provided, use it for going back one step
		if (setStep) {
			setStep(current);
		}
	};
	
	return (
		<>
			{hasBack && (
				<div 
					className='stepper-goback' 
					onClick={handleGoBack}
					style={{ 
						cursor: 'pointer',
						userSelect: 'none',
						pointerEvents: 'auto',
						zIndex: 10
					}}
				>
					<Icon name="Caret" />
					Go back
				</div>
			)}
			<div className={classNames('stepper-container', className)} {...props}>
				{steps.map((s, i) => {
					return (
						<div key={i} className={'circle ' + (i <= current ? 'active' : '')}>
							{i + 1}
							<div className={'label ' + (i <= current ? 'active' : '')}>{s.label}</div>
						</div>
					)
				})}
			</div>
		</>
	)
}

Stepper.propTypes = {
	steps: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.string.isRequired
	})).isRequired,
	current: PropTypes.number.isRequired,
	className: PropTypes.string,
	setStep: PropTypes.func,
	hasBack: PropTypes.bool,
	minStep: PropTypes.shape({
		step: PropTypes.number,
		url: PropTypes.string
	})
}

export default Stepper