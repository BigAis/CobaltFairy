import CampaignsTable from '../../components/DataTable/CampaignsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { use } from 'react'

const account = {
	name: 'Cobalt Fairy',
	plan: 'Free Plan',
}
const user = {
	name: 'Cobalt Fairy',
	email: 'cf@fairymail.app',
}
const getNameInitials = (name) =>
	name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
const stats = [
	{
		label: 'Emails Sent',
		value: '752',
		percentage: -12,
		defaultValue: false, // This will be the default selected option
	},
	{
		label: 'Totals Clicks',
		value: '159',
		percentage: 17,
		defaultValue: false,
	},
	{
		label: 'Total Opens',
		value: '340',
		percentage: 19,
		defaultValue: false,
	},
	{
		label: 'Spam',
		value: '85',
		percentage: 5,
		defaultValue: false,
	},
]
const subs_stats = [
	{
		label: 'Total',
		value: '752',
		default: false,
		percentage: 5,
	},
	{
		label: 'Unsubscribed',
		value: '159',
		default: true,
		percentage: 5,
	},
]

const Campaigns = () => {
	const navigate = useNavigate()

	const [campaigns1, setCampaigns1] = useState([])
	const [account, setAccount] = useState({})
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [itemsPerPage, setItemsPerPage] = useState(50)
	const [currentPage, setCurrentPage] = useState(1)
	const [skeletons] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}])
	const [campaigns, setCampaigns] = useState([])
	const [cmpStatus, setCmpStatus] = useState('sent')
	const [meta, setMeta] = useState([])
	const [error, setError] = useState(null)
	const [domainVerified, setDomainVerified] = useState(true)
	const [dkimVerified, setDkimVerified] = useState(true)
	const [emailVerified, setEmailVerified] = useState(true)
	const [selectedCampaignType, setSelectedCampaignType] = useState('sent')

	const [user2, setUser2] = useState()

	// const [filteredCampaigns, setFilteredCampaigns] = useState([])
	// const campaignsTableData = filteredCampaigns.map((campaign) => {
	// 	return {
	// 		image: 'https://i.imgur.com/1Xh6g2b_d.webp?maxwidth=760&fidelity=grand',
	// 		name: campaign.name,
	// 		recipients: campaign.recipients,
	// 		stats: campaign?.stats,
	// 		opens: campaign?.stats?.o,
	// 		clicks: campaign?.stats?.c,
	// 		type: campaign.type === 'absplit' ? 'AB Split' : 'Normal',
	// 		date: campaign.date,
	// 		actions: campaign.actions,
	// 		uuid: campaign.uuid,
	// 		account: campaign?.account?.id,
	// 		recp_groups: [...campaign.recp_groups],
	// 	}
	// })

	const totalCampaignsSent = campaigns.filter((campaign) => campaign.status === 'sent').length
	const totalCampaignsDraft = campaigns.filter((campaign) => campaign.status === 'draft').length
	const totalCampaignsOutBox = campaigns.filter((campaign) => campaign.status === 'outbox').length

	useEffect(() => {
		setUser2(User.get())
	}, [])

	useEffect(() => {
		console.log('user2 is : ', user2)
		setAccount(async () => (await ApiService.get(`fairymailer/getAccount`, user2.jwt)).data.user.account)
	}, [user2])

	useEffect(() => {
		console.log('account from useEffect is : ', account)
		getCampaigns()
	}, [account])

	useEffect(() => {
		console.log('meta from useEffect are : ', meta)
		// console.log(
		// 	'campaigns sent from useEffect are : ',
		// 	campaigns.filter((cmp) => {
		// 		console.log('cmp.status inside filter', cmp.status)
		// 		return cmp.status === 'draft'
		// 	})
		// )
	}, [meta])

	const updateSearchTerm = async (search) => {
		setSearchTerm(search)

		// if (search.length) {
		// let account = await ApiService.get(`fairymailer/getAccount`, user2.jwt)
		// account = account.data.user.account

		let outboxfilter = selectedCampaignType == 'outbox' ? '&filters[date][$notNull]=true' : selectedCampaignType == 'drafts' ? '&filters[date][$null]=true' : ''

		let resp = await ApiService.get(
			`fairymailer/getCampaigns?filters[name][$contains]=${search}&filters[account]=${account?.id}&filters[status]=${
				selectedCampaignType == 'outbox' ? 'draft' : selectedCampaignType == 'drafts' ? 'draft' : selectedCampaignType
			}${outboxfilter}&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=100&pagination[page]=1`,
			user2.jwt
		)
		console.log('cmps from search are : ', resp)

		setCampaigns(resp.data.data)

		// this.setState({ campaigns: resp.data.data, meta: resp.data.meta })
		// }
	}
	const getCampaigns = async (page = 1) => {
		try {
			console.log('user is getCampaigns : ', user2.jwt)

			// let account = await ApiService.get(`fairymailer/getAccount`, user2.jwt)
			// account = account.data.user.account
			// console.log('account is : ', account)

			// if (account) {
			// 	setAccount(account)
			// 	setDomainVerified(account.domain_verified)
			// 	setEmailVerified(account.email_verified)
			// 	setDkimVerified(account.dkim_verified)
			// }

			// let outboxfilter = selectedCampaignType == 'outbox' ? '&filters[date][$notNull]=true' : selectedCampaignType == 'draft' ? '&filters[date][$null]=true' : ''
			// let resp = await ApiService.get(
			// 	`fairymailer/getCampaigns?filters[account]=${account.id}&filters[status]=${
			// 		selectedCampaignType == 'outbox' ? 'draft' : selectedCampaignType
			// 	}${outboxfilter}&sort[sent_at]=desc&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=${itemsPerPage}&pagination[page]=${page}`,
			// 	user.jwt
			// )
			let resp = await ApiService.get(
				`fairymailer/getCampaigns?filters[account]=${account.id}&sort[sent_at]=desc&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=${itemsPerPage}&pagination[page]=${page}`,
				user2.jwt
			)
			console.log('cmps from getCampaigns ', resp)
			setCampaigns(
				resp.data.data.map((item) => ({
					...item,
					image: '/images/cmp.png',
				}))
			)

			setMeta(resp.data.meta)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
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
									{ value: 'sent', label: `Sent (${campaigns.filter((campaign) => campaign.status === 'sent').length})` },
									{ value: 'draft', label: `Draft (${totalCampaignsDraft})` },
									{ value: 'outbox', label: `Outbox(${totalCampaignsOutBox})` },
									// { value: 'all', label: 'Templates (4)' },
								]}
								onChange={(value) => {
									console.log('the value is : ', value)
									switch (value) {
										case 'sent':
											setSelectedCampaignType('sent')
											// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'sent'))
											break
										case 'draft':
											setSelectedCampaignType('draft')
											// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'draft'))
											break
										case 'outbox':
											setSelectedCampaignType('outbox')
											// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'outbox'))
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
						<CampaignsTable campaigns={campaigns.filter((campaign) => campaign.status === selectedCampaignType)} dashboardPreviewOnly={false} />
					</div>
				</div>
			</div>
		</>
	)
}

export default Campaigns
