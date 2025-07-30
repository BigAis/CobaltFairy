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
import { useNavigate, useLocation } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Ticks } from 'chart.js'
import { Line } from 'react-chartjs-2'
import PopupText from '../../components/PopupText/PopupText'
import DashboardChart from '../../components/DashboardChart/DashboardChart'
import OnboardingGuide from './OnboardingGuide/OnboardingGuide'

const Dashboard = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { user, account, loading: accountLoading, dataInitialized, createNotification } = useAccount()
	
	// Main dashboard data state
	const [statsData, setStatsData] = useState({})
	
	// Selected time periods
	const [statsKey, setStatsKey] = useState('d7')
	const [subsStatsKey, setSubsStatsKey] = useState('d7')
	
	// UI state
	const [latestCampaigns, setLatestCampaigns] = useState([])
	const [stats, setStats] = useState([])
	const [subsStats, setSubsStats] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [chartKey, setChartKey] = useState(0) // Used to force chart re-renders
	
	// State to control onboarding visibility
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
			setShowOnboarding(account.setup_complete !== true);
			console.log('Onboarding guide visibility set based on account setup_complete:', account.setup_complete !== true);
		}
	}, [account]);

	// Load stats once when component mounts
	useEffect(() => {
		// Only load stats when account is fully initialized and not in loading state
		if (user && account && dataInitialized && !accountLoading) {
			console.log('Account initialized, loading stats')
			loadStats()
		} else {
			console.log('Waiting for account data initialization')
		}
	}, [user, account, dataInitialized, accountLoading])

	// Check for refresh flag in URL (for when coming back from other pages)
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const shouldRefresh = queryParams.get('refresh') === 'true';
		
		if (shouldRefresh && user && account) {
			// Remove the flag from URL
			navigate('/dashboard', { replace: true });
			
			// Force refresh
			loadStats();
			
			// Show notification
			if (createNotification) {
				createNotification({
					message: 'Dashboard refreshed with latest data',
					type: 'default',
					autoClose: 3000
				});
			}
		}
	}, [location, user, account, navigate, createNotification]);

	// Main function to load dashboard stats - only called once when component mounts
	const loadStats = async () => {
		if (!user || !user.jwt || !account) {
			console.log('User or account data not available, skipping stats load')
			return;
		}
		
		setIsLoading(true);
		
		try {
			console.log('Loading dashboard stats...')
			let response = await ApiService.get('fairymailer/dashboard-stats', user.jwt)
			
			if (!response.data) {
				throw new Error('Invalid API response format');
			}
			
			const stats = response.data;
			
			// Validate and ensure all data structures exist
			validateAndNormalizeDashboardData(stats);
			
			console.log('Stats loaded successfully:', stats)
			setStatsData(stats)
			
			// Set initial metrics
			createCampaignMetrics(stats, statsKey);
			createSubscriberMetrics(stats, subsStatsKey);
			
			// Load latest campaigns
			let campaignsResp = await ApiService.get(
				`fairymailer/getCampaigns?filters[name][$contains]=${''}&filters[account]=${account?.id}&filters[status]=sent&pagination[pageSize]=3&pagination[page]=1`,
				user.jwt
			)
			
			if (campaignsResp.data && campaignsResp.data.data) {
				setLatestCampaigns(campaignsResp.data.data)
			} else {
				setLatestCampaigns([]);
			}
			
		} catch (error) {
			console.error('Error loading dashboard data:', error)
			
			// Create empty data structure as fallback
			const emptyData = {
				today: { emails: 0, opens: 0, clicks: 0, spam: 0, subs_count: 0, unsubs: 0 },
				d7: { emails: 0, opens: 0, clicks: 0, spam: 0, subs_count: 0, unsubs: 0 },
				d30: { emails: 0, opens: 0, clicks: 0, spam: 0, subs_count: 0, unsubs: 0 },
				all: { emails: 0, opens: 0, clicks: 0, spam: 0, subs_count: 0, unsubs: 0 },
				timeseries: {
					today: [],
					d7: [],
					d30: [],
					all: []
				}
			};
			
			setStatsData(emptyData);
			createCampaignMetrics(emptyData, statsKey);
			createSubscriberMetrics(emptyData, subsStatsKey);
			
			// Notify user of error
			if (createNotification) {
				createNotification({
					message: 'Could not load dashboard data. Please try refreshing the page.',
					type: 'warning',
					autoClose: 5000
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to validate and normalize dashboard data
	const validateAndNormalizeDashboardData = (stats) => {
		// Ensure all required period data exists
		const periods = ['today', 'd7', 'd30', 'all'];
		periods.forEach(period => {
			if (!stats[period]) {
				stats[period] = {
					opens: 0,
					clicks: 0,
					emails: 0,
					subs_count: 0,
					unsubs: 0
				};
			}
		});
		
		// Ensure timeseries data exists
		if (!stats.timeseries) {
			stats.timeseries = {};
		}
		
		// Ensure all timeseries periods exist
		periods.forEach(period => {
			if (!stats.timeseries[period]) {
				stats.timeseries[period] = [];
			}
		});
		
		// Create placeholder data for empty periods
		periods.forEach(period => {
			if (stats.timeseries[period].length === 0) {
				if (period === 'today') {
					// Create hourly data points for today
					const hours = [];
					for (let i = 0; i < 24; i++) {
						const now = new Date();
						now.setHours(i, 0, 0, 0);
						hours.push({
							date: now.toISOString(),
							subs_count: i === new Date().getHours() ? (stats.today.subs_count || 0) : 0,
							unsubs: i === new Date().getHours() ? (stats.today.unsubs || 0) : 0,
							opens: 0,
							clicks: 0,
							emails: 0
						});
					}
					stats.timeseries[period] = hours;
				} else if (period === 'd7') {
					// Create daily data points for last 7 days
					const days = [];
					for (let i = 6; i >= 0; i--) {
						const date = new Date();
						date.setDate(date.getDate() - i);
						date.setHours(0, 0, 0, 0);
						days.push({
							date: date.toISOString(),
							subs_count: i === 0 ? (stats.today.subs_count || 0) : 0,
							unsubs: i === 0 ? (stats.today.unsubs || 0) : 0,
							opens: 0,
							clicks: 0,
							emails: 0
						});
					}
					stats.timeseries[period] = days;
				} else if (period === 'all') {
					// Create monthly data points for all time
					const months = [];
					const now = new Date();
					for (let i = 0; i < 6; i++) {
						const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
						months.push({
							period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
							subs_count: i === 0 ? (stats.all.subs_count || 0) : 0,
							unsubs: i === 0 ? (stats.all.unsubs || 0) : 0,
							opens: 0,
							clicks: 0,
							emails: 0
						});
					}
					stats.timeseries[period] = months.reverse();
				}
			}
		});
	};

	// Function to create campaign metrics for a specific time period
	const createCampaignMetrics = (data, key) => {
		if (!data || !data[key]) return;
		
		let metrics = [
			{ label: 'Emails Sent', defaultValue: false, value: data[key].emails || 0, percentage: 0 },
			{ label: 'Total Opens', defaultValue: false, value: data[key].opens || 0, percentage: 0 },
			{ label: 'Total Clicks', defaultValue: false, value: data[key].clicks || 0, percentage: 0 },
			{ label: 'Spam', defaultValue: false, value: data[key].spam || 0, percentage: 0 }
		];
		
		setStats(metrics);
	};
	
	// Function to create subscriber metrics for a specific time period
	const createSubscriberMetrics = (data, key) => {
		if (!data || !data[key]) {
			console.log('Missing data for period:', key);
			return;
		}
		
		// For subscriber stats, show appropriate metrics based on selected period
		let metrics = [];
		
		// Calculate metrics based on the selected timeframe
		if (key === 'today') {
			// For "Today", show today's new subscribers
			metrics.push({ 
				label: 'New Subscribers Today', 
				defaultValue: false, 
				value: data[key].subs_count || 0, // Today's NEW subscribers 
				percentage: 0 
			});
			// Show only today's unsubscribes
			metrics.push({ 
				label: 'Unsubscribed Today', 
				defaultValue: false, 
				value: data[key].unsubs || 0, // Today's unsubscribes
				percentage: 0 
			});
		} else if (key === 'd7') {
			// For "7 Days", show this week's new subscribers
			metrics.push({ 
				label: 'New Subscribers (7 days)', 
				defaultValue: false, 
				value: data[key].subs_count || 0, // Last 7 days new subscribers
				percentage: 0 
			});
			// Show unsubscribes in the last 7 days
			metrics.push({ 
				label: 'Unsubscribed (7 days)', 
				defaultValue: false, 
				value: data[key].unsubs || 0, // Last 7 days unsubscribes
				percentage: 0 
			});
		} else if (key === 'all') {
			// For "All", show all-time total subscribers (cumulative)
			metrics.push({ 
				label: 'Total Subscribers', 
				defaultValue: false, 
				value: data[key].subs_count || 0, // All-time total subscribers
				percentage: 0 
			});
			// Show all-time total unsubscribes
			metrics.push({ 
				label: 'Total Unsubscribed', 
				defaultValue: false, 
				value: data[key].unsubs || 0, // All-time total unsubscribes
				percentage: 0 
			});
		}
		
		console.log('Subscriber metrics created for period', key, ':', metrics);
		setSubsStats(metrics);
	};
	
	// Handle campaign period change
	useEffect(() => {
		if (statsKey && statsData && Object.keys(statsData).length > 0) {
			createCampaignMetrics(statsData, statsKey);
		}
	}, [statsKey, statsData]);
	
	// Handle subscriber period change
	useEffect(() => {
		if (subsStatsKey && statsData && Object.keys(statsData).length > 0) {
			createSubscriberMetrics(statsData, subsStatsKey);
			// Force chart update when period changes
			setChartKey(prev => prev + 1);
		}
	}, [subsStatsKey, statsData]);

	// Function to handle setup completion
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
	};

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
						onClose={() => handleSetupComplete()} 
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
										setStatsKey(value);
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
											setSubsStatsKey(value);
										}}
									/>
								</div>
								<br></br>
								<div className={`campaign-charts ${isMobile ? 'mobile-charts' : ''}`}>
									{subsStats && (
										<>
											<div>
												<Stat 
													stats={subsStats} 
													hasChart={false} 
													defaultLabel={
														subsStatsKey === 'today' ? 'New Subscribers Today' : 
														subsStatsKey === 'd7' ? 'New Subscribers (7 days)' : 
														'Total Subscribers'
													} 
													timeseriesData={statsData.timeseries}
													timeseriesKey={subsStatsKey}
													metricKey="subs_count"
												/>
											</div>
											<div>
												<Stat 
													stats={subsStats} 
													hasChart={false} 
													defaultLabel={
														subsStatsKey === 'today' ? 'Unsubscribed Today' : 
														subsStatsKey === 'd7' ? 'Unsubscribed (7 days)' : 
														'Total Unsubscribed'
													} 
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
										key={`subscribers-chart-${chartKey}-${subsStatsKey}`}
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