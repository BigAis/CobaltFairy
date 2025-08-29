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
import Button from '../Button'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import qs from 'qs'

// Accept selectedSubscribers and setSelectedSubscribers as props for managing selection state from parent component
const SubscribersTable = ({ 
  subscriberSearchValue, 
  subscribersQueryFilter, 
  onUpdate, 
  setView, 
  setTotalSubs,
  selectedSubscribers,
  setSelectedSubscribers 
}) => {
	const navigate = useNavigate()
	const { user } = useAccount()

	const [loading, setLoading] = useState(false)
	const [subscribers, setSubscribers] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 10

	// State to track expanded subscriber cards
	const [expandedSubscribers, setExpandedSubscribers] = useState({})

	const rowsPerPage = resultsPerPage

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	const dropdownOptions = [{ value: 'delete_sub', label: 'Delete' }]

	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/${uuid}`)
	}

	const getSubscribers = async (page = 1, filterObject = null) => {
		setLoading(true)
		let query = {
			filters: {
				email: {
					$contains: subscriberSearchValue,
				},
			},
			sort: ['createdAt:desc'],
			pagination: {
				pageSize: resultsPerPage,
				page,
			},
		}

		if (filterObject) {
			query = {
				...filterObject,
				pagination: {
					pageSize: resultsPerPage,
					page,
				},
			}
		}

		const queryString = qs.stringify(query, { encode: false })

		try {
			const resp = await ApiService.get(`fairymailer/getSubscribers?${queryString}&populate[groups][count]=1`, user.jwt)

			if (resp.data && resp.data.data) {
				setSubscribers(resp.data.data)
				setTotalResults(resp.data.meta.pagination.total)
			}
			setCurrentPage(page)
		} catch (error) {
			console.error('Error fetching subscribers:', error)
		} finally {
			setLoading(false)
		}
	}

	const deleteSubscriber = async (rowData) => {
		PopupText.fire({
			text: `Do you really want to remove subscriber ${rowData.email}? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				const deleteSubscriberResponse = await ApiService.post(`fairymailer/removeSubscriber`, { data: rowData }, user.jwt)
				if (deleteSubscriberResponse) {
					onUpdate()
				}
			}
		})
	}

	const handleActionSelect = (selectedValue, rowData) => {
		switch (selectedValue.value) {
			case 'delete_sub':
				deleteSubscriber(rowData)
				break
			default:
				console.log('No action found for:', selectedValue)
		}
	}

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = subscribers.slice(startIndex, endIndex)

	useEffect(() => {
		if (user) {
			getSubscribers(currentPage, subscribersQueryFilter)
		}
	}, [currentPage, user, subscriberSearchValue, subscribersQueryFilter])

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

	const dateBodyTemplate = (rowData) => {
		return dayjs(rowData.createdAt).format('YYYY-MM-DD')
	}

	// Check if a subscriber is selected
	const isSubscriberSelected = (subscriber) => {
		return selectedSubscribers.some((sub) => sub.udid === subscriber.udid);
	}

	// Toggle subscriber selection
	const toggleSelection = (subscriber) => {
		if (isSubscriberSelected(subscriber)) {
			setSelectedSubscribers(prev => prev.filter(sub => sub.udid !== subscriber.udid));
		} else {
			setSelectedSubscribers(prev => [...prev, subscriber]);
		}
	}

	// Toggle expanded/collapsed state of a subscriber card
	const toggleExpand = (subscriberId) => {
		setExpandedSubscribers(prev => ({
			...prev,
			[subscriberId]: !prev[subscriberId]
		}));
	}

	return (
		<>
			{/* Desktop Table View */}
			<div className="desktop-view">
				<DataTable
					value={subscribers}
					paginator={false}
					selection={selectedSubscribers}
					onSelectionChange={(e) => setSelectedSubscribers(e.value)}
					dataKey="udid"
					rowClassName={() => 'p-table-row'}
				>
					<Column
						body={(rowData) => (
							<div style={{ position: 'relative' }}>
								{/* Checkbox in the Top-Left Corner */}
								<div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
									<Checkbox
										checked={isSubscriberSelected(rowData)}
										onChange={(e) => {
											if (e) {
												setSelectedSubscribers((prev) => [...prev, rowData])
											} else {
												setSelectedSubscribers((prev) => prev.filter((sub) => sub.udid !== rowData.udid))
											}
										}}
									/>
								</div>
							</div>
						)}
						header={() => (
							<Checkbox
								checked={selectedSubscribers.length === paginatedData.length && selectedSubscribers.length > 0}
								onChange={(e) => {
									if (e) {
										setSelectedSubscribers([...paginatedData])
									} else {
										setSelectedSubscribers([])
									}
								}}
							/>
						)}
						headerStyle={{ width: '80px' }}
					/>
					<Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
					<Column field="email" header="Email" body={(rowData) => (loading ? <Skeleton /> : rowData.email)} />
					<Column field="createdAt" body={(rowData) => (loading ? <Skeleton /> : dateBodyTemplate(rowData))} header="Subscribed" />
					<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
				</DataTable>
			</div>

			{/* Mobile View */}
			<div className="mobile-view">
				{subscribers.map((subscriber) => (
					<div 
						key={subscriber.udid} 
						className={`subscriber-card ${expandedSubscribers[subscriber.udid] ? 'expanded' : 'collapsed'}`}
					>
						{/* Collapsed View */}
						<div className="subscriber-header" onClick={() => toggleExpand(subscriber.udid)}>
							<div className="subscriber-info">
								<h3 className="subscriber-name">{subscriber.name || "Unnamed Subscriber"}</h3>
								<p className="subscriber-email">{subscriber.email}</p>
							</div>
							<div className="dropdown-arrow">
								{expandedSubscribers[subscriber.udid] ? "▲" : "▼"}
							</div>
						</div>
						
						{/* Expanded View */}
						{expandedSubscribers[subscriber.udid] && (
							<div className="subscriber-details">
								<div className="stat-row">
									<div className="stat-label">Email Sent</div>
									<div className="stat-value">5</div>
								</div>
								<div className="stat-row">
									<div className="stat-label">Email Opens</div>
									<div className="stat-value">1</div>
								</div>
								<div className="stat-row">
									<div className="stat-label">Email Clicks</div>
									<div className="stat-value">5</div>
								</div>
								<div className="stat-row">
									<div className="stat-label">Subscribed</div>
									<div className="stat-value">{dateBodyTemplate(subscriber)}</div>
								</div>
								
								<div className="edit-button-wrapper">
									<Dropdown
										withDivider={true}
										icon={'Plus'}
										options={dropdownOptions}
										onLeftClick={() => handleLeftClick(subscriber.udid)}
										onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, subscriber)}
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

export default SubscribersTable