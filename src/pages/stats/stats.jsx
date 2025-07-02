import React, { useState } from 'react'
import './stats.scss'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import AreaChart from '../../components/AreaChart/AreaChart'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Checkbox from '../../components/Checkbox'
import Pagination from '../../components/Pagination'
import { useAccount } from '../../context/AccountContext'

const Stats = () => {
    const { user, account } = useAccount()
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCampaigns, setSelectedCampaigns] = useState([])
    
    // Static data to match Figma exactly
    const subscriberStats = [
        { label: 'Total Active', value: '894', percentage: '+19%', caretDirection: 'down' },
        { label: 'Unsubscribed', value: '158', percentage: '+35%', caretDirection: 'down' },
        { label: 'New Today', value: '85', percentage: '-15%', caretDirection: 'down' },
        { label: 'New this Month', value: '4', percentage: '+35%', caretDirection: 'down' }
    ]
    
    const campaignStats = [
        { label: 'Emails Sent', value: '894', percentage: '+19%', caretDirection: 'down' },
        { label: 'Total Clicks', value: '158', percentage: '+35%', caretDirection: 'down' },
        { label: 'Total Opens', value: '85', percentage: '-15%', caretDirection: 'down' },
        { label: 'Spams/Complains', value: '4', percentage: '+35%', caretDirection: 'down' }
    ]
    
    // Mock campaigns data to match Figma exactly
    const campaigns = [
        {
            id: 1,
            name: 'Campaign Name',
            subject: 'Subject goes her...',
            clicks: '158',
            recipients: '18% | 200',
            opens: '3% | 5',
            type: 'Normal',
            date: '2024-04-17'
        },
        {
            id: 2,
            name: 'Campaign Name',
            subject: 'Subject goes her...',
            clicks: '158',
            recipients: '18% | 200',
            opens: '3% | 5',
            type: 'Normal',
            date: '2024-04-17'
        },
        {
            id: 3,
            name: 'Campaign Name',
            subject: 'Subject goes her...',
            clicks: '158',
            recipients: '18% | 200',
            opens: '3% | 5',
            type: 'Normal',
            date: '2024-04-17'
        },
        {
            id: 4,
            name: 'Campaign Name',
            subject: 'Subject goes her...',
            clicks: '158',
            recipients: '18% | 200',
            opens: '3% | 5',
            type: 'Normal',
            date: '2024-04-17'
        },
        {
            id: 5,
            name: 'Campaign Name',
            subject: 'Subject goes her...',
            clicks: '158',
            recipients: '18% | 200',
            opens: '3% | 5',
            type: 'Normal',
            date: '2024-04-17'
        }
    ]

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Render small line chart with percentage
    const renderSmallChart = (percentage) => {
        const isPositive = !percentage.startsWith('-')
        const color = isPositive ? '#60C700' : '#F4A622'
        
        return (
            <div className="stat-chart-container">
                <div className="small-chart">
                    <svg width="70" height="33" viewBox="0 0 70 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                            d="M1 15C3.66667 13.3333 6.33333 11.6667 9 12C11.6667 12.3333 14.3333 14.6667 17 14C19.6667 13.3333 22.3333 9.66667 25 8C27.6667 6.33333 30.3333 6.66667 33 7C35.6667 7.33333 38.3333 7.66667 41 8C43.6667 8.33333 46.3333 8.66667 49 8C51.6667 7.33333 54.3333 5.66667 57 5C59.6667 4.33333 62.3333 4.66667 65 5" 
                            stroke={color} 
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <span className={isPositive ? "positive" : "negative"}>{percentage}</span>
            </div>
        )
    }

    // Render name column with thumbnail
    const nameTemplate = (rowData) => {
        return (
            <div className="campaign-name-cell">
                <img
                    src="/images/email-template-thumbnail.jpg"
                    alt="Campaign thumbnail"
                    className="campaign-thumbnail"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/60x60"
                    }}
                />
                <div className="campaign-info">
                    <div className="campaign-title">{rowData.name}</div>
                    <div className="campaign-subject">{rowData.subject}</div>
                </div>
            </div>
        )
    }

    // Render report dropdown
    const actionsTemplate = () => {
        return (
            <div className="report-dropdown">
                <Button type="secondary">
                    Report
                    <Icon name="Caret" className="caret-icon" />
                </Button>
            </div>
        )
    }
    
    // Render checkbox template
    const checkboxTemplate = (rowData) => {
        return (
            <Checkbox
                checked={selectedCampaigns.some(c => c.id === rowData.id)}
                onChange={(checked) => {
                    if (checked) {
                        setSelectedCampaigns([...selectedCampaigns, rowData])
                    } else {
                        setSelectedCampaigns(selectedCampaigns.filter(c => c.id !== rowData.id))
                    }
                }}
            />
        )
    }

    return (
        <div className="stats-page">
            <Sidemenu />
            <div className="stats-content">
                <PageHeader />
                
                <div className="stats-header">
                    <h1>Stats</h1>
                    <div className="header-actions">
                        <div className="date-display">
                            <Icon name="Calendar" />
                            <span>12/05/2024</span>
                        </div>
                        <Button type="secondary" className="export-button">
                            <Icon name="Download" />
                            Export
                        </Button>
                    </div>
                </div>
                
                {/* Subscribers Card */}
                <Card className="stats-card">
                    <h2>Subscribers</h2>
                    <div className="stats-grid">
                        {subscriberStats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <div className="stat-header">
                                    <span>{stat.label}</span>
                                    <Icon name="Caret" className="caret-icon" />
                                </div>
                                <div className="stat-value">{stat.value}</div>
                                {renderSmallChart(stat.percentage)}
                            </div>
                        ))}
                    </div>
                    <div className="chart-container">
                        <AreaChart />
                    </div>
                </Card>
                
                {/* Campaigns Card */}
                <Card className="stats-card">
                    <h2>Campaigns</h2>
                    <div className="stats-grid">
                        {campaignStats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <div className="stat-header">
                                    <span>{stat.label}</span>
                                    <Icon name="Caret" className="caret-icon" />
                                </div>
                                <div className="stat-value">{stat.value}</div>
                                {renderSmallChart(stat.percentage)}
                            </div>
                        ))}
                    </div>
                    <div className="chart-container">
                        <AreaChart />
                    </div>
                    
                    <div className="campaigns-table">
                        <DataTable
                            value={campaigns}
                            selection={selectedCampaigns}
                            onSelectionChange={(e) => setSelectedCampaigns(e.value)}
                            dataKey="id"
                            rowClassName={() => 'p-datatable-row'}
                            emptyMessage="No campaigns found"
                            paginator={false}
                        >
                            <Column body={checkboxTemplate} headerStyle={{ width: '50px' }} />
                            <Column header="Name" body={nameTemplate} />
                            <Column field="recipients" header="Recipients" />
                            <Column field="opens" header="Opens" />
                            <Column field="clicks" header="Clicks" />
                            <Column field="type" header="Type" />
                            <Column field="date" header="Date" />
                            <Column header="Actions" body={actionsTemplate} />
                        </DataTable>
                        
                        <Pagination
                            currentPage={currentPage}
                            totalResults={25}
                            resultsPerPage={5}
                            onChange={handlePageChange}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Stats