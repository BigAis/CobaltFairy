import CampaignsTable from '../../components/DataTable/CampaignsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './campaigns.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import User from '../../service/User'
import { ApiService } from '../../service/api-service'
import PopupText from '../../components/PopupText/PopupText'
import NotificationBar from '../../components/NotificationBar/NotificationBar'
import { use } from 'react'
import TemplateCard from '../../components/TemplateCard/TemplateCard'
import TemplatePreview from '../../components/TemplatePreview/TemplatePreview'
import { v4 as uuidv4 } from 'uuid'

// const getNameInitials = (name) =>
// 	name
// 		.split(' ')
// 		.map((word) => word[0].toUpperCase())
// 		.join('')
// const stats = [
// 	{
// 		label: 'Emails Sent',
// 		value: '752',
// 		percentage: -12,
// 		defaultValue: false, // This will be the default selected option
// 	},
// 	{
// 		label: 'Totals Clicks',
// 		value: '159',
// 		percentage: 17,
// 		defaultValue: false,
// 	},
// 	{
// 		label: 'Total Opens',
// 		value: '340',
// 		percentage: 19,
// 		defaultValue: false,
// 	},
// 	{
// 		label: 'Spam',
// 		value: '85',
// 		percentage: 5,
// 		defaultValue: false,
// 	},
// ]
// const subs_stats = [
// 	{
// 		label: 'Total',
// 		value: '752',
// 		default: false,
// 		percentage: 5,
// 	},
// 	{
// 		label: 'Unsubscribed',
// 		value: '159',
// 		default: true,
// 		percentage: 5,
// 	},
// ]

