import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import SearchBar from '../../components/SearchBar/SearchBar'
import Dropdown from '../../components/Dropdown'
import Checkbox from '../../components/Checkbox'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Pagination from '../../components/Pagination'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const AutomationSubscribers = ({ automation }) => {
  const { user } = useAccount()
  const [loading, setLoading] = useState(true)
  const [subscribers, setSubscribers] = useState([])
  const [filteredSubscribers, setFilteredSubscribers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedSubscribers, setSelectedSubscribers] = useState([])
  const subscribersPerPage = 10
  
  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'queued', label: 'Queued' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'errored', label: 'Errored' }
  ]

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!automation || !automation.id) return

      try {
        setLoading(true)
        
        // In a real implementation, you would fetch actual subscribers from the API
        // For now, we'll create some placeholder data
        const mockSubscribers = Array(30).fill(0).map((_, index) => ({
          id: index + 1,
          firstName: 'Alice',
          lastName: 'Jones',
          email: `alicenack@aol.com`,
          emailsSent: 5,
          emailOpens: 1,
          emailClicks: 5,
          subscribed: '2024-04-17',
          status: index % 4 === 0 ? 'queued' : index % 4 === 1 ? 'processing' : index % 4 === 2 ? 'completed' : 'errored'
        }))

        setSubscribers(mockSubscribers)
        setFilteredSubscribers(mockSubscribers)
      } catch (error) {
        console.error('Error loading subscribers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscribers()
  }, [automation])

  // Filter subscribers based on search term and filter option
  useEffect(() => {
    let filtered = [...subscribers]
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedFilter)
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.firstName.toLowerCase().includes(term) ||
        sub.lastName.toLowerCase().includes(term) ||
        sub.email.toLowerCase().includes(term)
      )
    }
    
    setFilteredSubscribers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, selectedFilter, subscribers])

  // Calculate paginated data
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * subscribersPerPage,
    currentPage * subscribersPerPage
  )

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  // Handle filter change
  const handleFilterChange = (option) => {
    setSelectedFilter(option.value)
  }

  // Selection template
  const selectionTemplate = (rowData) => (
    <Checkbox 
      checked={selectedSubscribers.includes(rowData.id)} 
      onChange={(checked) => {
        if (checked) {
          setSelectedSubscribers([...selectedSubscribers, rowData.id])
        } else {
          setSelectedSubscribers(selectedSubscribers.filter(id => id !== rowData.id))
        }
      }} 
    />
  )

  // Header checkbox template
  const headerCheckboxTemplate = () => (
    <Checkbox 
      checked={selectedSubscribers.length === paginatedSubscribers.length && paginatedSubscribers.length > 0}
      onChange={(checked) => {
        if (checked) {
          setSelectedSubscribers(paginatedSubscribers.map(sub => sub.id))
        } else {
          setSelectedSubscribers([])
        }
      }}
    />
  )

  // Action buttons template
  const actionsTemplate = (rowData) => {
    return (
      <div className="actions-cell">
        <Button type="secondary">Edit</Button>
        <Button type="secondary" icon="Caret" />
      </div>
    )
  }

  // Status template with colored indicator
  const statusTemplate = (rowData) => {
    return (
      <div className={`status-badge status-${rowData.status}`}>
        {rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
      </div>
    )
  }

  return (
    <div className="automation-subscribers">
      {loading ? (
        <Card>
          <Skeleton height={400} />
        </Card>
      ) : (
        <>
          {/* Filters and search */}
          <div className="subscribers-filters">
            <div className="search-container">
              <SearchBar
                placeholder="Search subscribers"
                label="Search subscribers"
                initialValue={searchTerm}
                onSearch={handleSearch}
              />
            </div>
            
            <div className="filter-container">
              <Dropdown
                options={filterOptions}
                selectedValue={filterOptions.find(opt => opt.value === selectedFilter)}
                onOptionSelect={handleFilterChange}
              >
                {filterOptions.find(opt => opt.value === selectedFilter)?.label || 'Filter'}
              </Dropdown>
            </div>
          </div>
          
          {/* Subscribers table */}
          <Card className="subscribers-table-card">
            <DataTable 
              value={paginatedSubscribers} 
              className="subscribers-table" 
              responsive
              selection={selectedSubscribers}
              onSelectionChange={e => setSelectedSubscribers(e.value)}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }} body={selectionTemplate} header={headerCheckboxTemplate} />
              <Column field="firstName" header="First Name" />
              <Column field="lastName" header="Last Name" />
              <Column field="email" header="Email" />
              <Column field="emailsSent" header="Email Sent" />
              <Column field="emailOpens" header="Email Opens" />
              <Column field="emailClicks" header="Email Clicks" />
              <Column field="subscribed" header="Subscribed" />
              <Column field="status" header="Status" body={statusTemplate} />
              <Column body={actionsTemplate} />
            </DataTable>
            
            {filteredSubscribers.length === 0 ? (
              <div className="no-results">
                <p>No subscribers found matching your criteria.</p>
                <Button type="secondary" onClick={() => {
                  setSearchTerm('')
                  setSelectedFilter('all')
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="pagination-container">
                <Pagination 
                  currentPage={currentPage}
                  totalResults={filteredSubscribers.length}
                  resultsPerPage={subscribersPerPage}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

export default AutomationSubscribers