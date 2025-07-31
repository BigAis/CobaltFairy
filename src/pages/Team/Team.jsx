import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import { getRoleLabel } from './userRoles'
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
	const [users, setUsers] = useState([])
	const [allUsers, setAllUsers] = useState([]) // Store original data for search
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedUsers, setSelectedUsers] = useState([])
	const [error, setError] = useState(null)
	const resultsPerPage = 10

	const fetchTeamMembers = async () => {
		try {
			setLoading(true)
			setError(null)

			if (!user || !user.jwt) {
				throw new Error('No valid session found')
			}

			const response = await ApiService.get('fairymailer/team-members', user.jwt)

			if (response.data.code === 200) {
				// Map the API response to match the expected format
				const mappedUsers = response.data.data.map((member) => ({
					id: member.uuid,
					name: member.fullName,
					username: member.username,
					role: member.role, // Keep role in lowercase
					email: member.email,
					confirmed: member.confirmed,
					blocked: member.blocked,
				}))

				setUsers(mappedUsers)
				setAllUsers(mappedUsers) // Store original data for search
				setTotalResults(mappedUsers.length)
			} else {
				throw new Error('Failed to fetch team members')
			}
		} catch (error) {
			console.error('Error fetching team members:', error)
			setError('Failed to load team members. Please try again.')
			createNotification({
				message: 'Failed to load team members. Please try again.',
				type: 'error',
				autoClose: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchTeamMembers()
	}, [])

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	// Calculate which users to display on current page
	const getCurrentPageUsers = () => {
		const startIndex = (currentPage - 1) * resultsPerPage
		const endIndex = startIndex + resultsPerPage
		return users.slice(startIndex, endIndex)
	}

	const handleSearch = (term) => {
		setSearchTerm(term)
		setCurrentPage(1)
		// Filter users based on search term
		if (term.trim() === '') {
			setUsers(allUsers)
			setTotalResults(allUsers.length)
		} else {
			const filteredUsers = allUsers.filter(
				(user) => user.name.toLowerCase().includes(term.toLowerCase()) || user.username.toLowerCase().includes(term.toLowerCase()) || user.email.toLowerCase().includes(term.toLowerCase())
			)
			setUsers(filteredUsers)
			setTotalResults(filteredUsers.length)
		}
	}

	const handleAddUser = () => {
		navigate('/team/new')
	}

	const dropdownOptions = [
		{ value: 'edit_user', label: 'Edit' },
		{ value: 'delete_user', label: 'Delete' },
	]

	const handleActionSelect = (selectedValue, rowData) => {
		switch (selectedValue.value) {
			case 'edit_user':
				navigate(`/team/${rowData.id}`)
				break
			case 'delete_user':
				// Show confirmation dialog
				createNotification({
					message: `User ${rowData.name} has been deleted successfully.`,
					type: 'default',
					autoClose: 3000,
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
					<div className="page-name">Users</div>
					<Button icon={'Plus'} type="action" onClick={handleAddUser}>
						New User
					</Button>
				</div>

				<div className="filters-container">
					<div className="row" style={{ marginBottom: '1rem' }}></div>
					<div className="row d-flex content-space-between">
						<SearchBar placeholder="Search Team Members" label="Search Team Members" initialValue={searchTerm} onSearch={handleSearch} style={{ width: '100%' }} />
					</div>
				</div>

				{loading ? (
					<Card>
						<div style={{ padding: '20px', textAlign: 'center' }}>Loading team members...</div>
					</Card>
				) : error ? (
					<Card>
						<div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
							{error}
							<br />
							<Button type="action" onClick={fetchTeamMembers} style={{ marginTop: '10px' }}>
								Retry
							</Button>
						</div>
					</Card>
				) : (
					<>
						<DataTable
							value={getCurrentPageUsers()}
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
								header={() => {
									const currentPageUsers = getCurrentPageUsers()
									return (
										<Checkbox
											checked={currentPageUsers.length > 0 && currentPageUsers.every((user) => selectedUsers.some((selected) => selected.id === user.id))}
											onChange={(e) => {
												if (e) {
													// Add all current page users to selection
													const newSelections = [...selectedUsers]
													currentPageUsers.forEach((user) => {
														if (!newSelections.some((selected) => selected.id === user.id)) {
															newSelections.push(user)
														}
													})
													setSelectedUsers(newSelections)
												} else {
													// Remove all current page users from selection
													setSelectedUsers(selectedUsers.filter((selected) => !currentPageUsers.some((user) => user.id === selected.id)))
												}
											}}
										/>
									)
								}}
								headerStyle={{ width: '80px' }}
							/>
							<Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
							<Column field="username" header="Username" body={(rowData) => (loading ? <Skeleton /> : rowData.username)} />
							<Column field="role" header="Role" body={(rowData) => (loading ? <Skeleton /> : getRoleLabel(rowData.role))} />
							<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
						</DataTable>
						<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
					</>
				)}
			</div>
		</div>
	)
}

export default Team
