import React, { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Dropdown from '../../components/Dropdown'
import Checkbox from '../../components/Checkbox'
import { useAccount } from '../../context/AccountContext'
import { useNavigate } from 'react-router-dom'

const AutomationSubscribers = ({ automation }) => {
  const { user } = useAccount()
  const navigate = useNavigate()
  const [subscribers, setSubscribers] = useState([])
  const [selectedSubscribers, setSelectedSubscribers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Mock data for subscribers
  useEffect(() => {
    setLoading(true)
    
    // Create mock subscribers data that matches the image
    const mockSubscribers = Array(6).fill(0).map((_, index) => ({
      id: index + 1,
      firstName: 'Alice',
      lastName: 'Jones',
      email: 'alicenack@aol.com',
      emailsSent: 5,
      emailOpens: 1,
      emailClicks: 5,
      subscribed: '2024-04-17'
    }))
    
    setSubscribers(mockSubscribers)
    setLoading(false)
  }, [automation])

  // Action dropdown options
  const dropdownOptions = [
    { value: 'remove', label: 'Remove' },
    { value: 'resend', label: 'Resend Em' }
  ]

  // Checkbox template for rows
  const rowCheckboxTemplate = (rowData) => (
    <Checkbox 
      checked={selectedSubscribers.some(sub => sub.id === rowData.id)}
      onChange={(checked) => {
        if (checked) {
          setSelectedSubscribers([...selectedSubscribers, rowData])
        } else {
          setSelectedSubscribers(selectedSubscribers.filter(sub => sub.id !== rowData.id))
        }
      }}
    />
  )
  
  // Header checkbox template for "select all"
  const headerCheckboxTemplate = () => (
    <Checkbox 
      checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
      onChange={(checked) => {
        if (checked) {
          setSelectedSubscribers([...subscribers])
        } else {
          setSelectedSubscribers([])
        }
      }}
    />
  )

  // Actions template
  const actionsTemplate = (rowData) => {
    return (
      <div>
        <Dropdown 
          withDivider={true}
          options={dropdownOptions} 
          onLeftClick={() => {
            console.log('Edit subscriber:', rowData);
          }} 
          onOptionSelect={(selectedOption) => {
            console.log(`Selected ${selectedOption.label} for subscriber:`, rowData);
          }}
        >
          Edit
        </Dropdown>
      </div>
    )
  }

  const queuedOptions = [
    { value: 'queued', label: 'Queued' },
    { value: 'all', label: 'All' },
    { value: 'processed', label: 'Processed' }
  ]

  return (
    <div className="automation-subscribers">
      {/* Filter controls at the top */}
      <div className="subscribers-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Dropdown
          options={queuedOptions}
          selectedValue={queuedOptions[0]}
          style={{ width: '150px' }}
        >
          Queued
        </Dropdown>
      </div>
      
      {/* Subscribers table */}
      <DataTable 
        value={subscribers} 
        className="subscribers-table"
        selection={selectedSubscribers}
        onSelectionChange={(e) => setSelectedSubscribers(e.value)}
        dataKey="id"
        loading={loading}
      >
        <Column
          body={rowCheckboxTemplate}
          header={headerCheckboxTemplate}
          headerStyle={{ width: '3em' }}
        />
        <Column field="firstName" header="First Name" />
        <Column field="lastName" header="Last Name" />
        <Column field="email" header="Email" />
        <Column field="emailsSent" header="Email Sent" />
        <Column field="emailOpens" header="Email Opens" />
        <Column field="emailClicks" header="Email Clicks" />
        <Column field="subscribed" header="Subscribed" />
        <Column body={actionsTemplate} header="Actions" style={{ width: '150px' }} />
      </DataTable>
    </div>
  )
}

export default AutomationSubscribers