import { useParams } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import InputText from '../../components/InputText/InputText'
import Card from '../../components/Card'
import Slider from '../../components/Slider_ck/Slider'
import { ApiService } from '../../service/api-service'
import { useUser } from '../../context/UserContext'
import { useAccount } from '../../context/AccountContext'

import './campaigns.scss'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'
import { useEffect, useState } from 'react'

const campaignButtonGroupOptions = [
	{ value: 'overview_tab', label: `Overview ` },
	{ value: 'absplit_tab', label: `A/B Split` },
	{ value: 'view_email_tab', label: `View Email` },
	{ value: 'sub_act_tab', label: `Subscriber Activity` },
	{ value: 'link_act_tab', label: `Link Activity` },
	{ value: 'loc_data_tab', label: `Location Data` },
]

const EditCampaign = () => {
	const { uuid } = useParams()
	const { user, account, loading, error } = useAccount()
	const [campaign, setCampaign] = useState(null)

	useEffect(() => {
		if (user && account) {
			const fetchCampaign = async () => {
				try {
					const response = await ApiService.get(`fairymailer/getCampaigns?filters[uuid]=${uuid}&populate=recp_groups`, user.jwt)
					if (response && response.data && response.data.data) setCampaign(response.data.data[0])
				} catch (error) {
					console.log('Error inside edit campaign : ', error)
				}
			}

			fetchCampaign()
		}
	}, [user, account])

	useEffect(() => {
		if (campaign) {
			console.log('campaign inside useEffect inside editCampaign ', campaign)
		}
	}, [campaign])

	return (
		<>
			<>
				<div className="fm-page-wrapper">
					<Sidemenu />
					<div className="fm-page-container">
						{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}
						{campaign && (
							<>
								<div className="page-name-container">
									<div className="page-name">Campaigns > {campaign.name}</div>
								</div>
								<div className="page-sent-at">{campaign.status === 'draft' ? 'draft, not sent yet' : campaign.sent_at}</div>
								<ButtonGroup
									value="overview_tab"
									options={campaignButtonGroupOptions.filter((option) => !(campaign.type !== 'absplit' && option.label === 'A/B Split'))}
									onChange={(value) => {
										console.log('the value is : ', value)
										switch (value) {
											case 'sent':
												// setSelectedCampaignType('sent')
												// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'sent'))
												break
											case 'draft':
												// setSelectedCampaignType('draft')
												// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'draft'))
												break
											case 'outbox':
												// setSelectedCampaignType('outbox')
												// setFilteredCampaigns(campaigns.filter((campaign) => campaign.status === 'outbox'))
												break
										}
									}}
								></ButtonGroup>

								<Card className={'campaing-stats-card d-flex flex-column'}>
									<p>Emails</p>
									<div className="campaing-stats-card-wrapper d-flex gap-50">
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Emails Sent : 2541</div>
												<div>22.12%</div>
											</div>
											<div>
												<div className="progress-bar">
													<div className="progress"></div>
												</div>
											</div>
										</div>
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Clicked : 521</div>
												<div>6.51%</div>
											</div>
											<div>
												<div className="progress-bar">
													<div className="progress"></div>
												</div>
											</div>
										</div>
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Click to open rate</div>
												<div>16.51%</div>
											</div>
											<div>
												<div className="progress-bar">
													<div className="progress"></div>
												</div>
											</div>
										</div>
									</div>
									<div className="campaing-stats-card-wrapper d-flex gap-50">
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Emails Sent</div>
											</div>
											<div>
												<p className="stat-number">8.541 | 2</p>
											</div>
										</div>
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Emails Sent</div>
											</div>
											<div>
												<p className="stat-number">8.541 | 2</p>
											</div>
										</div>
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Emails Sent</div>
											</div>
											<div>
												<p className="stat-number">8.541 | 2</p>
											</div>
										</div>
										<div className="campaing-stats-card-item">
											<div className="campaing-stats-card-item-header">
												<div>Emails Sent</div>
											</div>
											<div>
												<p className="stat-number">8.541 | 2</p>
											</div>
										</div>
									</div>
									<div></div>
								</Card>

								<div className="w-100 d-flex">
									<Card className={'stats-card'}>Opens and clicks</Card>
									<Card className={'stats-card'}>Link Activity</Card>
								</div>
								<div className="d-flex">
									<Card className={'stats-card'}>Device Type</Card>
									<Card className={'stats-card'}>Email Clients</Card>
								</div>
							</>
						)}
					</div>
				</div>
			</>
		</>
	)
}

export default EditCampaign