const Campaigns = () => {
	const navigate = useNavigate()

	const [dropdownViewer, setDropdownViewer] = useState('campaigns')

	const { user, account } = useAccount()
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [itemsPerPage, setItemsPerPage] = useState(100)
	const [currentPage, setCurrentPage] = useState(1)
	const [skeletons] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}])
	const [campaigns, setCampaigns] = useState([])
	const [templates, setTemplates] = useState([])
	const [notifications, setNotifications] = useState([])

	const [meta, setMeta] = useState([])
	const [campaignsMeta, setCampaignsMeta] = useState([])
	const [error, setError] = useState(null)
	const [domainVerified, setDomainVerified] = useState(true)
	const [dkimVerified, setDkimVerified] = useState(true)
	const [emailVerified, setEmailVerified] = useState(true)
	const [selectedCampaignType, setSelectedCampaignType] = useState('sent')

	const totalCampaignsSent = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.sent : 0
	const totalCampaignsDraft = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.draft : 0
	const totalCampaignsOutBox = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.outbox : 0

	useEffect(() => {
		getCampaigns()
		getTemplates()
	}, [account])

	const updateSearchTerm = async (search) => {
		setSearchTerm(search)

		let outboxfilter = selectedCampaignType == 'outbox' ? '&filters[date][$notNull]=true' : selectedCampaignType == 'drafts' ? '&filters[date][$null]=true' : ''

		let resp = await ApiService.get(
			`fairymailer/getCampaigns?filters[name][$contains]=${search}&filters[status]=${
				selectedCampaignType == 'outbox' ? 'draft' : selectedCampaignType == 'drafts' ? 'draft' : selectedCampaignType
			}${outboxfilter}&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=100&pagination[page]=1`,
			user.jwt
		)

		setCampaigns(resp.data.data)
	}

	const getCampaigns = async (page = 1) => {
		try {
			console.log('user is getCampaigns : ', user.jwt)
			let resp = await ApiService.get(
				`fairymailer/getCampaigns?sort[id]=desc&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=${1}&pagination[page]=${page}`,
				user.jwt
			)
			console.log('cmps from getCampaigns ', resp)
			setCampaigns(
				resp.data.data.map((item) => ({
					...item,
					image: '/images/cmp.png',
				}))
			)

			setCampaignsMeta(resp.data.meta)
		} catch (error) {
			console.error(error)
		}
	}

	const getTemplates = async (page = 1) => {
		try {
			let resp = await ApiService.get(`fairymailer/getTemplates?pagination[pageSize]=${itemsPerPage}&pagination[page]=${page}`, user.jwt)
			console.log('templates from getTemplates ', resp)
			if (resp.data && resp.data.data) {
				setTemplates(resp.data.data)
				//TODO Templates Meta
				// this.setState({ templates: resp.data.data, meta: resp.data.meta })
			}
		} catch (error) {
			console.error(error)
		}
	}

	const refreshData = async ()=>{
		let current = selectedCampaignType;
		await getCampaigns();
		await getTemplates();
		//workaround - we need to fix this!!
		// we need a proper way to refresh the data upon actions such as delete, rename, duplicate.
		setSelectedCampaignType('templates')
		setTimeout(()=>{
			setSelectedCampaignType(current)
		},100)
	}

	const createTemplateByName = async (templateName) => {
		try {
			const templateUuid = uuidv4()
			const resp = await ApiService.post(`templates/`, { data: { uuid: templateUuid, name: templateName, account: account.id } }, user.jwt)
			console.log('templates from  createTemplateByName', resp)
			if (resp && resp.data && resp.data.data) {
				navigate(`/templates/edit/${templateUuid}`)
			}
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
				{notifications && notifications.length>0 &&  (
					<div className='notifications-container'>
						{notifications.map(n=>{
							return <NotificationBar type={n.type || 'default'} message={n.message} onClose={n.onClose}/>
						})}
					</div>
				)}
					<PageHeader user={user} account={account} />
					<div className="page-name-container">
						<div className="page-name">Campaigns</div>
						<Button icon={'Plus'} type="action" onClick={() => navigate('/campaigns/new')}>
							New Campaign
						</Button>
					</div>
					<div className="filters-container">
						<div className="row" style={{ marginBottom: '1rem' }}>
							<ButtonGroup
								value="sent"
								options={[
									{ value: 'sent', label: `Sent (${totalCampaignsSent})` },
									{ value: 'draft', label: `Draft (${totalCampaignsDraft})` },
									{ value: 'outbox', label: `Outbox(${totalCampaignsOutBox})` },
									{ value: 'templates', label: `Templates (${templates && templates.length > 0 ? templates.length : '0'})` },
								]}
								onChange={(value) => {
									console.log('the value is : ', value)
									switch (value) {
										case 'sent':
											setDropdownViewer('campaigns')
											setSelectedCampaignType('sent')
											break
										case 'draft':
											setDropdownViewer('campaigns')
											setSelectedCampaignType('draft')
											break
										case 'outbox':
											setDropdownViewer('campaigns')
											setSelectedCampaignType('outbox')
											break
										case 'templates':
											setDropdownViewer('templates')
											setSelectedCampaignType('templates')
											break
									}
								}}
							></ButtonGroup>
						</div>
						<div className="row d-flex content-space-between">
							<InputText
								onChange={(e) => updateSearchTerm(e.target.value)}
								style={{ width: '85%' }}
								placeholder="Search Campaign"
								label="Search Campaign"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
							/>
							<Button type="secondary" icon={'Filters'}>
								Filters
							</Button>
						</div>
					</div>

					<div className="">
						{dropdownViewer === 'campaigns' ? (
							<CampaignsTable
								resultsPerPage={10}
								// campaigns={campaigns.filter(
								// 	(campaign) =>
								// 		(selectedCampaignType !== 'outbox' && campaign.status === selectedCampaignType) ||
								// 		(selectedCampaignType === 'outbox' && campaign.status === 'draft' && campaign.date)
								// )}
								notifications={notifications}
								setNotifications={setNotifications}
								refreshData={refreshData}
								selectedCampaignType={selectedCampaignType}
								dashboardPreviewOnly={false}
							/>
						) : (
							<>
								<div className="d-flex flex-wrap templates-container gap-20 mt20">
									<Card
										style={{ cursor: 'pointer' }}
										className={'d-flex flex-column align-items-center justify-content-center gap-20'}
										onClick={() => {
											PopupText.fire({
												text: 'Enter Template Name',
												inputField: true,
												inputLabel: 'Template Name',
												confirmButtonText: 'Submit',
												onConfirm: (inputValue) => {
													console.log('User entered:', inputValue)
												},
											}).then((result) => {
												if (result.isConfirmed) {
													console.log('Confirmed with input:', result.inputValue)
													createTemplateByName(result.inputValue)
												} else if (result.isCancelled) {
													console.log('Popup cancelled')
												}
											})
										}}
									>
										<Icon name="PlusLight" size={64}></Icon>
										<p>Create New</p>
									</Card>
									{templates &&
										templates.length > 0 &&
										templates.sort((a,b) => a.id - b.id).map((template,i) => (
											<>
												<TemplateCard
													key={template.uuid}
													template_udid={template.uuid}
													templateName={template.name}
													onPreviewClick={() => { setTemplates([...templates.filter(t=>t.uuid!=template.uuid),{...template,showPreview:true}]) }}
													onEditClick={() => navigate(`/templates/edit/${template.uuid}`)}
												/>
												<TemplatePreview template_udid={template.uuid} show={template.showPreview} onClose={()=>{setTemplates([...templates.filter(t=>t.uuid!=template.uuid),{...template,showPreview:false}])}}/>
											</>
										))}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default Campaigns
