import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate, useLocation } from 'react-router-dom'

import Checkbox from '../../components/Checkbox'
import Icon from '../../components/Icon/Icon'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import Stepper from '../../components/Stepper/Stepper'
import PopupText from '../../components/PopupText/PopupText'

import * as Yup from 'yup'
import { set } from 'date-fns'
import { ca } from 'date-fns/locale'
import Dropdown from '../../components/Dropdown'
import Switch from '../../components/Switch'
import DatePicker from '../../components/DatePicker'

const NewCampaign = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const location = useLocation()

	const [isEdit, setIsEdit] = useState(false)
	const [abSplit, setAbSplit] = useState(false)
	const [campaignName, setCampaignName] = useState('')
	const [subject, setSubject] = useState('')
	const [subjectB, setSubjectB] = useState('')
	const [step, setStep] = useState(location.state ? location.state.step : 2)
	const [groups, setGroups] = useState([])
	const [errors, setErrors] = useState({})

	const { user, account } = useAccount()
	const steps = [{ label: 'Campaigns' }, { label: 'Details' }, { label: 'Design' }, { label: 'Preview' }]

	const validationSchema = Yup.object().shape({
		subject: Yup.string().trim().required('Subject A is required'),
		subjectB: abSplit ? Yup.string().trim().required('Subject B is required') : Yup.string().notRequired(),
	})

	const getCampaign = async (uuid) => {
		const response = await ApiService.get(`fairymailer/getCampaigns?filters[uuid]=${uuid}&populate=recp_groups`, user.jwt)
		console.log('response from getcampaign is : ', response.data.data[0])
		return response
	}

	const getGroups = async () => {
		let resp = await ApiService.get('fairymailer/getGroups?polulate=*', user.jwt)
		console.log(resp)
		if (resp.data && resp.data.data) {
			setGroups(
				resp.data.data
					? resp.data.data.map((g) => {
							return { value: g.id, label: g.name }
					  })
					: []
			)

			// this.setState({
			// 	availGroups: resp.data.data
			// 		? resp.data.data.map((g) => {
			// 				return { value: g.id, label: g.name }
			// 		  })
			// 		: [],
			// 	meta: resp.data.meta,
			// })
		}
	}

	const setCampaignData = (campaignData) => {
		setSubject(campaignData.subject)
		setCampaignName(campaignData.name)
		if (campaignData.type === 'absplit') {
			setSubjectB(campaignData.subject_b)
			setAbSplit(true)
		}
	}

	useEffect(() => {
		if (uuid && user && step === 2) {
			console.log('there is a uuid')
			getCampaign(uuid).then((response) => {
				console.log('respo from useffect', response)
				if (response && response.data && response.data.data) {
					setCampaignData(response.data.data[0])
					setIsEdit(true)
				}
			})
		}
	}, [uuid, user])

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

			if (isEdit) {
				console.log('is edit', campaignData)
				campaignData.udid = uuid
				const response = await ApiService.post('fairymailer/updateCampaign', { data: campaignData }, user.jwt)
				console.log('response is : ', response)
				if (response && response.data && response.data.code === 200) {
					console.log('asdadsadas')
					navigate(`/campaigns/new/${campaignData.udid}`)
					setStep(step + 2)
				}
			} else {
				campaignData.udid = uuidv4()
				campaignData.uuid_b = uuidv4()

				const response = await ApiService.post('fairymailer/createCampaign', { data: campaignData }, user.jwt)
				console.log('response is : ', response)
				if (response && response.data && response.data.code === 200) {
					navigate(`/campaigns/new/${campaignData.udid}`)
					setStep(step + 2)
				}
			}
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

	const sendTestEmail = async () => {
		const campaignUdid = uuid
		const response = await ApiService.post(`custom/sendTestDraft`, { campaign_id: campaignUdid, account_id: account.id }, user.jwt)
		console.log('response from sendTestEmail is : ', response)
	}

	return (
		<>
			<div className="fm-page-wrapper justify-content-center">
				<div className="fm-content-outer-wrapper d-flex flex-column align-items-center">
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
											<p
												onClick={() => {
													PopupText.fire({
														icon: 'info',
														html: (
															<div>
																<span onClick={() => setSubject((previousSubject) => `${previousSubject} {{name}}`)}>{'{{name}}'}</span>
																<span onClick={() => setSubject((previousSubject) => `${previousSubject} {{email}}`)}>{'{{email}}'}</span>
															</div>
														),
													})
												}}
											>
												Add Personalization
											</p>
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
													<p
														onClick={() => {
															PopupText.fire({
																icon: 'info',
																html: (
																	<div>
																		<span onClick={() => setSubjectB((previousSubject) => `${previousSubject} {{name}}`)}>{'{{name}}'}</span>
																		<span onClick={() => setSubjectB((previousSubject) => `${previousSubject} {{email}}`)}>{'{{email}}'}</span>
																	</div>
																),
															})
														}}
													>
														Add Personalization
													</p>
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

					{step === 4 && (
						<>
							<div className="mt50 d-flex flex-column gap-20" style={{ maxWidth: '450px' }}>
								<h1 className="campaign-title">Review and Sent</h1>
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
									{/* <div className="d-flex justify-content-end mt20">
										<Checkbox checked={true} label={'Track Opens'} />
									</div> */}
								</div>

								<div className="d-flex content-space-between">
									<div>Mail Preview</div>
									<div>
										<Button onClick={sendTestEmail} type="secondary">
											Send test email
										</Button>
									</div>
								</div>
								<div className="d-flex flex-column align-items-left">
									<Dropdown withDivider={true} icon={'Plus'}></Dropdown>
									<p>+ Add Filtering</p>
								</div>
								<div className="d-flex flex-column align-items-left">
									<Switch label={'Schedule Campaign'}></Switch>
								</div>
								<div>
									<DatePicker
										dateFormat="d/m/Y"
										timeFormat={'H:i'}
										pickerType="datetime"
										onChange={(selection) => {
											console.log('selected date-time', selection)
										}}
									></DatePicker>
								</div>

								<div className="d-flex justify-content-center gap-20">
									<Button>Save & Exit</Button>
									<Button>Schedule Campaign</Button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default NewCampaign
