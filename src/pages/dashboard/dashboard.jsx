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
import DashboardChart from '../../components/DashboardChart/DashboardChart'
import OnboardingGuide from './OnboardingGuide/OnboardingGuide'

const Dashboard = () => {
	const navigate = useNavigate()
	const { user, account, loading: accountLoading, dataInitialized, createNotification } = useAccount()
	const [statsData, setStatsData] = useState({})
	const [statsKey, setStatsKey] = useState('d7')
	const [subsStats, setSubsStats] = useState(null)
	const [subsStatsKey, setSubsStatsKey] = useState('d7')
	const [latestCampaigns, setLatestCampaigns] = useState([{}, {}, {}, {}])
	const [stats, setStats] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	
	// State to control onboarding visibility - now initialized based on account.setup_complete
	const [showOnboarding, setShowOnboarding] = useState(false)
  
	// Handle responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}
		
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Set showOnboarding based on account.setup_complete when account data is loaded
	useEffect(() => {
		if (account) {
			// Show onboarding guide if setup_complete is null or false
			setShowOnboarding(account.setup_complete !== true);
			console.log('Onboarding guide visibility set based on account setup_complete:', account.setup_complete !== true);
		}
	}, [account]);

	// Improved loadStats function with retry mechanism
	const loadStats = async () => {
		if (!user || !user.jwt || !account) {
		  console.log('User or account data not available, skipping stats load')
		  return;
		}
		
		let retries = 0;
		const maxRetries = 3;
		
		setIsLoading(true);
		
		const attemptLoadStats = async () => {
		  try {
			console.log(`Loading dashboard stats... (attempt ${retries + 1}/${maxRetries})`)
			let stats = await ApiService.get('fairymailer/dashboard-stats', user.jwt)
			console.log('Stats loaded successfully:', stats.data)
			setStatsData(stats.data)
			
			let resp = await ApiService.get(
			  `fairymailer/getCampaigns?filters[name][$contains]=${''}&filters[account]=${account?.id}&filters[status]=sent&pagination[pageSize]=3&pagination[page]=1`,
			  user.jwt
			)
			console.log('Campaigns loaded:', resp.data)
			if (resp.data && resp.data.data) {
			  setLatestCampaigns(resp.data.data)
			}
			
			return true // Success
		  } catch (error) {
			console.error(`Error loading dashboard data (attempt ${retries + 1}/${maxRetries}):`, error)
			retries++;
			
			if (retries < maxRetries) {
			  console.log(`Retrying in 1 second... (${retries}/${maxRetries})`)
			  await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
			  return await attemptLoadStats() // Recursively retry
			}
			return false // Failed after max retries
		  }
		};
		
		const success = await attemptLoadStats();
		
		if (!success) {
		  console.error('Failed to load dashboard data after multiple attempts')
		  // You could show an error message to the user here
		}
		
		setIsLoading(false);
	};

	// Updated to make API call to update setup_complete flag
	const handleSetupComplete = async () => {
		try {
			// Make API call to update setup_complete flag
			if (user && user.jwt) {
				const response = await ApiService.post(
					'fairymailer/updateAccountSetupGuide',
					{ setup_complete: true },
					user.jwt
				);
				
				console.log('Setup guide completion updated:', response);
				
				// Hide the onboarding guide
				setShowOnboarding(false);
				
				// Notify user
				createNotification({
					message: 'Setup completed! You\'re all set to start using FairyMail.',
					type: 'default',
					autoClose: 5000
				});
			}
		} catch (error) {
			console.error('Error updating setup guide status:', error);
			createNotification({
				message: 'Error updating setup status. Setup may reappear on next login.',
				type: 'warning',
				autoClose: 5000
			});
		}
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
		let key = subsStatsKey
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
		// Only load stats when account is fully initialized and not in loading state
		if (user && account && dataInitialized && !accountLoading) {
			console.log('Account initialized, loading stats')
			loadStats()
		} else {
			console.log('Waiting for account data initialization')
		}
	}, [user, account, dataInitialized, accountLoading])

	// Loading state UI
	if (accountLoading || isLoading) {
		return (
			<div className="dashboard-wrapper">
				<Sidemenu />
				<div className="dashboard-container">
					<PageHeader />
					<div className="page-name-container">
						<div className="page-name">Dashboard <small style={{fontSize:'14px',letterSpacing: '.2em'}}>v{APP_VERSION}</small></div>
					</div>
					<Card className="dashboard-stats">
						<div style={{ textAlign: 'center', padding: '20px' }}>
							<p>Loading dashboard data...</p>
						</div>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="dashboard-wrapper">
			<Sidemenu />
			<div className="dashboard-container">
				<PageHeader />
				<div className="page-name-container">
					<div className="page-name">Dashboard <small style={{fontSize:'14px',letterSpacing: '.2em'}}>v{APP_VERSION}</small></div>
				</div>
				
				{/* Conditionally render either onboarding guide or regular dashboard */}
				{showOnboarding ? (
					<OnboardingGuide 
						onSetupComplete={handleSetupComplete}
						onClose={() => handleSetupComplete()} // Closing should also mark as complete
					/>
				) : (
					<>
						<Card className="dashboard-stats">
							<div className="stats-head">
								<span className="stats-title">Campaigns</span>
								<ButtonGroup
									value={statsKey}
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
								<div className={`campaign-charts ${isMobile ? 'mobile-charts' : ''}`}>
									{stats && (
										<>
											<Stat 
												stats={stats} 
												hasChart={true} 
												defaultLabel={'Emails Sent'} 
												timeseriesData={statsData.timeseries}
												timeseriesKey={statsKey}
												metricKey="emails"
											/>
											<Stat 
												stats={stats} 
												hasChart={true} 
												defaultLabel={'Total Clicks'} 
												timeseriesData={statsData.timeseries}
												timeseriesKey={statsKey}
												metricKey="clicks"
											/>
											<Stat 
												stats={stats} 
												hasChart={true} 
												defaultLabel={'Total Opens'} 
												timeseriesData={statsData.timeseries}
												timeseriesKey={statsKey}
												metricKey="opens"
											/>
											<Stat 
												stats={stats} 
												hasChart={true} 
												defaultLabel={'Spam'} 
												timeseriesData={statsData.timeseries}
												timeseriesKey={statsKey}
												metricKey="spam"
											/>
										</>
									)}
								</div>
							</div>
						</Card>
						<div className={`dashboard-ctas ${isMobile ? 'mobile-ctas' : ''}`}>
						<Button type={'secondary'} onClick={() => {
						if (isMobile) {
							PopupText.fire({
							icon: 'info',
							text: 'You can create a campaign on mobile, but the campaign editor is not available. You will be able to set up campaign details and review, but design editing requires a desktop device.',
							showCancelButton: false,
							confirmButtonText: 'Continue',
							}).then(() => {
							navigate('/campaigns/new');
							});
						} else {
							navigate('/campaigns/new');
						}
						}}>
						<Icon name="Campaigns" />
						<span>Create Campaign</span>
						</Button>
							<Button type={'secondary'} onClick={()=>{
								navigate('/subscribers/import')
							}}>
								<Icon name="Contacts" />
								<span>Import Contacts</span>
							</Button>
							<Button type={'secondary'} onClick={() => {
								if (isMobile) {
								PopupText.fire({
									icon: 'warning',
									text: 'Automation editor is not available on mobile devices. Please use a desktop to design your automations.',
									showCancelButton: false,
									confirmButtonText: 'OK',
								});
								} else {
								navigate('/automations/new');
								}
							}}>
								<Icon name="Automations" />
								<span>Create Automation</span>
							</Button>
						</div>
						<div className={`columns-2 ${isMobile ? 'mobile-columns' : ''}`}>
							<Card className="subscribers-stats">
								<div className="stats-head">
									<span className="stats-title">Subscribers</span>
									<ButtonGroup
										value={subsStatsKey}
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
								<div className={`campaign-charts ${isMobile ? 'mobile-charts' : ''}`}>
									{subsStats && (
										<>
											<div>
												<Stat 
													stats={subsStats} 
													hasChart={false} 
													defaultLabel={'Total'} 
													timeseriesData={statsData.timeseries}
													timeseriesKey={subsStatsKey}
													metricKey="subs_count"
												/>
											</div>
											<div>
												<Stat 
													stats={subsStats} 
													hasChart={false} 
													defaultLabel={'Unsubscribed'} 
													timeseriesData={statsData.timeseries}
													timeseriesKey={subsStatsKey}
													metricKey="unsubs"
												/>
											</div>
										</>
									)}
								</div>
								<br></br>
								<div style={{ height: isMobile ? '200px' : '350px' }}>
									<DashboardChart 
										isPositive={true} 
										timeseriesData={statsData.timeseries} 
										timeseriesKey={subsStatsKey}
										metric1="subs_count"
										metric2="unsubs"
									/>
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
							<Card className="subscribers-stats latest-campaigns-card">
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
					</>
				)}
			</div>
		</div>
	)
}

export default Dashboard