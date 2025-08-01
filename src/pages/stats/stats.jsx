import { useState, useEffect } from 'react'
import './Stats.scss'

// Components
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import Stat from '../../components/Stat/Stat'
import AreaChart from '../../components/AreaChart/AreaChart'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import Button from '../../components/Button'
import DateRangePicker from '../../components/DateRangePicker'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

const Stats = () => {
	const { user, account } = useAccount()
	const [loading, setLoading] = useState(true)
	const [statsData, setStatsData] = useState(null)
	const [dateRange, setDateRange] = useState({
		startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
		endDate: new Date(),
	})
	const [currentDate] = useState(new Date().toLocaleDateString('en-GB'))
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [error, setError] = useState(null)

	// Handle responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Helper function to format date for API
	const formatDateForAPI = (date) => {
		if (!date) return null
		const d = new Date(date)
		return d.toISOString().split('T')[0] // YYYY-MM-DD format
	}

	// Helper function to calculate percentage change (mock for now since we don't have historical data)
	const calculatePercentageChange = (current, previous = 0) => {
		if (previous === 0) return current > 0 ? 100 : 0
		return Math.round(((current - previous) / previous) * 100)
	}

	// Generate stats arrays from API data
	const getSubscriberStats = (data) => {
		if (!data) return []
		return [
			{
				label: 'Total Active',
				value: data.subscribers?.totalActive?.toString() || '0',
				percentage: calculatePercentageChange(data.subscribers?.totalActive || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.subs_added })) || [],
			},
			{
				label: 'Unsubscribed',
				value: data.subscribers?.unsubscribedInRange?.toString() || '0',
				percentage: calculatePercentageChange(data.subscribers?.unsubscribedInRange || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.subs_removed })) || [],
			},
			{
				label: 'New Today',
				value: data.subscribers?.newToday?.toString() || '0',
				percentage: calculatePercentageChange(data.subscribers?.newToday || 0),
			},
			{
				label: 'New in Range',
				value: data.subscribers?.newInRange?.toString() || '0',
				percentage: calculatePercentageChange(data.subscribers?.newInRange || 0),
			},
		]
	}

	const getCampaignStats = (data) => {
		if (!data) return []
		return [
			{
				label: 'Emails Sent',
				value: data.campaigns?.emailsSent?.toString() || '0',
				percentage: calculatePercentageChange(data.campaigns?.emailsSent || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.emails_sent })) || [],
			},
			{
				label: 'Total Clicks',
				value: data.campaigns?.totalClicks?.toString() || '0',
				percentage: calculatePercentageChange(data.campaigns?.totalClicks || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.clicks })) || [],
			},
			{
				label: 'Total Opens',
				value: data.campaigns?.totalOpens?.toString() || '0',
				percentage: calculatePercentageChange(data.campaigns?.totalOpens || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.opens })) || [],
			},
			{
				label: 'Spam/Complaints',
				value: data.campaigns?.spamComplaints?.toString() || '0',
				percentage: calculatePercentageChange(data.campaigns?.spamComplaints || 0),
				timeseries: data.timeseries?.map((item) => ({ ...item, value: item.spam_complaints })) || [],
			},
		]
	}

	const subscriberStats = getSubscriberStats(statsData)
	const campaignStats = getCampaignStats(statsData)

	// Fetch stats data from API
	useEffect(() => {
		const fetchStatsData = async () => {
			if (!user || !user.jwt) return
			if (!dateRange.startDate || !dateRange.endDate) return

			setLoading(true)
			setError(null)

			try {
				const fromDate = formatDateForAPI(dateRange.startDate)
				const toDate = formatDateForAPI(dateRange.endDate)

				const response = (await ApiService.get(`fairymailer/stats-page-data?from=${fromDate}&to=${toDate}`, user.jwt)).data
				console.log('response', response)

				if (response.code === 200) {
					// Map API response to component state
					setStatsData({
						...response.data,
						// Add device type data (mock for now since not in API response)
						metadata: {
							...response.data.metadata,
							deviceType: {
								Desktop: 54,
								Mobile: 35,
								Tablet: 11,
							},
						},
					})
				} else {
					throw new Error(response.message || 'Failed to fetch stats data')
				}

				setLoading(false)
			} catch (error) {
				console.error('Error fetching stats:', error)
				setError(error.message || 'Failed to load stats data')
				setLoading(false)
			}
		}

		fetchStatsData()
	}, [user, dateRange])

	const handleExport = () => {
		// In a real implementation, this would trigger a CSV/PDF export
		console.log('Exporting stats data...')
	}

	if (loading) {
		return (
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="loading-container">
						<p>Loading stats data...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="loading-container">
						<p style={{ color: '#ff635d' }}>Error: {error}</p>
						<Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>
							Retry
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fm-page-wrapper">
			<Sidemenu />
			<div className="fm-page-container">
				<PageHeader user={user} account={account} />

				{/* Header Section */}
				<div className="figma-stats-header">
					<div className="figma-header-left">
						<h1 className="figma-stats-title">Stats</h1>
						<div className="figma-stats-date">
							<Icon name="Clock" size={16} />
							{currentDate}
						</div>
					</div>

					<div className="figma-header-right">
						<DateRangePicker
							className="figma-date-range-picker"
							dateFormat="Y-m-d"
							onChange={({ startDate, endDate }) => {
								// Only update if both dates are selected
								if (startDate && endDate) {
									setDateRange({ startDate, endDate })
								}
							}}
							startDate={dateRange.startDate}
							endDate={dateRange.endDate}
							hasMinDate={false}
						/>

						<Button type="secondary" className="figma-export-btn" icon="Export" onClick={handleExport}>
							Export
						</Button>
					</div>
				</div>

				{/* Subscribers Section */}
				<Card className="figma-stats-card">
					<div className="figma-card-header" style={{ textAlign: 'left' }}>
						<h2 className="figma-card-title">Subscribers</h2>
					</div>

					<div className={`figma-stats-row ${isMobile ? 'mobile-stats-row' : ''}`}>
						{subscriberStats.map((stat, index) => (
							<div className="figma-stat-item" key={index}>
								<Stat stats={subscriberStats} hasChart={true} defaultLabel={stat.label} />
							</div>
						))}
					</div>

					<div className="figma-chart-area">
						<AreaChart
							timeseriesData={statsData?.timeseries || []}
							dataset1Key="subs_added"
							dataset2Key="subs_removed"
							dataset1Label="Subscribers Added"
							dataset2Label="Subscribers Removed"
							dataset1Color="#60C700"
							dataset2Color="#FFA600"
						/>
					</div>
				</Card>

				{/* Campaigns Section */}
				<Card className="figma-stats-card">
					<div className="figma-card-header" style={{ textAlign: 'left' }}>
						<h2 className="figma-card-title">Campaigns</h2>
					</div>

					<div className={`figma-stats-row ${isMobile ? 'mobile-stats-row' : ''}`}>
						{campaignStats.map((stat, index) => (
							<div className="figma-stat-item" key={index}>
								<Stat stats={campaignStats} hasChart={true} defaultLabel={stat.label} />
							</div>
						))}
					</div>

					<div className="figma-chart-area">
						<AreaChart
							timeseriesData={statsData?.timeseries || []}
							dataset1Key="opens"
							dataset2Key="clicks"
							dataset1Label="Email Opens"
							dataset2Label="Email Clicks"
							dataset1Color="#60C700"
							dataset2Color="#60C700"
						/>
					</div>
				</Card>

				{/* Two column layout for Device Type and Engagement */}
				<div className={`figma-two-columns ${isMobile ? 'mobile-columns' : ''}`}>
					{/* Device Type */}
					<Card className="figma-device-card">
						<div className="figma-card-header" style={{ textAlign: 'left' }}>
							<h2 className="figma-card-title">Device Type</h2>
						</div>
						<div className="figma-donut-wrapper">
							<DoughnutChart stats={statsData} />
						</div>
					</Card>

					{/* Engagement */}
					<Card className="figma-engagement-card">
						<div className="figma-card-header" style={{ textAlign: 'left' }}>
							<h2 className="figma-card-title">Engagement</h2>
						</div>
						<div className="figma-engagement-metrics">
							<div className="figma-metric">
								<div className="figma-metric-value">{statsData?.rates?.openRate?.toFixed(1) || '0.0'}%</div>
								<div className="figma-metric-label">Open Rate</div>
							</div>
							<div className="figma-metric">
								<div className="figma-metric-value">{statsData?.rates?.clickRate?.toFixed(1) || '0.0'}%</div>
								<div className="figma-metric-label">Click Rate</div>
							</div>
							<div className="figma-metric">
								<div className="figma-metric-value">{statsData?.rates?.bounceRate?.toFixed(1) || '0.0'}%</div>
								<div className="figma-metric-label">Bounce Rate</div>
							</div>
							<div className="figma-metric">
								<div className="figma-metric-value">{statsData?.rates?.spamRate?.toFixed(2) || '0.0'}%</div>
								<div className="figma-metric-label">Spam Rate</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default Stats
