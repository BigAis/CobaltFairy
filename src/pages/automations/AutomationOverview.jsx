import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Stat from '../../components/Stat/Stat'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import Pagination from '../../components/Pagination'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import WorkflowStatsTable from '../../components/DataTable/WorkflowStatsTable'
import WorkflowEmailsTable from '../../components/DataTable/WorkflowEmailsTable'

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
  const [currentEmailClientsPage, setCurrentEmailClientsPage] = useState(1)
  const statsPerPage = 5
  const emailsPerPage = 5
  const emailClientsPerPage = 2

  useEffect(() => {
    const loadAutomationStats = async () => {
      if (!automation || !automation.id) return

      try {
        setLoading(true)
        // In a real implementation, you would fetch actual stats data from the API
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
            emailClients: [
              { client: 'Gmail', percentage: 41 },
              { client: 'Yahoo', percentage: 41 },
              { client: 'Outlook', percentage: 18 },
              { client: 'Apple Mail', percentage: 25 },
              { client: 'Thunderbird', percentage: 12 },
              { client: 'Hotmail', percentage: 8 },
              { client: 'ProtonMail', percentage: 5 },
              { client: 'Other', percentage: 15 }
            ]
          }
        }

        // Mock workflow stats - matching format in screenshot
        const mockWorkflowStats = [
          { id: 1, month: '2024 December', emailsSent: 3762, opened: 18, openedPercent: 17, clicked: 23, clickedPercent: 10, unsubscribed: 6, unsubscribedPercent: 4, spams: 15, spamsPercent: 2 },
          { id: 2, month: '2024 November', emailsSent: 1698, opened: 4, openedPercent: 17, clicked: 4, clickedPercent: 9, unsubscribed: 3, unsubscribedPercent: 5, spams: 19, spamsPercent: 1 },
          { id: 3, month: '2024 October', emailsSent: 3992, opened: 5, openedPercent: 29, clicked: 35, clickedPercent: 5, unsubscribed: 27, unsubscribedPercent: 3, spams: 1, spamsPercent: 1 },
          { id: 4, month: '2024 September', emailsSent: 2044, opened: 7, openedPercent: 34, clicked: 34, clickedPercent: 9, unsubscribed: 18, unsubscribedPercent: 1, spams: 19, spamsPercent: 3 },
          { id: 5, month: '2024 August', emailsSent: 2976, opened: 84, openedPercent: 12, clicked: 15, clickedPercent: 3, unsubscribed: 12, unsubscribedPercent: 2, spams: 16, spamsPercent: 2 }
        ];

        // Mock workflow emails - matching format in screenshot
        const mockWorkflowEmails = [
          { id: 1, name: 'Campaign Name 1', subject: 'Subject goes here... 1', recipients: 158, opens: 18, opensTotal: 200, clicks: 3, clicksTotal: 5, type: 'Normal', date: '2024-04-17', active: true, previewImage: "/images/campaign-preview.png" },
          { id: 2, name: 'Campaign Name 2', subject: 'Subject goes here... 2', recipients: 158, opens: 18, opensTotal: 200, clicks: 3, clicksTotal: 5, type: 'Normal', date: '2024-04-17', active: false, previewImage: "/images/campaign-preview.png" },
          { id: 3, name: 'Campaign Name 3', subject: 'Subject goes here... 3', recipients: 158, opens: 18, opensTotal: 200, clicks: 3, clicksTotal: 5, type: 'Normal', date: '2024-04-17', active: false, previewImage: "/images/campaign-preview.png" },
          { id: 4, name: 'Campaign Name 4', subject: 'Subject goes here... 4', recipients: 158, opens: 18, opensTotal: 200, clicks: 3, clicksTotal: 5, type: 'Normal', date: '2024-04-17', active: true, previewImage: "/images/campaign-preview.png" },
          { id: 5, name: 'Campaign Name 5', subject: 'Subject goes here... 5', recipients: 158, opens: 18, opensTotal: 200, clicks: 3, clicksTotal: 5, type: 'Normal', date: '2024-04-17', active: true, previewImage: "/images/campaign-preview.png" }
        ];

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

  // Function to update email status
  const updateEmailStatus = (emailId, newStatus) => {
    setWorkflowEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === emailId ? {...email, active: newStatus} : email
      )
    );
  };

  // Calculate paginated data
  const paginatedWorkflowStats = workflowStats.slice(
    (currentStatsPage - 1) * statsPerPage,
    currentStatsPage * statsPerPage
  )

  const paginatedWorkflowEmails = workflowEmails.slice(
    (currentEmailsPage - 1) * emailsPerPage,
    currentEmailsPage * emailsPerPage
  )

  const paginatedEmailClients = stats?.metadata?.emailClients?.slice(
    (currentEmailClientsPage - 1) * emailClientsPerPage,
    currentEmailClientsPage * emailClientsPerPage
  ) || []

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

  return (
    <div className="automation-overview">
      {loading ? (
        <>
          <div className="stats-grid-top">
            {[1, 2].map(i => (
              <Card key={i} className="stat-card">
                <Skeleton height={80} />
              </Card>
            ))}
          </div>
          <div className="stats-grid-middle">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="stat-card">
                <Skeleton height={80} />
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Stats Grid - First row: 2 cards */}
          <div className="stats-grid-top">
            <Card className="stat-card">
              <div className="stat-label">Completed subscribers</div>
              <div className="stat-value">{stats.subscriberStats.completed}</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-label">Subscribers in the queue</div>
              <div className="stat-value">{stats.subscriberStats.queued}</div>
            </Card>
          </div>

          {/* Stats Grid - Second row: 4 cards */}
          <div className="stats-grid-middle">
            <Card className="stat-card">
              <div className="stat-label">Avg open rate</div>
              <div className="stat-value">{stats.subscriberStats.openRate}%</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-label">Avg click rate</div>
              <div className="stat-value">{stats.subscriberStats.clickRate}%</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-label">Avg new subscribers</div>
              <div className="stat-value">{stats.subscriberStats.newSubscribers}</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-label">Avg Subscribers</div>
              <div className="stat-value">{stats.subscriberStats.avgSubscribers}</div>
            </Card>
          </div>

          {/* Device Type and Email Clients */}
          <div className="charts-row">
            <Card className="chart-card">
              <h3 className="card-title">Device Type</h3>
              <div className="chart-container">
                <DoughnutChart stats={stats} />
              </div>
              <div className="legend"></div>
            </Card>

            <Card className="chart-card">
              <h3 className="card-title">Email Clients</h3>
              <div className="email-clients-header">
                <div className="client-column">Clients</div>
                <div className="percentage-column">Subscribers</div>
              </div>
              {paginatedEmailClients.map((emailClient, index) => (
                <Card key={index} className="email-client-card">
                  <div className="email-client-row">
                    <div className="client-name">{emailClient.client}</div>
                    <div className="client-percentage">{emailClient.percentage}%</div>
                  </div>
                </Card>
              ))}
              <div className="pagination-container">
                <Pagination 
                  currentPage={currentEmailClientsPage}
                  totalResults={stats?.metadata?.emailClients?.length || 0}
                  resultsPerPage={emailClientsPerPage}
                  onChange={setCurrentEmailClientsPage}
                />
              </div>
            </Card>
          </div>

          {/* Workflow Stats Table */}
          <WorkflowStatsTable 
            stats={paginatedWorkflowStats}
            selectedStats={selectedStats}
            setSelectedStats={setSelectedStats}
            timeFilterOptions={timeFilterOptions}
            statsTimeFilter={statsTimeFilter}
            setStatsTimeFilter={setStatsTimeFilter}
            currentPage={currentStatsPage}
            itemsPerPage={statsPerPage}
            totalItems={workflowStats.length}
            onPageChange={setCurrentStatsPage}
          />

          {/* Workflow Emails Table */}
          <WorkflowEmailsTable 
            emails={paginatedWorkflowEmails}
            selectedEmails={selectedEmails}
            setSelectedEmails={setSelectedEmails}
            updateEmailStatus={updateEmailStatus}
            currentPage={currentEmailsPage}
            itemsPerPage={emailsPerPage}
            totalItems={workflowEmails.length}
            onPageChange={setCurrentEmailsPage}
          />
        </>
      )}

      <style jsx>{`
        .automation-overview {
          width: 100%;
        }
        
        .stats-grid-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stats-grid-middle {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          padding: 20px;
        }
        
        .stat-label {
          color: #887D76;
          font-size: 14px;
          margin-bottom: 10px;
          text-align: left;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          font-family: 'Bitter', serif;
        }
        
        @media (max-width: 768px) {
          .stats-grid-top {
            grid-template-columns: 1fr;
          }
          
          .stats-grid-middle {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid-middle {
            grid-template-columns: 1fr;
          }
        }
        
        .charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        @media (max-width: 768px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
        }
        
        .chart-card {
          background: #FFF;
          padding: 20px;
          border-radius: 8px;
        }
        
        .card-title {
          font-family: 'Bitter', serif;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #333;
          text-align: left;
        }
        
        .chart-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 250px;
        }
        
        .legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
        }
        
        .legend-color {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 6px;
        }
        
        .legend-color.desktop {
          background-color: #3F51B5;
        }
        
        .legend-color.mobile {
          background-color: #03A9F4;
        }
        
        .legend-color.tablet {
          background-color: #4CDBAF;
        }
        
        .legend-label {
          font-size: 14px;
        }
        
        .email-clients-header {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-weight: 500;
          color: #887D76;
          border-bottom: 1px solid rgba(218, 209, 197, 0.5);
          margin-bottom: 10px;
        }
        
        .email-client-card {
          margin-bottom: 10px;
          padding: 15px;
        }
        
        .email-client-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .client-name {
          font-size: 16px;
          font-weight: 500;
        }
        
        .client-percentage {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  )
}

export default AutomationOverview