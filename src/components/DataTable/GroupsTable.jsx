import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Skeleton } from 'primereact/skeleton'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'
import PopupText from '../PopupText/PopupText'
import { ApiService } from '../../service/api-service'

import qs from 'qs'

const GroupsTable = ({ groupSearchValue, onUpdate, setView, groups: propGroups = null, totalResults: propTotalResults = 0, loading: propLoading = false }) => {
	const navigate = useNavigate()
	const { user } = useAccount()

	const [loading, setLoading] = useState(propLoading)
	const [groups, setGroups] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 10

	const [selectedGroups, setSelectedGroups] = useState([])
	// State to track expanded group cards in mobile view
	const [expandedGroups, setExpandedGroups] = useState({})

	const rowsPerPage = resultsPerPage

	const dropdownOptions = [
		{ value: 'view_subs', label: 'Subscribers' },
		{ value: 'delete_group', label: 'Delete' },
	]

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = groups.slice(startIndex, endIndex)

	useEffect(() => {}, [selectedGroups])
	
	useEffect(() => {
		// Always use provided groups when available
		if (propGroups !== null) {
			setGroups(propGroups)
			setTotalResults(propTotalResults)
			setLoading(propLoading)
		}
	}, [propGroups, propTotalResults, propLoading])

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	// Toggle expanded/collapsed state of a group card in mobile view
	const toggleExpand = (groupId) => {
		setExpandedGroups(prev => ({
			...prev,
			[groupId]: !prev[groupId]
		}))
	}

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue.value) {
			case 'view_subs': {
				console.log('Overview action triggered')
				const groupUdidBase64 = btoa(JSON.stringify({ group_udid: rowData.udid }))
				navigate(`/subscribers/filters/${groupUdidBase64}`)
				setView('subs')
				break
			}
			case 'delete_group':
				console.log('Edit action triggered')
				deleteGroup(rowData)
				break
			default:
				console.log('No action found for:', selectedValue)
		}
	}

	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/group/${uuid}`)
	}

	const actionsBodyTemplate = (rowData) => {
		return (
			<div>
				<Dropdown
					withDivider={true}
					icon={'Plus'}
					options={dropdownOptions}
					onLeftClick={() => handleLeftClick(rowData.udid)}
					onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, rowData)}
				>
					Edit
				</Dropdown>
			</div>
		)
	}

	const deleteGroup = async (rowData) => {
		PopupText.fire({
			text: `Do you really want to remove group ${rowData.name}? `,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				const deleteResponse = await ApiService.post(`fairymailer/deleteGroupByGuid/${rowData.udid}`, { data: {} }, user.jwt)
				if (deleteResponse) {
					onUpdate()
				}
			}
		})
	}

	return (
		<>
			{/* Desktop Table View */}
			<div className="desktop-view">
				<DataTable value={groups} paginator={false} selection={selectedGroups} onSelectionChange={(e) => setSelectedGroups(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
					<Column
						body={(rowData) => (
							<div style={{ position: 'relative' }}>
								{/* Checkbox in the Top-Left Corner */}
								<div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
									<Checkbox
										checked={selectedGroups.some((subscribers) => subscribers.name === rowData.name)}
										onChange={(e) => {
											if (e) {
												setSelectedGroups((prev) => [...prev, rowData])
											} else {
												setSelectedGroups((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
											}
										}}
									/>
								</div>
							</div>
						)}
						header={() => (
							<Checkbox
								checked={selectedGroups.length === paginatedData.length && selectedGroups.length > 0}
								onChange={(e) => {
									if (e) {
										setSelectedGroups([...paginatedData])
									} else {
										setSelectedGroups([])
									}
								}}
							/>
						)}
						headerStyle={{ width: '80px' }}
					/>
					<Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
					<Column field="subscribers.count" header="Subscribers" body={(rowData) => (loading ? <Skeleton /> : rowData.subscribers?.count || 0)} />
					<Column field="open_rate" header="Opens" body={(rowData) => (loading ? <Skeleton /> : rowData.open_rate)} />
					<Column field="click_rate" header="Click" body={(rowData) => (loading ? <Skeleton /> : rowData.click_rate)} />
					<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
				</DataTable>
			</div>

			{/* Mobile View */}
			<div className="mobile-view">
				{groups.map((group) => (
					<div 
						key={group.udid || group.id} 
						className={`group-card ${expandedGroups[group.udid || group.id] ? 'expanded' : 'collapsed'}`}
					>
						{/* Collapsed View */}
						<div className="group-header" onClick={() => toggleExpand(group.udid || group.id)}>
							<div className="group-info">
								<h3 className="group-name">{group.name}</h3>
							</div>
							<div className="dropdown-arrow">
								{expandedGroups[group.udid || group.id] ? "▲" : "▼"}
							</div>
						</div>
						
						{/* Expanded View */}
						{expandedGroups[group.udid || group.id] && (
							<div className="group-details">
								<div className="stat-row">
									<div className="stat-label">Subscribers</div>
									<div className="stat-value">{group.subscribers?.count || 0}</div>
								</div>
								<div className="stat-row">
									<div className="stat-label">Opens</div>
									<div className="stat-value">{group.open_rate || '0%'}</div>
								</div>
								<div className="stat-row">
									<div className="stat-label">Clicks</div>
									<div className="stat-value">{group.click_rate || '0%'}</div>
								</div>
								
								<div className="edit-button-wrapper">
									<Dropdown
										withDivider={true}
										icon={'Plus'}
										options={dropdownOptions}
										onLeftClick={() => handleLeftClick(group.udid)}
										onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, group)}
										className="mobile-edit-dropdown"
									>
										Edit
									</Dropdown>
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
		</>
	)
}

export default GroupsTable