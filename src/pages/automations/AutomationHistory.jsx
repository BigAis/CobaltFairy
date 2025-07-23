import React, { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Card from '../../components/Card'
import { useAccount } from '../../context/AccountContext'
import Pagination from '../../components/Pagination'

const AutomationHistory = ({ automation }) => {
  const { user } = useAccount()
  const [history, setHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const entriesPerPage = 10
  const totalPages = 10 // Mock total pages
  
  // Generate mock history data
  useEffect(() => {
    setLoading(true)
    
    // Create mock history data that matches the image
    const mockHistory = [
      { id: 1, action: 'Activated', date: '2024-10-16' },
      { id: 2, action: 'Stopped', date: '2024-10-16' },
      { id: 3, action: 'Stopped', date: '2024-10-16' },
      // Add more items as needed
    ]
    
    setHistory(mockHistory)
    setLoading(false)
  }, [automation])

  // Action template with styled indicator
  const actionTemplate = (rowData) => {
    return (
      <div className={`action-badge ${rowData.action === 'Activated' ? 'action-activated' : 'action-stopped'}`}>
        {rowData.action}
      </div>
    )
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="automation-history">
      <DataTable 
        value={history} 
        className="history-table"
        loading={loading}
        responsive
      >
        <Column field="action" header="Action" body={actionTemplate} />
        <Column field="date" header="Date" style={{ textAlign: 'right' }} />
      </DataTable>
      
      {/* Simple pagination */}
      <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Pagination 
          currentPage={currentPage}
          totalResults={entriesPerPage * totalPages}
          resultsPerPage={entriesPerPage}
          onChange={handlePageChange}
        />
      </div>
      
      <style jsx>{`
        .action-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .action-activated {
          background-color: rgba(96, 199, 0, 0.2);
          color: #60C700;
        }
        
        .action-stopped {
          background-color: rgba(244, 166, 34, 0.2);
          color: #F4A622;
        }
        
        .history-table {
          border-spacing: 0;
          width: 100%;
        }
        
        .history-table .p-datatable-thead > tr > th {
          background: transparent;
          border: none;
          border-bottom: 1px solid #DAD1C5;
          padding: 10px;
          font-weight: 500;
          color: #887D76;
        }
        
        .history-table .p-datatable-tbody > tr {
          background: transparent;
          border-bottom: 1px solid rgba(218, 209, 197, 0.3);
        }
        
        .history-table .p-datatable-tbody > tr > td {
          border: none;
          padding: 15px 10px;
        }
      `}</style>
    </div>
  )
}

export default AutomationHistory