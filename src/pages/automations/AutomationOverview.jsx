import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Stat from '../../components/Stat/Stat'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Pagination from '../../components/Pagination'
import Checkbox from '../../components/Checkbox'
import ButtonGroup from '../../components/ButtonGroup'
import Switch from '../../components/Switch'
import Button from '../../components/Button'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const AutomationOverview = ({ automation }) => {
  const { user } = useAccount()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [workflowStats, setWorkflowStats] = useState([])
  const [workflowEmails, setWorkflowEmails] = useState([])
  const [currentStatsPage, setCurrentStatsPage] = useState(1)
  const [currentEmailsPage, setCurrentEmailsPage] = useState(1)
  const [selectedStats, setSelectedStats] = useState([])
  const [selectedEmails, setSelectedEmails] = useState([])
  const [statsTimeFilter, setStatsTimeFilter] = useState('3months')
  const statsPerPage = 5
  const emailsPerPage = 5

  useEffect(() => {
    const loadAutomationStats = async () => {
      if (!automation || !automation.id) return

      try {
        setLoading(true)
        // In a real implementation, you would fetch actual stats data from the API
        // For now, we'll create some placeholder data matching the Figma design
        const mockStats = {
          subscriberStats: {
            completed: automation.subscriberStats?.completed || 6714,
            queued: automation.subscriberStats?.queued || 734,
            openRate: automation.subscriberStats?.openRate || 37.21,
            clickRate: automation.subscriberStats?.clickRate || 7.26,
            newSubscribers: automation.subscriberStats?.newSubscribers || 802,
            avgSubscribers: automation.subscriberStats?.avgSubscribers || 109
          },
          metadata: {
            deviceType: {
              Desktop: 60,
              Mobile: 30,
              Tablet: 10
            },
            emailClients: {
              Gmail: 41,
              Yahoo: 41,
              Outlook: 18
            }
          }
        }

        // Mock workflow stats
        const mockWorkflowStats = Array(5).fill(0).map((_, index) => ({
          id: index + 1,
          month: '2024 November',
          emailsSent: 2175,
          opened: 28,
          openedPercent: 5,
          clicked: 28,
          clickedPercent: 5,
          unsubscribed: 28,
          unsubscribedPercent: 5,
          spams: 28,
          spamsPercent: 5
        }))

        // Mock workflow emails
        const mockWorkflowEmails = Array(5).fill(0).map((_, index) => ({
          id: index + 1,
          name: `Campaign Name ${index + 1}`,
          subject: `Subject goes here... ${index + 1}`,
          recipients: 158,
          opens: 18,
          opensTotal: 200,
          clicks: 3,
          clicksTotal: 5,
          type: 'Normal',
          date: '2024-04-17',
          active: Math.random() > 0.5
        }))

        setStats(mockStats)
        setWorkflowStats(mockWorkflowStats)
        setWorkflowEmails(mockWorkflowEmails)
      } catch (error) {
        console.error('Error loading automation stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAutomationStats()
  }, [automation])

  // Calculate paginated data
  const paginatedWorkflowStats = workflowStats.slice(
    (currentStatsPage - 1) * statsPerPage,
    currentStatsPage * statsPerPage
  )

  const paginatedWorkflowEmails = workflowEmails.slice(
    (currentEmailsPage - 1) * emailsPerPage,
    currentEmailsPage * emailsPerPage
  )

  // Format stats for the Stat component
  const getStatsData = () => {
    if (!stats) return [];

    return [
      [
        { label: 'Completed subscribers', value: stats.subscriberStats.completed, percentage: 5.2, defaultValue: true },
      ],
      [
        { label: 'Subscribers in the queue', value: stats.subscriberStats.queued, percentage: 2.1, defaultValue: true },
      ],
      [
        { label: 'Avg open rate', value: `${stats.subscriberStats.openRate}%`, percentage: 1.8, defaultValue: true },
      ],
      [
        { label: 'Avg click rate', value: `${stats.subscriberStats.clickRate}%`, percentage: -0.5, defaultValue: true },
      ],
      [
        { label: 'Avg new subscribers', value: stats.subscriberStats.newSubscribers, percentage: 3.2, defaultValue: true },
      ],
      [
        { label: 'Avg Subscribers', value: stats.subscriberStats.avgSubscribers, percentage: 1.4, defaultValue: true },
      ]
    ];
  }
  
  // Time filter options
  const timeFilterOptions = [
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'All', value: 'all' }
  ];

  // Selection template for tables
  const selectionTemplate = (rowData) => (
    <Checkbox 
      checked={selectedStats.includes(rowData.id)} 
      onChange={(checked) => {
        if (checked) {
          setSelectedStats([...selectedStats, rowData.id]);
        } else {
          setSelectedStats(selectedStats.filter(id => id !== rowData.id));
        }
      }} 
    />
  )
  
  // Email selection template
  const emailSelectionTemplate = (rowData) => (
    <Checkbox 
      checked={selectedEmails.includes(rowData.id)} 
      onChange={(checked) => {
        if (checked) {
          setSelectedEmails([...selectedEmails, rowData.id]);
        } else {
          setSelectedEmails(selectedEmails.filter(id => id !== rowData.id));
        }
      }} 
    />
  )

  // Status toggle template
  const statusTemplate = (rowData) => (
    <Switch 
      checked={rowData.active} 
      onChange={() => {
        // Update workflow email active status
        const updatedEmails = workflowEmails.map(email => 
          email.id === rowData.id ? {...email, active: !email.active} : email
        );
        setWorkflowEmails(updatedEmails);
      }}
    />
  )
  
  // Actions template
  const actionsTemplate = () => (
    <div className="actions-cell">
      <Button type="secondary">Report</Button>
      <Button type="secondary" icon="Caret" />
    </div>
  )
  
  // Campaign image template
  const campaignImageTemplate = () => (
    <div className="campaign-image">
      <img src="/images/campaign-preview.png" alt="Campaign preview" />
    </div>
  )

  return (
    <div className="automation-overview">
      {loading ? (
        <>
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="stat-card">
                <Skeleton height={80} />
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Stats Grid - 2x2 layout */}
          <div className="stats-grid">
            {getStatsData().slice(0, 6).map((statGroup, index) => (
              <Card key={index} className="stat-card">
                <Stat stats={statGroup} hasChart={true} defaultLabel={statGroup[0].label} />
              </Card>
            ))}
          </div>

          {/* Device Type and Email Clients */}
          <div className="charts-row">
            <Card className="chart-card">
              <h3 className="card-title">Device Type</h3>
              <div className="chart-container">
                <DoughnutChart stats={stats} />
              </div>
            </Card>

            <Card className="chart-card">
              <h3 className="card-title">Email Clients</h3>
              <div className="email-clients">
                <div className="email-clients-header">
                  <div className="client-column">Clients</div>
                  <div className="percentage-column">Subscribers</div>
                </div>
                {Object.entries(stats.metadata.emailClients).map(([client, percentage], index) => (
                  <div className="email-client-row" key={index}>
                    <div className="client-name">{client}</div>
                    <div className="client-percentage">{percentage}%</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Workflow Stats */}
          <Card className="workflow-stats-card">
            <div className="card-header">
              <h3 className="card-title">Workflow Stats</h3>
              <div className="time-filter">
                <ButtonGroup 
                  options={timeFilterOptions} 
                  value={statsTimeFilter}
                  onChange={(value) => setStatsTimeFilter(value)}
                />
              </div>
            </div>
            
            <DataTable 
              value={paginatedWorkflowStats} 
              className="workflow-stats-table"
              responsive
              selection={selectedStats}
              onSelectionChange={e => setSelectedStats(e.value)}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }} body={selectionTemplate} />
              <Column field="month" header="Month" />
              <Column field="emailsSent" header="Emails Sent" />
              <Column header="Opened" body={(rowData) => `${rowData.opened} | ${rowData.openedPercent}%`} />
              <Column header="Clicked" body={(rowData) => `${rowData.clicked} | ${rowData.clickedPercent}%`} />
              <Column header="Unsubscribed" body={(rowData) => `${rowData.unsubscribed} | ${rowData.unsubscribedPercent}%`} />
              <Column header="Spams" body={(rowData) => `${rowData.spams} | ${rowData.spamsPercent}%`} />
            </DataTable>
            
            <div className="pagination-container">
              <Pagination 
                currentPage={currentStatsPage}
                totalResults={workflowStats.length}
                resultsPerPage={statsPerPage}
                onChange={setCurrentStatsPage}
              />
            </div>
          </Card>

          {/* Workflow Emails */}
          <Card className="workflow-emails-card">
            <h3 className="card-title">Workflow Emails</h3>
            <DataTable 
              value={paginatedWorkflowEmails} 
              className="workflow-emails-table"
              responsive
              selection={selectedEmails}
              onSelectionChange={e => setSelectedEmails(e.value)}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }} body={emailSelectionTemplate} />
              <Column header="Name" body={(rowData) => (
                <div className="campaign-row">
                  <div className="campaign-preview">
                    <img src="https://via.placeholder.com/50" alt="Campaign preview" />
                  </div>
                  <div className="campaign-info">
                    <div className="campaign-name">{rowData.name}</div>
                    <div className="campaign-subject">Subject goes here...</div>
                  </div>
                </div>
              )} />
              <Column field="recipients" header="Recipients" />
              <Column header="Opens" body={(rowData) => `${rowData.opens}% | ${rowData.opensTotal}`} />
              <Column header="Clicks" body={(rowData) => `${rowData.clicks}% | ${rowData.clicksTotal}`} />
              <Column field="type" header="Type" />
              <Column field="date" header="Date" />
              <Column header="Status" body={statusTemplate} />
              <Column header="Actions" body={actionsTemplate} />
            </DataTable>
            
            <div className="pagination-container">
              <Pagination 
                currentPage={currentEmailsPage}
                totalResults={workflowEmails.length}
                resultsPerPage={emailsPerPage}
                onChange={setCurrentEmailsPage}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default AutomationOverview