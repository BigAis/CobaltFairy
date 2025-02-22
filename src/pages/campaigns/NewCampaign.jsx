import { useState } from 'react'
import Checkbox from '../../components/Checkbox'
import Icon from '../../components/Icon/Icon'
import InputText from '../../components/InputText/InputText'

import Button from '../../components/Button'
import Stepper from '../../components/Stepper/Stepper'
import EmojiPicker from 'emoji-picker-react'

const NewCampaign = () => {
	const [abSplit, setAbSplit] = useState(false)
	const [subject, setSubject] = useState('')
	const [subjectB, setSubjectB] = useState('')
	const [inputSubjectClicked, setInputSubjectClicked] = useState(null)
	const [step, setStep] = useState(2)

	const handleCheckAbSplit = () => {
		setAbSplit(!abSplit)
	}

	const handleSubjectChange = (event) => {
		console.log('adsasasdadsas', event.target.value)
		setSubject(event.target.value) // Update state on input change
	}

	const steps = [{ label: 'Campaigns' }, { label: 'Details' }, { label: 'Design' }, { label: 'Preview' }]

	return (
		<>
			<div className="fm-page-wrapper justify-content-center">
				<div>
					<Stepper steps={steps} currentStep={step} />

					{step === 2 && (
						<>
							<div className="fm-content-outer-wrapper">
								<div className="fm-content-wrapper d-flex gap-50 align-items-center justify-content-center">
									<div className="new-campaign-left flex-1">
										<h1 className="campaign-title">Campaign Details</h1>
										<InputText label={'Campaign Title'} />
										<InputText
											label="Subject"
											icon="Emoji"
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											emojiPicker={true} // Enables the emoji picker
										/>

										<div className="d-flex align-items-center">
											<Icon name={'Plus'} />
											<p>Add Personalization</p>
										</div>
										{abSplit && (
											<>
												<InputText label={'Subject B'} icon={'Emoji'} emojiPicker={true} onChange={(e) => setSubjectB(e.target.value)} />
												<div className="d-flex align-items-center">
													<Icon name={'Plus'} />
													<p>Add Personalization</p>
												</div>
											</>
										)}
										<Checkbox label={'A/B Split Campaign'} onChange={handleCheckAbSplit} />
									</div>
									<div className="new-campaign-right flex-1">
										<div className="campaign-preview-wrapper d-flex flex-column align-items-center">
											<div className="campaign-preview-title w-90 d-flex align-items-center">
												{' '}
												<Icon name="Envelope" className={'mr10'} />
												Inbox Preview
											</div>
											<div className="campaign-preview-first-row w-90">
												<div className="skeleton-1"></div>
												<div className="skeleton-2"></div>
											</div>
											<div className="campaign-preview-second-row campaign-preview-active-row w-100">
												<p style={{ fontSize: '16px', color: 'rgba(16, 15, 28, 1)', fontWeight: '600' }}>Sender</p>
												<p style={{ fontSize: '14px', color: 'rgba(16, 15, 28, 1)', fontWeight: '500' }}>{subject === '' ? 'Subject goes here' : subject}</p>
												<p style={{ fontSize: '14px', color: 'rgba(136, 125, 118, 1)', fontWeight: '500' }}>Your email preheader will appear here.</p>
											</div>
											<div className="campaign-preview-third-row w-90">
												<div className="skeleton-1"></div>
												<div className="skeleton-2"></div>
											</div>
										</div>
										<div className="d-flex justify-content-end mt20">
											<Checkbox label={'Track Opens'} />
										</div>
									</div>
								</div>
								<Button
									onClick={() => {
										setStep(step + 1)
									}}
								>
									Next
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default NewCampaign
