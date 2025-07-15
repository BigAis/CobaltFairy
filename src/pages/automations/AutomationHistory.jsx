import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Pagination from '../../components/Pagination'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const AutomationHistory = ({ automation }) => {
  const { user } = useAccount()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10
  
  useEffect(() => {
    const loadHistory = async () => {
      if (!automation || !automation.id) return

      try {
        setLoading(true)
        
        // In a real implementation, you would fetch actual history from the API
        // For now, we'll create placeholder data that matches the Figma design
        const mockHistory = [
          { id: 1, action: 'Activated', date: '2024-10-16' },
          { id: 2, action: 'Stopped', date: '2024-10-16' },
          { id: 3, action: 'Stopped', date: '2024-10-16' },
          { id: 4, action: 'Activated', date: '2024-10-15' },
          { id: 5, action: 'Stopped', date: '2024-10-15' },
          { id: 6, action: 'Activated', date: '2024-10-14' },
          { id: 7, action: 'Stopped', date: '2024-10-14' },
          { id: 8, action: 'Activated', date: '2024-10-14' },
          { id: 9, action: 'Activated', date: '2024-10-14' },
          { id: 10, action: 'Stopped', date: '2024-10-14' },
          { id: 11, action: 'Activated', date: '2024-10-14' },
          { id: 12, action: 'Stopped', date: '2024-10-14' },
        ]

        setHistory(mockHistory)
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [automation])

  // Calculate paginated data
  const paginatedHistory = history.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  // Action template with styled indicator
  const actionTemplate = (rowData) => {
    const actionClass = rowData.action === 'Activated' 
      ? 'action-activated' 
      : rowData.action === 'Stopped' 
        ? 'action-stopped' 
        : 'action-other';
    
    return (
      <div className={`action-badge ${actionClass}`}>
        {rowData.action}
      </div>
    )
  }

  return (
    <div className="automation-history">
      {loading ? (
        <Card>
          <Skeleton height={300} />
        </Card>
      ) : (
        <Card className="history-card">
          <div className="history-table-container">
            <div className="history-header">
              <div className="action-column">Action</div>
              <div className="date-column">Date</div>
            </div>
            
            {paginatedHistory.map((item, index) => (
              <div className="history-row" key={index}>
                <div className="action-column">
                  <div className={`action-badge ${item.action === 'Activated' ? 'action-activated' : 'action-stopped'}`}>
                    {item.action}
                  </div>
                </div>
                <div className="date-column">{item.date}</div>
              </div>
            ))}
          </div>
          
          {history.length === 0 ? (
            <div className="no-history">
              <p>No history records found for this automation.</p>
            </div>
          ) : (
            <div className="pagination-container">
              <Pagination 
                currentPage={currentPage}
                totalResults={history.length}
                resultsPerPage={entriesPerPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default AutomationHistory