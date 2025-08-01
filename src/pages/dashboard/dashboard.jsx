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
			setShowOnboarding(account.setup_complete !== true)
			console.log('Onboarding guide visibility set based on account setup_complete:', account.setup_complete !== true)
		}
	}, [account])

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
		const queryParams = new URLSearchParams(location.search)
		const shouldRefresh = queryParams.get('refresh') === 'true'

		if (shouldRefresh && user && account) {
			// Remove the flag from URL
			navigate('/dashboard', { replace: true })

			// Force refresh
			loadStats()

			// Show notification
			if (createNotification) {
				createNotification({
					message: 'Dashboard refreshed with latest data',
					type: 'default',
					autoClose: 3000,
				})
			}
		}
	}, [location, user, account, navigate, createNotification])

	// Main function to load dashboard stats - only called once when component mounts
	const loadStats = async () => {
		if (!user || !user.jwt || !account) {
			console.log('User or account data not available, skipping stats load')
			return
		}

		setIsLoading(true)

		try {
			console.log('Loading dashboard stats...')
			let response = await ApiService.get('fairymailer/dashboard-stats', user.jwt)

			if (!response.data) {
				throw new Error('Invalid API response format')
			}

			const stats = response.data

			// Validate and ensure all data structures exist
			validateAndNormalizeDashboardData(stats)

			console.log('Stats loaded successfully:', stats)
			setStatsData(stats)

			// Set initial metrics
			createCampaignMetrics(stats, statsKey)
			createSubscriberMetrics(stats, subsStatsKey)

			// Load latest campaigns
			let campaignsResp = await ApiService.get(
				`fairymailer/getCampaigns?filters[name][$contains]=${''}&filters[account]=${account?.id}&filters[status]=sent&pagination[pageSize]=3&pagination[page]=1`,
				user.jwt
			)

			if (campaignsResp.data && campaignsResp.data.data) {
				setLatestCampaigns(campaignsResp.data.data)
			} else {
				setLatestCampaigns([])
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
					all: [],
				},
			}

			setStatsData(emptyData)
			createCampaignMetrics(emptyData, statsKey)
			createSubscriberMetrics(emptyData, subsStatsKey)

			// Notify user of error
			if (createNotification) {
				createNotification({
					message: 'Could not load dashboard data. Please try refreshing the page.',
					type: 'warning',
					autoClose: 5000,
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	// Helper function to validate and normalize dashboard data
	const validateAndNormalizeDashboardData = (stats) => {
		// Ensure all required period data exists
		const periods = ['today', 'd7', 'd30', 'all']
		periods.forEach((period) => {
			if (!stats[period]) {
				stats[period] = {
					opens: 0,
					clicks: 0,
					emails: 0,
					subs_count: 0,
					unsubs: 0,
					spam: 0,
				}
			} else {
				// Εάν το period υπάρχει αλλά το unsubs λείπει, προσθέτουμε με τιμή 0
				if (stats[period].unsubs === undefined) {
					stats[period].unsubs = 0
				}
				// Εάν το period υπάρχει αλλά το spam λείπει, προσθέτουμε με τιμή 0
				if (stats[period].spam === undefined) {
					stats[period].spam = 0
				}
			}
		})

		// Ensure timeseries data exists
		if (!stats.timeseries) {
			stats.timeseries = {}
		}

		// Ensure all timeseries periods exist
		periods.forEach((period) => {
			if (!stats.timeseries[period]) {
				stats.timeseries[period] = []
			}
		})

		// Create placeholder data for empty periods
		periods.forEach((period) => {
			if (stats.timeseries[period].length === 0) {
				if (period === 'today') {
					// Create hourly data points for today
					const hours = []
					for (let i = 0; i < 24; i++) {
						const now = new Date()
						now.setHours(i, 0, 0, 0)
						hours.push({
							date: now.toISOString(),
							subs_count: i === new Date().getHours() ? stats.today.subs_count || 0 : 0,
							unsubs: i === new Date().getHours() ? stats.today.unsubs || 0 : 0,
							opens: 0,
							clicks: 0,
							emails: 0,
						})
					}
					stats.timeseries[period] = hours
				} else if (period === 'd7') {
					// Create daily data points for last 7 days
					const days = []
					for (let i = 6; i >= 0; i--) {
						const date = new Date()
						date.setDate(date.getDate() - i)
						date.setHours(0, 0, 0, 0)
						days.push({
							date: date.toISOString(),
							subs_count: i === 0 ? stats.today.subs_count || 0 : 0,
							unsubs: i === 0 ? stats.today.unsubs || 0 : 0,
							opens: 0,
							clicks: 0,
							emails: 0,
						})
					}
					stats.timeseries[period] = days
				} else if (period === 'd30') {
					// Create weekly data points for last 30 days
					const weeks = []
					for (let i = 0; i < 4; i++) {
						const date = new Date()
						date.setDate(date.getDate() - i * 7)
						weeks.push({
							date: date.toISOString(),
							subs_count: i === 0 ? stats.d7.subs_count || 0 : 0,
							unsubs: i === 0 ? stats.d7.unsubs || 0 : 0,
							opens: 0,
							clicks: 0,
							emails: 0,
						})
					}
					stats.timeseries[period] = weeks
				} else if (period === 'all') {
					// Create monthly data points for all time
					const months = []
					const now = new Date()
					for (let i = 0; i < 6; i++) {
						const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
						months.push({
							period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
							subs_count: i === 0 ? stats.all.subs_count || 0 : 0,
							unsubs: i === 0 ? stats.all.unsubs || 0 : 0,
							opens: 0,
							clicks: 0,
							emails: 0,
						})
					}
					stats.timeseries[period] = months.reverse()
				}
			} else {
				// Βεβαιωνόμαστε ότι κάθε καταχώρηση στο timeseries έχει το πεδίο unsubs
				stats.timeseries[period].forEach((entry) => {
					if (entry.unsubs === undefined) {
						entry.unsubs = 0
					}
				})
			}
		})
	}

	// Function to create campaign metrics for a specific time period
	const createCampaignMetrics = (data, key) => {
		if (!data || !data[key]) return

		// Helper function to calculate percentage change
		const calculatePercentage = (current, comparison) => {
			if (!comparison || comparison === 0) return 0
			return Math.round(((current - comparison) / comparison) * 100)
		}

		// Helper function to create timeseries data for a specific metric
		const createTimeseriesForMetric = (metricKey) => {
			if (!data.timeseries || !data.timeseries[key]) return []

			return data.timeseries[key].map((item) => ({
				date: item.date || item.period,
				value: item[metricKey] || 0,
			}))
		}

		const currentData = data[key]

		let metrics = [
			{
				label: 'Emails Sent',
				defaultValue: false,
				value: currentData.emails || 0,
				percentage: calculatePercentage(currentData.emails || 0, currentData.emails_comp || 0),
				timeseries: createTimeseriesForMetric('emails'),
			},
			{
				label: 'Total Opens',
				defaultValue: false,
				value: currentData.opens || 0,
				percentage: calculatePercentage(currentData.opens || 0, currentData.opens_comp || 0),
				timeseries: createTimeseriesForMetric('opens'),
			},
			{
				label: 'Total Clicks',
				defaultValue: false,
				value: currentData.clicks || 0,
				percentage: calculatePercentage(currentData.clicks || 0, currentData.clicks_comp || 0),
				timeseries: createTimeseriesForMetric('clicks'),
			},
			{
				label: 'Spam',
				defaultValue: false,
				value: currentData.spam || 0,
				percentage: 0, // No comparison data available for spam in API
				timeseries: createTimeseriesForMetric('spam'),
			},
		]

		setStats(metrics)
	}

	// Function to create subscriber metrics for a specific time period
	const createSubscriberMetrics = (data, key) => {
		if (!data || !data[key]) {
			console.log('Missing data for period:', key)
			return
		}

		// For subscriber stats, show appropriate metrics based on selected period
		let metrics = []

		// Υπολογισμός των πραγματικών τιμών από το timeseries
		let actualUnsubs = 0

		if (key === 'today') {
			// Για το "Today", παίρνουμε την τιμή unsubs από το timeseries.d7 για τη σημερινή ημερομηνία
			const today = new Date()
			const todayString = today.toISOString().split('T')[0] // "YYYY-MM-DD"

			if (data.timeseries && data.timeseries.d7 && Array.isArray(data.timeseries.d7)) {
				const todayEntry = data.timeseries.d7.find((item) => {
					if (!item.date) return false
					const itemDate = new Date(item.date).toISOString().split('T')[0]
					return itemDate === todayString
				})

				if (todayEntry && todayEntry.unsubs !== undefined) {
					actualUnsubs = todayEntry.unsubs
					console.log('Found today in timeseries.d7 with unsubs:', actualUnsubs)
				} else {
					actualUnsubs = data.today.unsubs || 0
					console.log('Today not found in timeseries.d7, using default:', actualUnsubs)
				}
			} else {
				actualUnsubs = data.today.unsubs || 0
			}

			// Create today metrics
			metrics.push({
				label: 'New Subscribers Today',
				defaultValue: false,
				value: data.today.subs_count || 0,
				percentage: 0,
			})

			metrics.push({
				label: 'Unsubscribed Today',
				defaultValue: false,
				value: actualUnsubs,
				percentage: 0,
			})
		} else if (key === 'd7') {
			// Για το "7 Days", αθροίζουμε τα unsubs από το timeseries.d7
			if (data.timeseries && data.timeseries.d7 && Array.isArray(data.timeseries.d7)) {
				actualUnsubs = data.timeseries.d7.reduce((sum, item) => sum + (item.unsubs || 0), 0)
				console.log('Calculated d7 unsubs from timeseries:', actualUnsubs)
			} else {
				actualUnsubs = data.d7.unsubs || 0
				console.log('No timeseries.d7 data, using default d7.unsubs:', actualUnsubs)
			}

			metrics.push({
				label: 'New Subscribers (7 days)',
				defaultValue: false,
				value: data.d7.subs_count || 0,
				percentage: 0,
			})

			metrics.push({
				label: 'Unsubscribed (7 days)',
				defaultValue: false,
				value: actualUnsubs,
				percentage: 0,
			})
		} else if (key === 'd30') {
			// Για το "30 Days", αθροίζουμε τα unsubs από το timeseries.d30
			if (data.timeseries && data.timeseries.d30 && Array.isArray(data.timeseries.d30)) {
				// Παίρνουμε μόνο τις τελευταίες 30 εγγραφές αν υπάρχουν περισσότερες
				const last30Days = data.timeseries.d30.slice(-30)
				actualUnsubs = last30Days.reduce((sum, item) => sum + (item.unsubs || 0), 0)
				console.log('Calculated d30 unsubs from timeseries:', actualUnsubs)
			} else {
				actualUnsubs = data.d30.unsubs || 0
				console.log('No timeseries.d30 data, using default d30.unsubs:', actualUnsubs)
			}

			metrics.push({
				label: 'New Subscribers (30 days)',
				defaultValue: false,
				value: data.d30.subs_count || 0,
				percentage: 0,
			})

			metrics.push({
				label: 'Unsubscribed (30 days)',
				defaultValue: false,
				value: actualUnsubs,
				percentage: 0,
			})
		} else if (key === 'all') {
			// Για το "All", αθροίζουμε τα unsubs από το timeseries.all
			if (data.timeseries && data.timeseries.all && Array.isArray(data.timeseries.all)) {
				actualUnsubs = data.timeseries.all.reduce((sum, item) => sum + (item.unsubs || 0), 0)
				console.log('Calculated all unsubs from timeseries:', actualUnsubs)

				// Αν το άθροισμα από το timeseries είναι 0, χρησιμοποιούμε την τιμή από το συγκεντρωτικό
				if (actualUnsubs === 0) {
					actualUnsubs = data.all.unsubs || 0
					console.log('Zero unsubs from timeseries.all, using default all.unsubs:', actualUnsubs)
				}
			} else {
				actualUnsubs = data.all.unsubs || 0
				console.log('No timeseries.all data, using default all.unsubs:', actualUnsubs)
			}

			metrics.push({
				label: 'Total Subscribers',
				defaultValue: false,
				value: data.all.subs_count || 0,
				percentage: 0,
			})

			metrics.push({
				label: 'Total Unsubscribed',
				defaultValue: false,
				value: actualUnsubs,
				percentage: 0,
			})
		}

		console.log('Subscriber metrics created for period', key, ':', metrics)
		setSubsStats(metrics)
	}

	// Handle campaign period change
	useEffect(() => {
		if (statsKey && statsData && Object.keys(statsData).length > 0) {
			createCampaignMetrics(statsData, statsKey)
		}
	}, [statsKey, statsData])

	// Handle subscriber period change
	useEffect(() => {
		if (subsStatsKey && statsData && Object.keys(statsData).length > 0) {
			createSubscriberMetrics(statsData, subsStatsKey)
			// Force chart update when period changes
			setChartKey((prev) => prev + 1)
		}
	}, [subsStatsKey, statsData])

	// Function to handle setup completion
	const handleSetupComplete = async () => {
		try {
			// Make API call to update setup_complete flag
			if (user && user.jwt) {
				const response = await ApiService.post('fairymailer/updateAccountSetupGuide', { setup_complete: true }, user.jwt)

				console.log('Setup guide completion updated:', response)

				// Hide the onboarding guide
				setShowOnboarding(false)

				// Notify user
				createNotification({
					message: "Setup completed! You're all set to start using FairyMail.",
					type: 'default',
					autoClose: 5000,
				})
			}
		} catch (error) {
			console.error('Error updating setup guide status:', error)
			createNotification({
				message: 'Error updating setup status. Setup may reappear on next login.',
				type: 'warning',
				autoClose: 5000,
			})
		}
	}

	// Loading state UI
	if (accountLoading || isLoading) {
		return (
			<div className="dashboard-wrapper">
				<Sidemenu />
				<div className="dashboard-container">
					<PageHeader />
					<div className="page-name-container">
						<div className="page-name">
							Dashboard <small style={{ fontSize: '14px', letterSpacing: '.2em' }}>v{APP_VERSION}</small>
						</div>
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
					<div className="page-name">
						Dashboard <small style={{ fontSize: '14px', letterSpacing: '.2em' }}>v{APP_VERSION}</small>
					</div>
				</div>

				{/* Conditionally render either onboarding guide or regular dashboard */}
				{showOnboarding ? (
					<OnboardingGuide onSetupComplete={handleSetupComplete} onClose={() => handleSetupComplete()} />
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
											<Stat stats={stats} hasChart={true} defaultLabel={'Emails Sent'} />
											<Stat stats={stats} hasChart={true} defaultLabel={'Total Clicks'} />
											<Stat stats={stats} hasChart={true} defaultLabel={'Total Opens'} />
											<Stat stats={stats} hasChart={true} defaultLabel={'Spam'} />
										</>
									)}
								</div>
							</div>
						</Card>
						<div className={`dashboard-ctas ${isMobile ? 'mobile-ctas' : ''}`}>
							<Button
								type={'secondary'}
								onClick={() => {
									if (isMobile) {
										PopupText.fire({
											icon: 'info',
											text: 'You can create a campaign on mobile, but the campaign editor is not available. You will be able to set up campaign details and review, but design editing requires a desktop device.',
											showCancelButton: false,
											confirmButtonText: 'Continue',
										}).then(() => {
											navigate('/campaigns/new')
										})
									} else {
										navigate('/campaigns/new')
									}
								}}
							>
								<Icon name="Campaigns" />
								<span>Create Campaign</span>
							</Button>
							<Button
								type={'secondary'}
								onClick={() => {
									navigate('/subscribers/import')
								}}
							>
								<Icon name="Contacts" />
								<span>Import Contacts</span>
							</Button>
							<Button
								type={'secondary'}
								onClick={() => {
									if (isMobile) {
										PopupText.fire({
											icon: 'warning',
											text: 'Automation editor is not available on mobile devices. Please use a desktop to design your automations.',
											showCancelButton: false,
											confirmButtonText: 'OK',
										})
									} else {
										navigate('/automations/new')
									}
								}}
							>
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
									/>
								</div>
								<br></br>
								<div className={`campaign-charts ${isMobile ? 'mobile-charts' : ''}`}>
									{subsStats && (
										<>
											<div>
												<Stat
													stats={subsStats}
													hasChart={false} /* This stat is a counter, no internal chart needed */
													defaultLabel={subsStatsKey === 'today' ? 'New Subscribers Today' : subsStatsKey === 'd7' ? 'New Subscribers (7 days)' : 'Total Subscribers'}
													// Removed timeseriesData, timeseriesKey, metricKey as per boss's feedback for counters
												/>
											</div>
											<div>
												<Stat
													stats={subsStats}
													hasChart={false} /* This stat is a counter, no internal chart needed */
													defaultLabel={subsStatsKey === 'today' ? 'Unsubscribed Today' : subsStatsKey === 'd7' ? 'Unsubscribed (7 days)' : 'Total Unsubscribed'}
													// Removed timeseriesData, timeseriesKey, metricKey as per boss's feedback for counters
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
										timeseriesData={statsData.timeseries} /* Correctly uses timeseries for chart */
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
