import { useState } from 'react'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import { v4 as uuidv4 } from 'uuid'

import Checkbox from '../../components/Checkbox'
import Icon from '../../components/Icon/Icon'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper/Stepper'

import * as Yup from 'yup'

const NewCampaign = () => {
	const { uuid } = useParams()

	const [abSplit, setAbSplit] = useState(false)
	const [campaignName, setCampaignName] = useState('')
	const [subject, setSubject] = useState('')
	const [subjectB, setSubjectB] = useState('')
	const [step, setStep] = useState(2)
	const [errors, setErrors] = useState({})

	const { user, account, loading, error } = useAccount()

	const validationSchema = Yup.object().shape({
		subject: Yup.string().trim().required('Subject A is required'),
		subjectB: abSplit ? Yup.string().trim().required('Subject B is required') : Yup.string().notRequired(),
	})

	const handleNext = async () => {
		try {
			await validationSchema.validate({ subject, subjectB }, { abortEarly: false })
			setErrors({})

			console.log('Proceeding to next step...')
			console.log('User is : ', user)
			console.log('Account is : ', account)

			const campaignData = {
				name: campaignName,
				account: account.id,
				subject,
				subject_b: subjectB,
				type: abSplit ? 'absplit' : 'basic',
				status: 'draft',
			}

			campaignData.udid = uuidv4()
			campaignData.uuid_b = uuidv4()

			const response = await ApiService.post('fairymailer/createCampaign', { data: campaignData }, user.jwt)
			console.log('response is : ', response)
		} catch (err) {
			const newErrors = {}
			err.inner.forEach((error) => {
				newErrors[error.path] = error.message
			})
			setErrors(newErrors)
		}
	}

	const handleCheckAbSplit = () => {
		setAbSplit(!abSplit)
	}

	const steps = [{ label: 'Campaigns' }, { label: 'Details' }, { label: 'Design' }, { label: 'Preview' }]

	return (
		<>
			<div className="fm-page-wrapper justify-content-center">
				<div className="fm-content-outer-wrapper">
					<Stepper steps={steps} currentStep={step} />

					{step === 2 && (
						<>
							<div className="mt70">
								<div className="fm-content-wrapper d-flex gap-50 justify-content-center">
									<div className="new-campaign-left flex-1 d-flex flex-column gap-20">
										<h1 className="campaign-title">Campaign Details</h1>
										<InputText value={campaignName} label={'Campaign Title'} onChange={(e) => setCampaignName(e.target.value)} />
										<InputText
											label="Subject"
											icon="Emoji"
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											emojiPicker={true}
											hasError={!!errors.subject}
											errorMessage={errors.subject}
										/>

										<div className="d-flex align-items-center gap-5" style={{ marginTop: '-20px' }}>
											<Icon name={'Plus'} />
											<p>Add Personalization</p>
										</div>
										{abSplit && (
											<>
												<InputText
													value={subjectB}
													label={'Subject B'}
													icon={'Emoji'}
													emojiPicker={true}
													onChange={(e) => setSubjectB(e.target.value)}
													hasError={!!errors.subjectB}
													errorMessage={errors.subjectB}
												/>
												<div className="d-flex align-items-center" style={{ marginTop: '-20px' }}>
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
											<Checkbox checked={true} label={'Track Opens'} />
										</div>
									</div>
								</div>
								<Button onClick={handleNext}>Next</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default NewCampaign
