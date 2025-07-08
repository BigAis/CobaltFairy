import React, { useState, useEffect } from 'react'
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
import Button from '../../components/Button'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

const Stats = () => {
  const navigate = useNavigate()
  const { user, account } = useAccount()
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState(null)
  const [activeTimeframe, setActiveTimeframe] = useState('month')
  const [currentDate, setCurrentDate] = useState('12/05/2024')

  // Stats data exactly matching the Figma mockup
  const subscriberStats = [
    { label: 'Total Active', value: '894', percentage: 19 },
    { label: 'Unsubscribed', value: '158', percentage: 35 },
    { label: 'New Today', value: '85', percentage: -15 },
    { label: 'New this Month', value: '4', percentage: 35 }
  ]

  const campaignStats = [
    { label: 'Emails Sent', value: '894', percentage: 19 },
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
        {user && account && <PageHeader />}

        {/* Header exactly like Figma */}
        <div className="figma-stats-header">
          <div className="figma-header-left">
            <h1 className="figma-stats-title">Stats</h1>
            <div className="figma-stats-date">
              <Icon name="Calendar" size={16} />
              {currentDate}
            </div>
          </div>
          
          <div className="figma-header-right">
            <ButtonGroup
              className="figma-timeframe-group"
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              value={activeTimeframe}
              onChange={(value) => setActiveTimeframe(value)}
            />
            
            <Button 
              type="secondary" 
              className="figma-export-btn" 
              icon="Export"
              onClick={() => console.log('Export clicked')}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Subscribers Section - exactly like Figma */}
        <Card className="figma-stats-card">
          <div className="figma-card-header">
            <h2 className="figma-card-title">Subscribers</h2>
          </div>
          
          <div className="figma-stats-row">
            <div className="figma-stat-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="Total Active" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="Unsubscribed" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="New Today" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={subscriberStats} hasChart={true} defaultLabel="New this Month" />
            </div>
          </div>
          
          <div className="figma-chart-area">
            <AreaChart />
          </div>
        </Card>

        {/* Campaigns Section - exactly like Figma */}
        <Card className="figma-stats-card">
          <div className="figma-card-header">
            <h2 className="figma-card-title">Campaigns</h2>
          </div>
          
          <div className="figma-stats-row">
            <div className="figma-stat-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Emails Sent" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Total Clicks" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Total Opens" />
            </div>
            <div className="figma-stat-item">
              <Stat stats={campaignStats} hasChart={true} defaultLabel="Spams/Complaints" />
            </div>
          </div>
          
          <div className="figma-chart-area">
            <AreaChart />
          </div>
        </Card>

        {/* Two column layout for Device Type and Engagement */}
        <div className="figma-two-columns">
          {/* Device Type */}
          <Card className="figma-device-card">
            <div className="figma-card-header">
              <h2 className="figma-card-title">Device Type</h2>
            </div>
            <div className="figma-donut-wrapper">
              <DoughnutChart stats={statsData} />
            </div>
          </Card>

          {/* Engagement */}
          <Card className="figma-engagement-card">
            <div className="figma-card-header">
              <h2 className="figma-card-title">Engagement</h2>
            </div>
            <div className="figma-engagement-metrics">
              <div className="figma-metric">
                <div className="figma-metric-value">21.4%</div>
                <div className="figma-metric-label">Open Rate</div>
              </div>
              <div className="figma-metric">
                <div className="figma-metric-value">12.7%</div>
                <div className="figma-metric-label">Click Rate</div>
              </div>
              <div className="figma-metric">
                <div className="figma-metric-value">0.8%</div>
                <div className="figma-metric-label">Unsubscribe Rate</div>
              </div>
              <div className="figma-metric">
                <div className="figma-metric-value">0.2%</div>
                <div className="figma-metric-label">Complaint Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Location Section */}
        <Card className="figma-location-card">
          <div className="figma-card-header">
            <h2 className="figma-card-title">Location</h2>
          </div>
          <LocationData campaign={statsData} />
        </Card>

        {/* Hide the campaigns table that appears at bottom */}
        <style jsx>{`
          .fm-page-container > *:not(.figma-stats-header):not(.figma-stats-card):not(.figma-two-columns):not(.figma-location-card) {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  )
}

export default Stats