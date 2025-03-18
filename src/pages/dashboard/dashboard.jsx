import './dashboard.scss'
import '../../fullpage.scss'
import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import { ApiService, APP_VERSION } from '../../service/api-service'
import CampaignsTable from '../../components/DataTable/CampaignsTable'
import { useNavigate } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Ticks } from 'chart.js'
import { Line } from 'react-chartjs-2'
import PopupText from '../../components/PopupText/PopupText'
const Dashboard = () => {
	const navigate = useNavigate()
	const { user, account, loading, error } = useAccount()
	const [statsData, setStatsData] = useState({})
	const [statsKey, setStatsKey] = useState('d7')
	const [subsStats, setSubsStats] = useState(null)
	const [subsStatsKey, setSubsStatsKey] = useState('d7')
	const [latestCampaigns, setLatestCampaigns] = useState([{}, {}, {}, {}])
	const [stats, setStats] = useState([])

	const isPositive = true
	const subsChartData = {
		labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
		datasets: [
			{
				data: [2, 2.5, 3, 3.5, 4, 3.5, 4, 3.7, 5, 5, 4.5, 4, 3.8, 3.5, 3.7, 3.3, 2.5, 3.5, 3, 3.5, 4],
				borderColor: isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
			{
				data: [1, 1.5, 2, 1.5, 2, 1.5, 1, 2.7, 2, 3, 3.5, 2, 1.8, 1.5, 1.7, 2.3, 0.5, 2.5, 1, 0.5, 4],
				borderColor: !isPositive ? 'rgba(96, 199, 0, 1)' : 'rgba(255, 166, 0, 1)',
				borderWidth: 3,
				tension: 0.4,
				pointRadius: 0,
				fill: true,
			},
		],
	}
	const subsChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false,
			},
		},
		scales: {
			x: {
				display: false,
			},
			y: {
				display: false,
				min: 0,
			},
		},
		elements: {
			line: {
				tension: 1,
			},
		},
	}

	const loadStats = async () => {
		if (!user) return
		let stats = await ApiService.get('fairymailer/dashboard-stats', user.jwt)
		console.log('stats', stats.data)
		setStatsData(stats.data)
		let resp = await ApiService.get(
			`fairymailer/getCampaigns?filters[name][$contains]=${''}&filters[account]=${account?.id}&filters[status]=sent&pagination[pageSize]=3&pagination[page]=1`,
			user.jwt
		)
		// setLatestCampaigns(resp.data.data)
	}
	const createStatsMetrics = () => {
		let key = statsKey
		if (!key || !statsData || !statsData[key]) return
		let data = []
		data.push({ label: 'Emails Sent', defaultValue: false, value: statsData[key].emails, percentage: 0 })
		data.push({ label: 'Total Opens', defaultValue: false, value: statsData[key].opens, percentage: 0 })
		data.push({ label: 'Total Clicks', defaultValue: false, value: statsData[key].clicks, percentage: 0 })
		data.push({ label: 'Spam', defaultValue: false, value: 0, percentage: 0 })
		console.log('stats data', data)
		setStats(data)
	}
	const createSubsStatsMetrics = () => {
		let key = statsKey
		if (!key || !statsData || !statsData[key]) {
			console.log(statsData, key)
			return
		}
		let data = []
		data.push({ label: 'Total', defaultValue: false, value: statsData[key].subs_count, percentage: 0 })
		data.push({ label: 'Unsubscribed', defaultValue: false, value: statsData[key].unsubs, percentage: 0 })
		setSubsStats(data)
		console.log(data)
	}
	useEffect(() => {
		createStatsMetrics()
	}, [statsData, statsKey])
	useEffect(() => {
		createSubsStatsMetrics()
	}, [statsData, subsStatsKey])

	useEffect(() => {
		if (user && account) {
			loadStats()
		}
	}, [user, account])

	return (
		<>
			<div className="dashboard-wrapper">
				<Sidemenu />
				<div className="dashboard-container">
					<PageHeader />
					<div className="page-name-container">
						<div className="page-name">Dashboard <small style={{fontSize:'14px',letterSpacing: '.2em'}}>v{APP_VERSION}</small></div>
					</div>
					<Card className="dashboard-stats">
						<div className="stats-head">
							<span className="stats-title">Campaigns</span>
							<ButtonGroup
								value="d7"
								options={[
									{ value: 'today', label: 'Today' },
									{ value: 'd7', label: '7 Days' },
									{ value: 'd30', label: '30 Days' },
									{ value: 'all', label: 'All' },
								]}
								onChange={(value) => {
									setStatsKey(value)
								}}
							></ButtonGroup>
						</div>
						<div>
							<div className="campaign-charts d-flex gap-30">
								{stats && (
									<>
										<Stat stats={stats} hasChart={true} defaultLabel={'Emails Sent'} />
										<Stat stats={stats} hasChart={true} defaultLabel={'Total Clicks'} />
										<Stat stats={stats} hasChart={true} defaultLabel={'Total Opens'} />
										<Stat stats={stats} hasChart={true} defaultLabel={'Spam'} />
									</>
								)}
							</div>
						</div>
					</Card>
					<div className="dashboard-ctas">
						<Button type={'secondary'} onClick={()=>{navigate(`/campaigns/new`)}}>
							<Icon name="Campaigns" />
							Create Campaign
						</Button>
						<Button type={'secondary'} onClick={()=>{
							PopupText.fire({text:'Under Construction',showCancelButton:false,confirmButtonText:'OK'})
						}}>
							<Icon name="Contacts" />
							Import Contacts
						</Button>
						<Button type={'secondary'}  onClick={()=>{navigate(`/automations/new`)}}>
							<Icon name="Automations" />
							Create Automation
						</Button>
					</div>
					<div className="columns-2">
						<Card className="subscribers-stats">
							<div className="stats-head">
								<span className="stats-title">Subscribers</span>
								<ButtonGroup
									value="today"
									options={[
										{ value: 'today', label: 'Today' },
										{ value: 'd7', label: '7 Days' },
										{ value: 'all', label: 'All' },
									]}
									onChange={(value) => {
										setSubsStatsKey(value)
									}}
								></ButtonGroup>
							</div>
							<br></br>
							<div className="campaign-charts d-flex gap-30">
								{subsStats && (
									<>
										<div>
											<Stat stats={subsStats} hasChart={false} defaultLabel={'Total'} />
										</div>
										<div>
											<Stat stats={subsStats} hasChart={false} defaultLabel={'Unsubscribed'} />
										</div>
									</>
								)}
							</div>
							<br></br>
							<div style={{ height: '350px' }}>
								<Line data={subsChartData} options={subsChartOptions} />
							</div>
							<br></br>
							<Button
								type={'secondary'}
								onClick={() => {
									navigate('/subscribers')
								}}
							>
								All Subscribers
							</Button>
						</Card>
						<Card className="subscribers-stats">
							<div className="stats-head">
								<span className="stats-title">Latest Campaigns</span>
							</div>
							<br></br>
							<CampaignsTable campaigns={latestCampaigns.filter((campaign) => campaign.status === 'sent')} dashboardPreviewOnly={true} />
							<br></br>
							<Button
								type={'secondary'}
								onClick={() => {
									navigate('/campaigns')
								}}
							>
								All Campaigns
							</Button>
						</Card>
					</div>
				</div>
			</div>
		</>
	)
}

export default Dashboard
