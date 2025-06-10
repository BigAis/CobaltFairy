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
import Dropdown from '../../components/Dropdown'
import Switch from '../../components/Switch'
import DatePicker from '../../components/DatePicker'
import NotificationBar from '../../components/NotificationBar/NotificationBar'
import RcpFilter from './RcpFilters'
import Editor from './Editor'

import * as Yup from 'yup'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'

dayjs.extend(utc)
dayjs.extend(timezone)

const options = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
	{ value: 'grape', label: 'Grape' },
]

const NewCampaign = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const { createNotification } = useAccount()

	const [isEdit, setIsEdit] = useState(false)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

	const [currentCampaign, setCurrentCampaign] = useState({
		name: '',
		subject: '',
		subject_b: '',
		status: 'draft',
		type: 'basic',
	})
	const [currentDesign, setCurrentDesign] = useState({})

	// const [campaignName, setCampaignName] = useState('')
	// const [subject, setSubject] = useState('')
	// const [subjectB, setSubjectB] = useState('')
	const [step, setStep] = useState(location.state ? location.state.step : 2)
	const [groups, setGroups] = useState([])
	const [selectedGroups, setSelectedGroups] = useState([])
	const [campaigns, setCampaigns] = useState([])
	const [availableLinks, setAvailableLinks] = useState([])
	const [selectedFilterTrigger, setSelectedFilterTrigger] = useState(null)
	const [scheduleCampaign, setScheduleCampaign] = useState(false)
	const [errors, setErrors] = useState({})

	const [abSplit, setAbSplit] = useState((currentCampaign?.type === 'absplit' ? true : false) || false)

	const { user, account } = useAccount()
	const steps = [{ label: 'Campaigns' }, { label: 'Details' }, { label: 'Design' }, { label: 'Preview' }]

	const filterOptions = [
		{ label: 'Campaigns', value: 'ocmp' },
		{ label: 'Links', value: 'link' },
	]

	const campaignOptions =
		campaigns.length > 0
			? campaigns.map((cmp) => {
					return { value: cmp.id, label: cmp.name }
			  })
			: []

	const actionOptions =
		selectedFilterTrigger === 'ocmp'
			? [
					{ label: 'Was Opened', value: 'ocmp' },
					{ label: 'Was Not Opened', value: 'link' },
			  ]
			: [
					{ label: 'Was Clicked', value: 'ocmp' },
					{ label: 'Was Not Clicked', value: 'link' },
			  ]

	// Handle mobile detection
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Handle mobile restrictions
	useEffect(() => {
		if (isMobile) {
			// For campaign creation on mobile - prevent editor access
			if (step === 3) {
				PopupText.fire({
					icon: 'warning',
					text: 'Campaign editor is not available on mobile devices. Please use a desktop to design your campaign.',
					showCancelButton: false,
					confirmButtonText: 'OK',
				}).then(() => {
					setStep(4) // Skip to next step
				})
			}

			// For going back from step 4 to step 3 on mobile
			if (step === 4 && typeof window !== 'undefined' && window.sessionStorage) {
				// Store a flag to indicate we'd need to skip step 3
				window.sessionStorage.setItem('skipEditorStep', 'true')
			}

			// For editing draft campaigns on mobile - redirect back to campaigns page
			if (isEdit && currentCampaign && currentCampaign.status === 'draft') {
				PopupText.fire({
					icon: 'warning',
					text: 'Draft campaigns cannot be edited on mobile devices. Please use a desktop to edit your campaign.',
					showCancelButton: false,
					confirmButtonText: 'OK',
				}).then(() => {
					navigate('/campaigns')
				})
			}
		}
	}, [isMobile, step, isEdit, currentCampaign, navigate])

	// Function to handle the next and back buttons with mobile compatibility
	const handleStepChange = (direction) => {
		if (direction === 'next') {
			// Handle next button logic (your existing code)
			// ...
		} else if (direction === 'back') {
			// Going back
			if (isMobile && step === 4) {
				setStep(2) // Skip step 3 (editor) and go directly to step 2
			} else {
				setStep(step - 1) // Normal back behavior
			}
		}
	}

	//Validation for the first step
	const validationSchema = Yup.object().shape({
		subject: Yup.string().trim().required('Subject A is required'),
		subjectB: abSplit ? Yup.string().trim().required('Subject B is required') : Yup.string().notRequired(),
	})

	const getCampaign = async (uuid) => {
		const response = await ApiService.get(`fairymailer/getCampaigns?filters[uuid]=${uuid}&populate[recp_groups][fields][0]=id`, user.jwt)
		console.log('response from getCampaign is : ', response.data.data[0])
		setCurrentCampaign(response.data.data[0])
		if (response.data.data[0] && response.data.data[0].date) {
			setScheduleCampaign(true)
		}
		return response
	}

	//getCampaigns also build the links array for the filter.
	const getCampaigns = async () => {
		const response = await ApiService.get('fairymailer/getCampaigns', user.jwt)
		if (response.data && response.data.data) {
			//Setting campaigns from response
			// setCampaigns(
			// 	response.data.data.map((cmp) => {
			// 		return { value: '' + cmp.id, label: cmp.name }
			// 	})
			// )
			setCampaigns(response.data.data)

			// Iterate the response and build the available links
			let links = []
			response.data.data.map((c) => {
				if (c.stats && c.stats.l) {
					Object.keys(c.stats.l).forEach((ll) => {
						links = [...links, ll]
					})
				}
			})
			console.log('link are : ', links)

			setAvailableLinks(
				links.map((l) => {
					return { label: `${l}`, value: l }
				})
			)
		}
		return response
	}

	const getGroups = async () => {
		let resp = await ApiService.get('fairymailer/getGroups?polulate=*', user.jwt)
		console.log(resp)
		if (resp.data && resp.data.data) {
			setGroups(
				resp.data.data
					? resp.data.data.map((g) => {
							return { value: '' + g.id, label: g.name }
					  })
					: []
			)
		}
	}

	const setCampaignData = (campaignData) => {
		// setSubject(campaignData.subject)
		// setCampaignName(campaignData.name)
		if (campaignData.type === 'absplit') {
			// setSubjectB(campaignData.subject_b)
			setAbSplit(true)
		}
	}

	const handleSave = async (actionClicked) => {
		const filtersHasEmptyValue = (filters = currentCampaign.recp_filters?.$and || []) => {
			return filters.some((filter) => Array.isArray(filter.$or) && filter.$or.length === 0)
		}

		if (filtersHasEmptyValue()) {
			const result = await PopupText.fire({
				text: 'Error in campaign filters. Please complete all filter options.',
				icon: 'error',
				confirmButtonText: 'OK',
				showCancelButton: false,
				showDenyButton: false,
			})

			if (result.isConfirmed) {
				return
			}
		}

		switch (actionClicked) {
			case 'saveAndExit':
				handleSaveAndExit()
				break
			case 'schedule':
				handleSchedule()
				break
			case 'sentNow':
				handleSendNow()
				break
		}
	}

	const handleSaveAndExit = async () => {
		const campaignData = {
			...currentCampaign,
			date: null,
			account: account.id,
			recp_groups: selectedGroups && selectedGroups.length > 0 ? selectedGroups.map((option) => option.value) : [],
		}

		try {
			const response = await ApiService.post('fairymailer/updateCampaign', { assignses: true, data: campaignData }, user.jwt)
			if (response && response.data && response.data.code === 200) {
				navigate(`/campaigns/`)
			}
		} catch (err) {
			console.log('error is : ', err)
		}
	}

	const handleSchedule = async () => {
		const campaignData = {
			...currentCampaign,
			account: account.id,
		}
		try {
			console.log('campaignData is : ', campaignData)
			const response = await ApiService.post('fairymailer/updateCampaign', { assignses: true, data: campaignData }, user.jwt)
			console.log('response is : ', response)
			if (response && response.data && response.data.code === 200) {
				navigate(`/campaigns/`)
			}
		} catch (err) {
			console.log('error is : ', err)
		}
	}

	const handleSendNow = async () => {
		const campaignData = {
			...currentCampaign,
			date: dayjs().add(10, 'minute').toISOString(),
			account: account.id,
		}
		try {
			console.log('campaignData is : ', campaignData)

			const response = await ApiService.post('fairymailer/updateCampaign', { assignses: true, data: campaignData }, user.jwt)
			console.log('response is : ', response)
			if (response && response.data && response.data.code === 200) {
				navigate(`/campaigns/`)
			}
		} catch (err) {
			console.log('error is : ', err)
		}
	}

	const handleNext = async () => {
		try {
			await validationSchema.validate({ subject: currentCampaign.subject, subjectB: currentCampaign.subject_b }, { abortEarly: false })
			setErrors({})

			const campaignData = {
				...currentCampaign,
				account: account.id,
			}

			if (isEdit) {
				campaignData.udid = uuid
				const response = await ApiService.post('fairymailer/updateCampaign', { assignses: true, data: campaignData }, user.jwt)

				if (response && response.data && response.data.code === 200) {
					if (isMobile && step === 2) {
						// If on mobile and moving from step 2 to step 3, skip directly to step 4
						setStep(4)
					} else {
						navigate(`/campaigns/edit/${campaignData.udid}`)
						setStep(step + 1)
					}
				}
			} else {
				campaignData.udid = uuidv4()
				campaignData.uuid_b = uuidv4()

				const response = await ApiService.post('fairymailer/createCampaign', { assignses: true, data: campaignData }, user.jwt)

				if (response && response.data && response.data.code === 200) {
					if (isMobile && step === 2) {
						// If on mobile and moving from step 2 to step 3, skip directly to step 4
						setStep(4)
					} else {
						navigate(`/campaigns/edit/${campaignData.udid}`)
						setStep(step + 1)
					}
				}
			}
		} catch (err) {
			console.log('error is : ', err)
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

	// In NewCampaign.jsx

	// Add a function to load and apply presets
	const loadPreset = async (presetId) => {
		try {
			// Fetch preset data
			const response = await ApiService.get(`fairymailer/getCampaignPreset?id=${presetId}`, user.jwt)

			if (response.data && response.data.data) {
				const preset = response.data.data

				// Apply preset settings to campaign
				setCurrentCampaign({
					...currentCampaign,
					// Apply relevant preset properties
				})

				// Apply container settings and other configurations
			}
		} catch (error) {
			console.error('Error loading preset:', error)
		}
	}

	const sendTestEmail = async () => {
		const campaignUdid = uuid
		const response = await ApiService.post(`fairymail/sendDraft`, { campaign_id: campaignUdid }, user.jwt)

		if (response?.data?.code && response?.data?.code == 200) {
			createNotification({
				message: 'Test email was sent successfully.',
				type: 'default',
				autoClose: 3000,
			})
		} else {
			createNotification({
				message: 'Could not send test email. If the problem persists please contact our support team.',
				type: 'warning',
				autoClose: 90000,
			})
		}

		console.log('response from sendTestEmail is : ', response)
	}

	const updateRecpFilter = (id, filter, meta) => {
		console.log('meta inside updateRecpFilter is : ', meta)

		setCurrentCampaign((prevCampaign) => {
			const updatedFilters = [...prevCampaign.recp_filters.$and]

			updatedFilters[id] = filter

			return {
				...prevCampaign,
				recp_filters: {
					$and: updatedFilters,
					meta: {
						...(prevCampaign.recp_filters.meta || {}),
						...(meta || {}),
					},
				},
			}
		})
	}

	const handleDeleteRecpFilter = (id) => {
		setCurrentCampaign((prevCampaign) => ({
			...prevCampaign,
			recp_filters: {
				...prevCampaign.recp_filters,
				$and: prevCampaign.recp_filters.$and.filter((_, index) => index !== id),
			},
		}))
	}

	const addRecpFilter = () => {
		setCurrentCampaign((prevCampaign) => ({
			...prevCampaign,
			recp_filters: {
				...prevCampaign.recp_filters,
				$and: [...(prevCampaign.recp_filters?.$and || []), { $or: [] }], // Ensure $and exists before spreading
			},
		}))
	}

	useEffect(() => {
		setCurrentCampaign({ ...currentCampaign, type: abSplit ? 'absplit' : 'basic' })
	}, [abSplit])

	useEffect(() => {
		if (uuid && user) {
			getCampaign(uuid).then((response) => {
				if (response && response.data && response.data.data) {
					setCampaignData(response.data.data[0])
					setIsEdit(true)
				}
			})

			getGroups()
			getCampaigns()
		}
		if (step == 4 && currentCampaign && currentCampaign.design) {
			try {
				let des = JSON.parse(currentCampaign.design)
				if (des && des.bodySettings) setCurrentDesign(des)
				console.log('des.bodySettings', des.bodySettings)
			} catch (err) {
				console.log('des.bodySettings', err)
			}
		}
	}, [uuid, user, step])

	useEffect(() => {
		if (scheduleCampaign && !currentCampaign.date) {
			// Only set default date when enabling scheduling and no date exists
			setCurrentCampaign((prevState) => ({
				...prevState,
				date: dayjs(new Date(new Date().setHours(new Date().getHours() + 2))).toISOString(),
			}))
		} else if (!scheduleCampaign) {
			// Clear date when disabling scheduling
			setCurrentCampaign((prevState) => ({
				...prevState,
				date: null,
			}))
		}
		// Don't modify date if scheduleCampaign is true and date already exists
	}, [scheduleCampaign])

	useEffect(() => {
		if (currentCampaign && currentCampaign.recp_groups && currentCampaign.recp_groups.length > 0) {
			if (groups && groups.length > 0) {
				currentCampaign.recp_groups = currentCampaign.recp_groups.map((group) => {
					const groupId = typeof group === 'object' ? `${group.id}` : `${group}`
					return `${groupId}`
				})

				console.log('groups from loading currentCampaign groups', currentCampaign.recp_groups)

				setSelectedGroups(
					currentCampaign.recp_groups.map((group) => {
						const groupId = typeof group === 'object' ? `${group.id}` : `${group}`
						return {
							value: groupId,
							label: groups.find((grp) => `${grp.value}` === groupId)?.label,
						}
					})
				)
			}
		}
	}, [currentCampaign])

	const handleSelection = (selected) => {
		setSelectedGroups(selected)

		const final = selected.map((selectedOption) => {
			return selectedOption.value
		})
		console.log('final are : ', final)

		currentCampaign.recp_groups = final
		console.log('Selected Options:', selected)
	}

	return (
		<>
			<div className="fm-page-wrapper justify-content-center" style={{ background: step === 3 ? '#FFF8EF' : '' }}>
				<div className="fm-content-outer-wrapper d-flex flex-column align-items-center" style={{ width: step === 3 ? '100%' : '' }}>
					<Stepper steps={steps} current={step - 1} setStep={setStep} hasBack={true} minStep={{ step: 2, url: '/campaigns' }} style={{ marginTop: '30px' }} />

					{step === 2 && (
						<>
							<div className="mt70">
								<div className="fm-content-wrapper d-flex gap-50 justify-content-center">
									<div className="new-campaign-left flex-1 d-flex flex-column gap-20">
										<h1 className="campaign-title">Campaign Details</h1>
										<InputText value={currentCampaign?.name} label={'Campaign Title'} onChange={(e) => setCurrentCampaign({ ...currentCampaign, name: e.target.value })} />
										<InputText
											label="Subject"
											icon="Emoji"
											value={currentCampaign?.subject}
											onChange={(e) => setCurrentCampaign({ ...currentCampaign, subject: e.target.value })}
											emojiPicker={true}
											hasError={!!errors.subject}
											errorMessage={errors.subject}
										/>

										<div className="d-flex align-items-center gap-5" style={{ marginTop: '-20px' }}>
											<Icon name={'Plus'} />
											<p
												style={{ cursor: 'pointer' }}
												onClick={() => {
													PopupText.fire({
														icon: 'info',
														html: (
															<div>
																<span
																	style={{ cursor: 'pointer' }}
																	onClick={() => {
																		setCurrentCampaign((prevState) => ({
																			...prevState,
																			subject: `${prevState.subject} {{name}}`,
																		}))
																		PopupText.close()
																	}}
																>
																	{'{{name}}'}
																</span>
																<span
																	style={{ cursor: 'pointer' }}
																	onClick={() => {
																		setCurrentCampaign((prevState) => ({
																			...prevState,
																			subject: `${prevState.subject} {{email}}`,
																		}))
																		PopupText.close()
																	}}
																>
																	{' {{email}}'}
																</span>
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
													value={currentCampaign?.subject_b}
													label={'Subject B'}
													icon={'Emoji'}
													emojiPicker={true}
													onChange={(e) => setCurrentCampaign({ ...currentCampaign, subject_b: e.target.value })}
													hasError={!!errors.subjectB}
													errorMessage={errors.subjectB}
												/>
												<div className="d-flex align-items-center" style={{ marginTop: '-20px' }}>
													<Icon name={'Plus'} />
													<p
														style={{ cursor: 'pointer' }}
														onClick={() => {
															PopupText.fire({
																icon: 'info',
																html: (
																	<div>
																		<span
																			style={{ cursor: 'pointer' }}
																			onClick={() => {
																				setCurrentCampaign((prevState) => ({
																					...prevState,
																					subject_b: `${prevState.subject_b} {{name}}`,
																				}))
																				PopupText.close()
																			}}
																		>
																			{'{{name}}'}
																		</span>
																		<span
																			style={{ cursor: 'pointer' }}
																			onClick={() => {
																				setCurrentCampaign((prevState) => ({
																					...prevState,
																					subject_b: `${prevState.subject_b} {{email}}`,
																				}))
																				PopupText.close()
																			}}
																		>
																			{' {{email}}'}
																		</span>
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
										<Checkbox label={'A/B Split Campaign'} checked={abSplit} onChange={handleCheckAbSplit} />
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
												<p style={{ fontSize: '14px', color: 'rgba(16, 15, 28, 1)', fontWeight: '500' }}>
													{currentCampaign?.subject === '' ? 'Subject goes here' : currentCampaign?.subject}
												</p>
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

					{step === 3 && (
						<>
							<div style={{ width: '100%', marginTop: '40px' }}>
								<div className="fm-content-wrapper d-flex gap-50 justify-content-center" style={{ width: '100%' }}>
									<Editor currentCampaign={currentCampaign} setStep={setStep} />
								</div>
							</div>
						</>
					)}

					{step === 4 && (
						<>
							<div className="mt50 d-flex flex-column gap-20" style={{ maxWidth: '550px', paddingBottom: '40px' }}>
								<h1 className="campaign-title">Review and Send</h1>
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
											<p style={{ fontSize: '14px', color: 'rgba(16, 15, 28, 1)', fontWeight: '500' }}>
												{currentCampaign.subject === '' ? 'Subject goes here' : currentCampaign.subject}
											</p>
											<p style={{ fontSize: '14px', color: 'rgba(136, 125, 118, 1)', fontWeight: '500' }}>
												{' '}
												{currentDesign && currentDesign.bodySettings ? currentDesign.bodySettings.preHeader : 'Your email preheader will appear here.'}
											</p>
										</div>
										<div className="campaign-preview-third-row w-90">
											<div className="skeleton-1"></div>
											<div className="skeleton-2"></div>
										</div>
									</div>
								</div>

								<div className="d-flex content-space-between">
									<div>{/* Mail Preview */}</div>
									<div>
										<Button onClick={sendTestEmail} type="secondary">
											Send test email
										</Button>
									</div>
								</div>
								<div className="d-flex flex-column align-items-left">
									<p>Target Group:</p>
									<MultipleDropdown options={groups} selectedValues={selectedGroups} onOptionSelect={handleSelection} />
									<br></br>
									<p onClick={addRecpFilter}>+ Add Filtering</p>
								</div>
								<div className="d-flex flex-column">
									{/* {currentCampaign.recp_filters?.$and && currentCampaign.recp_filters.$and.length > 0 ? (
										currentCampaign.recp_filters.$and.map((f, i) => {
											let iKey = { label: 'Previous Campaign', value: 'ocmp' }
											let iCondition = iKey.value == 'ocmp' ? { label: 'Was opened', value: 'contains' } : { label: 'Was clicked', value: 'contains' }
											let iValue = null

											if (f.$or[0]?.ocmp_ids) {
												iKey = { label: 'Previous Campaign', value: 'ocmp' }
												if (f.$or[0].ocmp_ids?.$contains) {
													iCondition = { label: 'Was opened', value: 'contains' }
													iValue = {
														label: campaignOptions.filter((cmp) => {
															return cmp.value === f.$or[0].ocmp_ids?.$contains
														})[0].label,
														value: f.$or[0].ocmp_ids?.$contains,
													}
												} else if (f.$or[0].ocmp_ids?.$notContains) {
													iCondition = { label: 'Was NOT opened', value: 'notContains' }
													iValue = {
														label: campaignOptions.filter((cmp) => {
															return cmp.value === f.$or[0].ocmp_ids?.$notContains
														})[0].label,
														value: f.$or[0].ocmp_ids?.$notContains,
													}
												}
											} else if (f.$or[0]?.links_clicked) {
												// if (f.$or.length > 1) {
												// 	iKey = { label: 'Previous Campaign', value: 'ocmp' }
												// 	if (f.$or[0].links_clicked?.$contains) {
												// 		iCondition = { label: 'Was clicked', value: 'clicked' }
												// 		iValue = { label: f.$or[0].links_clicked?.$contains, value: f.$or[0].links_clicked?.$contains }
												// 	} else if (f.$or[0].links_clicked?.$notContains) {
												// 		iCondition = { label: 'Was NOT clicked', value: 'notContains' }
												// 		iValue = { label: f.$or[0].links_clicked?.$notContains, value: f.$or[0].links_clicked?.$notContains }
												// 	}
												// } else {
												iKey = { label: 'Link of previous campaign', value: 'link' }
												if (f.$or[0].links_clicked?.$contains) {
													iCondition = { label: 'Was clicked', value: 'contains' }
													iValue = { label: f.$or[0].links_clicked?.$contains, value: f.$or[0].links_clicked?.$contains }
												} else if (f.$or[0].links_clicked?.$notContains) {
													iCondition = { label: 'Was NOT clicked', value: 'notContains' }
													iValue = { label: f.$or[0].links_clicked?.$notContains, value: f.$or[0].links_clicked?.$notContains }
												}
												// }
											}
											return (
												<RcpFilter
													key={i}
													id={i}
													initialKey={iKey}
													initialCondition={iCondition}
													initialValue={iValue}
													campaigns={campaigns}
													links={availableLinks}
													onComplete={(id, result, meta) => {
														updateRecpFilter(id, result, meta)
													}}
													onDelete={handleDeleteRecpFilter}
												/>
											)
										})
									) : (
										<></>
									)} */}

									{/** without migration */}
									{/* {currentCampaign.recp_filters?.$and?.length > 0 &&
										currentCampaign.recp_filters.$and.map((f, i) => {
											const meta = currentCampaign.recp_filters.meta?.[i]

											let iKey = null
											let iCondition = null
											let iValue = null

											if (meta?.type === 'ocmp') {
												iKey = { label: 'Previous Campaign', value: 'ocmp' }

												switch (meta.condition) {
													case 'clicked':
														iCondition = { label: 'Was clicked', value: 'clicked' }
														break
													case 'notClicked':
														iCondition = { label: 'Was NOT clicked', value: 'notClicked' }
														break
													case 'opened':
													case 'contains':
														iCondition = { label: 'Was opened', value: 'contains' }
														break
													case 'notOpened':
													case 'notContains':
														iCondition = { label: 'Was NOT opened', value: 'notContains' }
														break
													default:
														break
												}

												iValue = campaignOptions.find((cmp) => cmp.value === meta.value)
											}

											if (meta?.type === 'link') {
												iKey = { label: 'Link of previous campaign', value: 'link' }

												switch (meta.condition) {
													case 'contains':
														iCondition = { label: 'Was clicked', value: 'contains' }
														break
													case 'notContains':
														iCondition = { label: 'Was NOT clicked', value: 'notContains' }
														break
													default:
														break
												}

												iValue = {
													label: meta.value,
													value: meta.value,
												}
											}

											return (
												<RcpFilter
													key={i}
													id={i}
													initialKey={iKey}
													initialCondition={iCondition}
													initialValue={iValue}
													campaigns={campaigns}
													links={availableLinks}
													onComplete={(id, result, meta) => updateRecpFilter(id, result, meta)}
													onDelete={handleDeleteRecpFilter}
												/>
											)
										})} */}

									{/** includes migration */}
									{currentCampaign.recp_filters?.$and?.length > 0 &&
										currentCampaign.recp_filters.$and.map((f, i) => {
											const meta = currentCampaign.recp_filters.meta?.[i]

											let iKey = null
											let iCondition = null
											let iValue = null

											if (meta) {
												if (meta.type === 'ocmp') {
													iKey = { label: 'Previous Campaign', value: 'ocmp' }

													switch (meta.condition) {
														case 'clicked':
															iCondition = { label: 'Was clicked', value: 'clicked' }
															break
														case 'notClicked':
															iCondition = { label: 'Was NOT clicked', value: 'notClicked' }
															break
														case 'opened':
														case 'contains':
															iCondition = { label: 'Was opened', value: 'contains' }
															break
														case 'notOpened':
														case 'notContains':
															iCondition = { label: 'Was NOT opened', value: 'notContains' }
															break
														default:
															break
													}

													iValue = campaignOptions.find((cmp) => cmp.value === meta.value)
												}

												if (meta.type === 'link') {
													iKey = { label: 'Link of previous campaign', value: 'link' }

													switch (meta.condition) {
														case 'contains':
															iCondition = { label: 'Was clicked', value: 'contains' }
															break
														case 'notContains':
															iCondition = { label: 'Was NOT clicked', value: 'notContains' }
															break
														default:
															break
													}

													iValue = {
														label: meta.value,
														value: meta.value,
													}
												}
											} else {
												const firstOr = f?.$or?.[0]

												if (firstOr?.ocmp_ids) {
													iKey = { label: 'Previous Campaign', value: 'ocmp' }

													if (firstOr.ocmp_ids?.$contains) {
														iCondition = { label: 'Was opened', value: 'contains' }
														const val = firstOr.ocmp_ids.$contains
														iValue = {
															label: campaignOptions.find((cmp) => cmp.value === val)?.label || val,
															value: val,
														}
													} else if (firstOr.ocmp_ids?.$notContains) {
														iCondition = { label: 'Was NOT opened', value: 'notContains' }
														const val = firstOr.ocmp_ids.$notContains
														iValue = {
															label: campaignOptions.find((cmp) => cmp.value === val)?.label || val,
															value: val,
														}
													}
												} else if (firstOr?.links_clicked) {
													iKey = { label: 'Link of previous campaign', value: 'link' }

													if (firstOr.links_clicked?.$contains) {
														iCondition = { label: 'Was clicked', value: 'contains' }
														const val = firstOr.links_clicked.$contains
														iValue = { label: val, value: val }
													} else if (firstOr.links_clicked?.$notContains) {
														iCondition = { label: 'Was NOT clicked', value: 'notContains' }
														const val = firstOr.links_clicked.$notContains
														iValue = { label: val, value: val }
													}
												}
											}

											return (
												<RcpFilter
													key={i}
													id={i}
													initialKey={iKey}
													initialCondition={iCondition}
													initialValue={iValue}
													campaigns={campaigns}
													links={availableLinks}
													onComplete={(id, result, meta) => updateRecpFilter(id, result, meta)}
													onDelete={handleDeleteRecpFilter}
												/>
											)
										})}
								</div>
								<div className="d-flex flex-column align-items-left">
									<Switch
										onChange={(option) => {
											setScheduleCampaign(option)
											console.log('asdasdasdasd : ', option)
										}}
										checked={scheduleCampaign}
										label={'Schedule Campaign'}
									></Switch>
								</div>

								{scheduleCampaign && (
									<div className="schedule-campaign">
										<DatePicker
											dateFormat="d/m/Y"
											timeFormat={'H:i'}
											hasMinDate={true}
											pickerType="datetime"
											style={{ width: '100%' }}
											value={currentCampaign?.date && dayjs(currentCampaign.date).toISOString()}
											onChange={(selection) => {
												setCurrentCampaign((prevState) => ({
													...prevState,
													date: dayjs(selection).toISOString(),
												}))
												console.log('selected date-time', selection)
												console.log('selected date-time dayjs', dayjs(selection).toISOString())
											}}
										></DatePicker>
									</div>
								)}

								<div className="d-flex justify-content-center gap-20">
									<Button
										type={scheduleCampaign ? 'secondary' : 'primary'}
										onClick={() => {
											PopupText.fire({
												text: scheduleCampaign ? 'This action will remove the scheduled date. Are you sure?' : 'The campaign will be saved as a draft. Are you sure?',
												icon: 'info',
												showConfirmButton: true,
												showCancelButton: true,
												confirmButtonText: 'Save Draft',
												onConfirm: () => {
													handleSave('saveAndExit')
													console.log('User clicked OK!')
												},
											})
										}}
									>
										Save as Draft
									</Button>
									{scheduleCampaign ? (
										<Button
											onClick={() => {
												handleSave('schedule')
												// PopupText.fire({
												// 	text: 'The campaign will be scheduled . Are you sure?',
												// 	icon: 'info',
												// 	showConfirmButton: true,
												// 	showCancelButton: true,
												// 	confirmButtonText: 'Schedule',
												// 	onConfirm: () => {

												// 		console.log('User clicked OK!')
												// 	},
												// })
											}}
										>
											Schedule Campaign
										</Button>
									) : (
										<Button
											type={'secondary'}
											onClick={() => {
												PopupText.fire({
													text: 'The campaign will be sent right now. Are you sure?',
													icon: 'info',
													showConfirmButton: true,
													showCancelButton: true,
													confirmButtonText: 'Send it',
													onConfirm: () => {
														handleSave('sentNow')
														console.log('User clicked OK!')
													},
												})
											}}
										>
											Send now
										</Button>
									)}
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
