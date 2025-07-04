import { React, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Stats.scss'

// Components
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import Stat from '../../components/Stat/Stat'
import AreaChart from '../../components/AreaChart/AreaChart'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import ButtonGroup from '../../components/ButtonGroup'
import LocationData from '../../components/LocationData/LocationData'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

const Stats = () => {
  const navigate = useNavigate()
  const { user, account } = useAccount()
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [activeTimeframe, setActiveTimeframe] = useState('month')
  const [activeView, setActiveView] = useState('overview')

  // Stats data exactly matching the Figma mockup
  const subscriberStats = [
    { label: 'Total Active', value: '894', percentage: 19, defaultValue: true },
    { label: 'Unsubscribed', value: '158', percentage: 35 },
    { label: 'New Today', value: '85', percentage: -15 },
    { label: 'New this Month', value: '4', percentage: 35 }
  ]

  const campaignStats = [
    { label: 'Emails Sent', value: '894', percentage: 19, defaultValue: true },
    { label: 'Total Clicks', value: '158', percentage: 35 },
    { label: 'Total Opens', value: '85', percentage: -15 },
    { label: 'Spams/Complaints', value: '4', percentage: 35 }
  ]

  // Fetch stats data
  useEffect(() => {
    const fetchStatsData = async () => {
      if (!user || !user.jwt) return
      
      setLoading(true)
      try {
        // In a real implementation, you would fetch data from your API
        // const response = await ApiService.get('fairymailer/getStats', user.jwt)
        // setStatsData(response.data)
        
        // Using mock data that matches the Figma design exactly
        setStatsData({
          subscribers: {
            total: 894,
            unsubscribed: 158,
            newToday: 85,
            newThisMonth: 4
          },
          campaigns: {
            sent: 894,
            clicks: 158,
            opens: 85,
            complaints: 4
          },
          metadata: {
            deviceType: {
              Desktop: 54,
              Mobile: 35,
              Tablet: 11
            }
          }
        })
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setLoading(false)
      }
    }

    fetchStatsData()
  }, [user])

  return (
    <div className="fm-page-wrapper">
      <Sidemenu />
      <div className="fm-page-container">
        {user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

        <div className="page-name-container">
          <div className="page-name">Stats</div>
        </div>

        {/* View and Timeframe Selectors */}
        <div className="stats-controls">
          <div className="stats-view-selector">
            <ButtonGroup
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'subscribers', label: 'Subscribers' },
                { value: 'campaigns', label: 'Campaigns' },
                { value: 'location', label: 'Location' },
              ]}
              value={activeView}
              onChange={(value) => setActiveView(value)}
            />
          </div>
          
          <div className="stats-timeframe-selector">
            <ButtonGroup
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              value={activeTimeframe}
              onChange={(value) => setActiveTimeframe(value)}
            />
          </div>
        </div>

        {/* Subscribers Stats Section */}
        <Card className="dashboard-stats subscribers-stats">
          <div className="stats-head">
            <div className="stats-title">Subscribers</div>
          </div>
          <div className="campaign-stats-card-wrapper">
            <div className="campaign-stats-card-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="Total Active" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="Unsubscribed" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="New Today" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="New this Month" />
            </div>
          </div>
          <div className="stats-chart">
            <AreaChart />
          </div>
        </Card>

        {/* Campaigns Stats Section */}
        <Card className="dashboard-stats campaigns-stats">
          <div className="stats-head">
            <div className="stats-title">Campaigns</div>
          </div>
          <div className="campaign-stats-card-wrapper">
            <div className="campaign-stats-card-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Emails Sent" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Total Clicks" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Total Opens" />
            </div>
            <div className="campaign-stats-card-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Spams/Complaints" />
            </div>
          </div>
          <div className="stats-chart">
            <AreaChart />
          </div>
        </Card>

        {/* Device Type Stats and Engagement Stats in a grid layout */}
        <div className="stats-grid">
          <Card className="device-stats">
            <div className="stats-head">
              <div className="stats-title">Device Type</div>
            </div>
            <div className="donut-chart-container">
              <DoughnutChart stats={statsData} />
            </div>
          </Card>

          {/* Engagement Stats */}
          <Card className="engagement-stats">
            <div className="stats-head">
              <div className="stats-title">Engagement</div>
            </div>
            <div className="engagement-metrics">
              <div className="metric">
                <div className="metric-value">21.4%</div>
                <div className="metric-label">Open Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">12.7%</div>
                <div className="metric-label">Click Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">0.8%</div>
                <div className="metric-label">Unsubscribe Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">0.2%</div>
                <div className="metric-label">Complaint Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Location Data */}
        <Card className="location-stats">
          <div className="stats-head">
            <div className="stats-title">Location</div>
          </div>
          <LocationData campaign={statsData} />
        </Card>
      </div>
    </div>
  )
}

export default Stats