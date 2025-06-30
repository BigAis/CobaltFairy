import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import Card from '../../components/Card'
import SearchBar from '../../components/SearchBar/SearchBar'
import Pagination from '../../components/Pagination'
import Dropdown from '../../components/Dropdown'
import Checkbox from '../../components/Checkbox'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Skeleton } from 'primereact/skeleton'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './Team.scss'

const Team = () => {
  const navigate = useNavigate()
  const { user, account, createNotification } = useAccount()
  
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', username: 'alice89', role: 'Admin' },
    { id: 2, name: 'Bob', username: 'bob123', role: 'Author' },
    { id: 3, name: 'Charlie', username: 'charlie456', role: 'Manager' },
    { id: 4, name: 'Diana', username: 'diana789', role: 'Viewer' },
    { id: 5, name: 'Evan', username: 'evan101', role: 'Author' }
  ])
  const [totalResults, setTotalResults] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const resultsPerPage = 10

  useEffect(() => {
    // Fetch users data
    // This would be replaced with an actual API call
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // In a real implementation, this would trigger a new API call
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
    // In a real implementation, this would trigger a filtered API call
  }

  const handleAddUser = () => {
    navigate('/team/new')
  }

  const dropdownOptions = [
    { value: 'edit_user', label: 'Edit' },
    { value: 'change_role', label: 'Change Role' },
    { value: 'delete_user', label: 'Delete' }
  ]

  const handleActionSelect = (selectedValue, rowData) => {
    switch (selectedValue.value) {
      case 'edit_user':
        navigate(`/team/${rowData.id}`)
        break
      case 'change_role':
        navigate(`/team/${rowData.id}/role`)
        break
      case 'delete_user':
        // Show confirmation dialog
        createNotification({
          message: `User ${rowData.name} has been deleted successfully.`,
          type: 'default',
          autoClose: 3000
        })
        break
      default:
        console.log('No action found for:', selectedValue)
    }
  }

  const actionsBodyTemplate = (rowData) => {
    return (
      <div>
        <Dropdown
          withDivider={true}
          icon={'Plus'}
          options={dropdownOptions}
          onLeftClick={() => navigate(`/team/${rowData.id}`)}
          onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, rowData)}
        >
          Edit
        </Dropdown>
      </div>
    )
  }

  return (
    <div className="fm-page-wrapper">
      <Sidemenu />
      <div className="fm-page-container">
        <PageHeader user={user} account={account} />
        <div className="page-name-container">
          <div className="page-name">Team Members</div>
          <Button icon={'Plus'} type="action" onClick={handleAddUser}>
            New User
          </Button>
        </div>

        <div className="filters-container">
          <div className="row" style={{ marginBottom: '1rem' }}></div>
          <div className="row d-flex content-space-between">
            <SearchBar
              placeholder="Search Team Members"
              label="Search Team Members"
              initialValue={searchTerm}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {loading ? (
          <Card>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading team members...
            </div>
          </Card>
        ) : (
          <>
            <DataTable
              value={users}
              paginator={false}
              selection={selectedUsers}
              onSelectionChange={(e) => setSelectedUsers(e.value)}
              dataKey="id"
              rowClassName={() => 'p-table-row'}
              emptyMessage="No team members found"
            >
              <Column
                body={(rowData) => (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
                      <Checkbox
                        checked={selectedUsers.some((user) => user.id === rowData.id)}
                        onChange={(e) => {
                          if (e) {
                            setSelectedUsers((prev) => [...prev, rowData])
                          } else {
                            setSelectedUsers((prev) => prev.filter((user) => user.id !== rowData.id))
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                header={() => (
                  <Checkbox
                    checked={selectedUsers.length === users.length && selectedUsers.length > 0}
                    onChange={(e) => {
                      if (e) {
                        setSelectedUsers([...users])
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                  />
                )}
                headerStyle={{ width: '80px' }}
              />
              <Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
              <Column field="username" header="Username" body={(rowData) => (loading ? <Skeleton /> : rowData.username)} />
              <Column field="role" header="Role" body={(rowData) => (loading ? <Skeleton /> : rowData.role)} />
              <Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
            </DataTable>
            <Pagination
              currentPage={currentPage}
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Team