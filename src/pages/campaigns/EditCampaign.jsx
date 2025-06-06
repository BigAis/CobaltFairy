import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
import Icon from '../../components/Icon/Icon'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import AreaChart from '../../components/AreaChart/AreaChart'
import Pagination from '../../components/Pagination'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Checkbox from '../../components/Checkbox'
import EmailPreview from '../../components/EmailPreview/EmailPreview'
import LocationData from '../../components/LocationData/LocationData'

import './campaigns.scss'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const campaignButtonGroupOptions = [
  { value: 'overview_tab', label: `Overview` },
  { value: 'absplit_tab', label: `A/B Split` },
  { value: 'view_email_tab', label: `View Email` },
  { value: 'sub_act_tab', label: `Subscriber Activity` },
  { value: 'link_act_tab', label: `Link Activity` },
  { value: 'loc_data_tab', label: `Location Data` },
]

// const emailClientsOptions = { Gmail: '41%', Outlook: '20%', AppleMail: '15%', Yahoo: '10%' }

const EditCampaign = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const { user, account, loading, error } = useAccount()
	const [campaign, setCampaign] = useState(null)
	const [selectedTab, setSelectedTab] = useState('overview_tab')
	const [selectedCampaigns, setSelectedCampaigns] = useState([])
	const returnTab = location.state?.returnTab || localStorage.getItem('lastCampaignTab') || 'sent'

	const emailClientsOptions = campaign?.stats?.metadata?.emailClient
	const halfRecps = Math.round(campaign?.recipients / 2)
	const absplitCampaignData =
		campaign?.type === 'absplit'
			? [
					{
						image: 'https://i.imgur.com/1Xh6g2b_d.webp?maxwidth=760&fidelity=grand',
						subject: campaign?.subject,
						recipients: halfRecps % 2 == 0 ? halfRecps : halfRecps - 1,
						opens: campaign?.stats?.uo,
						openRate: campaign?.stats?.or,
						clicks: campaign?.stats?.uc,
						clickRate: campaign?.stats?.cr,
					},
					{
						image: 'https://i.imgur.com/1Xh6g2b_d.webp?maxwidth=760&fidelity=grand',
						subject: campaign?.subject_b,
						recipients: halfRecps,
						opens: campaign?.stats?.uob,
						openRate: campaign?.stats?.obr,
						clicks: campaign?.stats?.ucb,
						clickRate: campaign?.stats?.cbr,
					},
			  ]
			: null

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
	const total_cmp_links = [];
	if(campaign?.stats?.l) for(const ll of Object.keys(campaign.stats.l)){
		if(!total_cmp_links[ll]) total_cmp_links[ll] = campaign.stats.l[ll]
		else{ total_cmp_links[ll] = {...total_cmp_links[ll],total:total_cmp_links[ll].total+campaign.stats.l[ll].total, unique:total_cmp_links[ll].unique+campaign.stats.l[ll].unique} }
	}
	if(campaign?.stats?.lb) for(const ll of Object.keys(campaign.stats.lb)){
		if(!total_cmp_links[ll]) total_cmp_links[ll] = campaign.stats.lb[ll]
		else{ total_cmp_links[ll] = {...total_cmp_links[ll],total:total_cmp_links[ll].total+campaign.stats.lb[ll].total, unique:total_cmp_links[ll].unique+campaign.stats.lb[ll].unique} }
	}
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}
					{campaign && (
						<>
							<div className="page-name-container">
								<div className="page-name">Campaigns &gt; {campaign.name}</div>
							</div>
							<div className="page-sent-at">
								<Icon name={'Clock'} size={12} style={{ color: 'red' }} />
								Sent on {campaign.status === 'draft' ? 'draft, not sent yet' : dayjs(campaign.sent_at).format('DD/MM/YYYY')}
							</div>
							<ButtonGroup
								value="overview_tab"
								className={'mt10 mb10'}
								options={campaignButtonGroupOptions.filter((option) => !(campaign.type !== 'absplit' && option.label === 'A/B Split'))}
								onChange={(value) => {
									console.log('the value is : ', value)
									switch (value) {
										case 'overview_tab':
											setSelectedTab('overview_tab')
											break
										case 'absplit_tab':
											setSelectedTab('absplit_tab')
											break
										case 'view_email_tab':
											setSelectedTab('view_email_tab')
											break
										case 'sub_act_tab':
											setSelectedTab('sub_act_tab')
											break
										case 'link_act_tab':
											setSelectedTab('link_act_tab')
											break
										case 'loc_data_tab':
											setSelectedTab('loc_data_tab')
											break
									}
								}}
							></ButtonGroup>

							{selectedTab === 'overview_tab' && (
								<>
									{campaign.stats ? (
										<div className="stats-container d-flex flex-column gap-20 mt20">
											<Card className={'campaing-stats-card d-flex flex-column'}>
												<p className="stat-heading">Emails</p>
												<div className="campaing-stats-card-wrapper d-flex gap-50" style={{ marginBottom: '32px' }}>
													<div className="campaing-stats-card-item">
														<div className="campaing-stats-card-item-header">
															<div>Emails Sent : {campaign.recipients}</div>
															<div>100%</div>
														</div>
														<div>
															<div className="progress-bar">
																<div style={{ width: '100%' }} className="progress"></div>
															</div>
														</div>
													</div>
													<div className="campaing-stats-card-item">
														<div className="campaing-stats-card-item-header">
															<div>Opens : {campaign.stats?.uob ? campaign.stats?.uo + campaign.stats?.uob : campaign.stats?.uo || 0}</div>
															<div>
																{campaign.stats?.uob
																	? (((campaign.stats?.uo + campaign.stats?.uob) / campaign.recipients) * 100).toFixed(2)
																	: ((campaign.stats?.uo / campaign.recipients) * 100).toFixed(2) || 0}
																%
															</div>
														</div>
														<div>
															<div className="progress-bar">
																<div style={{ width: `${campaign.stats.or}%` }} className="progress"></div>
															</div>
														</div>
													</div>
													<div className="campaing-stats-card-item">
														<div className="campaing-stats-card-item-header">
															<div>Clicked : {campaign.stats?.ucb ? campaign.stats?.uc + campaign.stats?.ucb : campaign.stats?.uc || 0}</div>
															<div>
																{campaign.stats?.ucb
																	? (((campaign.stats?.uc + campaign.stats?.ucb) / campaign.recipients) * 100).toFixed(2)
																	: ((campaign.stats?.uc / campaign.recipients) * 100).toFixed(2) || 0}
																%
															</div>
														</div>
														<div>
															<div className="progress-bar">
																<div style={{ width: `${campaign.stats.cr}%` }} className="progress"></div>
															</div>
														</div>
													</div>
												</div>
											</Card>

											<div className="w-100 d-flex gap-20">
												<Card className={'stats-card'}>
													<p className="stat-heading">Opens and clicks</p>
													<AreaChart />
												</Card>
												<Card className={'stats-card'}>
													<p className="stat-heading">Link Activity</p>
													<div>
														<div className="d-flex content-space-between" style={{ borderBottom: '2px solid rgba(218, 209, 197, 1)' }}>
															<p className="stat-table-heading">Link</p>
															<p className="stat-table-heading">Clicks</p>
														</div>
														{campaign.stats?.l &&
															Object.entries(total_cmp_links)
																.sort((a, b) => b[1] - a[1]) // Sort by value (ascending order)
																.slice(0, 3)
																.map(([key, value]) => (
																	<div
																		className="d-flex content-space-between mt20"
																		style={{ textAlign: 'left', border: '2px solid rgba(218, 209, 197, 1)', padding: '12px', borderRadius: '8px' }}
																		key={key}
																	>
																		<p style={{ overflow: 'hidden' }}>{key}</p>
																		<p>{value.total ?? value}</p>
																	</div>
																))}
														<Button
															type="secondary"
															onClick={() => {
																setSelectedTab('link_act_tab')
															}}
															className={'mt20'}
														>
															See all links
														</Button>
													</div>
												</Card>
											</div>
											<div className="d-flex gap-20">
												<Card className={'stats-card'}>
													<p className="stat-heading">Device Type</p>
													<DoughnutChart stats={campaign.stats} />
												</Card>
												<Card className={'stats-card'}>
													<p className="stat-heading">Email Clients</p>
													<div>
														<div className="d-flex content-space-between" style={{ borderBottom: '2px solid rgba(218, 209, 197, 1)' }}>
															<p className="stat-table-heading">Clients</p>
															<p className="stat-table-heading">Subscribers</p>
														</div>
														{emailClientsOptions &&
															Object.entries(emailClientsOptions)
																.sort((a, b) => b[1] - a[1])
																.map(([key, value]) => (
																	<div
																		className="d-flex content-space-between mt20"
																		style={{ textAlign: 'left', border: '2px solid rgba(218, 209, 197, 1)', padding: '12px', borderRadius: '8px' }}
																		key={key}
																	>
																		<p>{key}</p>
																		<p>{value}</p>
																	</div>
																))}
													</div>
												</Card>
											</div>
										</div>
									) : (
										'No stats found'
									)}
								</>
							)}

							{selectedTab === 'absplit_tab' && (
								<>
									<div className="stats-container d-flex flex-column gap-20 ">
										<DataTable
											value={absplitCampaignData}
											paginator={false}
											// selection={selectedCampaigns}
											// onSelectionChange={(e) => setSelectedCampaigns(e.value)}
											dataKey="subject"
											rowClassName={() => 'p-table-row'}
										>
											<Column
												body={(rowData) => (
													<div style={{ position: 'relative' }}>
														<div style={{ position: 'absolute', top: '10px', left: '5px' }}>
															<Checkbox
																checked={selectedCampaigns.some((campaign) => campaign.name === rowData.name)}
																onChange={(e) => {
																	if (e) {
																		setSelectedCampaigns((prev) => [...prev, rowData])
																	} else {
																		setSelectedCampaigns((prev) => prev.filter((campaign) => campaign.id !== rowData.id))
																	}
																}}
															/>
														</div>

														<img src={rowData.image} alt={rowData.name} style={{ width: '88px', height: '88px' }} />
													</div>
												)}
												header={() => (
													<Checkbox
														checked={selectedCampaigns.length === absplitCampaignData.length && selectedCampaigns.length > 0}
														onChange={(e) => {
															if (e) {
																setSelectedCampaigns([...absplitCampaignData])
															} else {
																setSelectedCampaigns([])
															}
														}}
													/>
												)}
												headerStyle={{ width: '80px' }}
											/>
											<Column field="subject" header="Name" />
											<Column field="recipients" header="Recipients" />
											<Column field="opens" header="Opens" />
											<Column field="clicks" header="Clicks" />
										</DataTable>
									</div>
								</>
							)}

							{selectedTab === 'view_email_tab' && (
								<>
									<InputText label="Subject" value={campaign.subject} disabled={true} />

									<EmailPreview uuid={campaign.uuid} />
								</>
							)}

							{selectedTab === 'sub_act_tab' && <>Under Construction</>}

							{selectedTab === 'link_act_tab' && (
								<>
									{campaign.stats ? (
										<div className={'stats-card'}>
											<p className="stat-heading">Link Activity</p>
											<div>
												<div className="d-flex content-space-between" style={{ borderBottom: '2px solid rgba(218, 209, 197, 1)' }}>
													<p className="stat-table-heading">Link</p>
													<div style={{width:'20%',display:'flex',justifyContent:'space-between'}}>
														<p className="stat-table-heading">Total Clicks</p>
														<p className="stat-table-heading">Unique Clicks</p>
													</div>
												</div>
												{campaign.stats?.l &&
													Object.entries(total_cmp_links)
														.sort((a, b) => b[1] - a[1])
														.map(([key, value]) => (
															<div
																className="d-flex content-space-between align-items-center mt20"
																style={{ backgroundColor: ' #FFF8EF', border: '2px solid rgba(218, 209, 197, 1)', padding: '12px', borderRadius: '8px' }}
																key={key}
															>
																<p style={{ textAlign: 'left', overflow: 'hidden' }}>{key}</p>
																<div style={{width:'20%',display:'flex',justifyContent:'space-between'}}>
																	<p>{value.total ?? value}</p>
																	<p>{value.unique ?? value}</p>
																</div>
															</div>
														))}
											</div>
										</div>
									) : (
										'No stats found'
									)}
								</>
							)}

							{selectedTab === 'loc_data_tab' && (
							<>
								<div className="stats-container d-flex flex-column gap-20 mt20">
								<LocationData campaign={campaign} />
								</div>
							</>
							)}
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default EditCampaign
