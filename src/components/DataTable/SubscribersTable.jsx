import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'
import PopupText from '../PopupText/PopupText'
import { ApiService } from '../../service/api-service'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import qs from 'qs'

// const SubscribersTable = ({ subscribers, resultsPerPage = 10, onUpdate }) => {
const SubscribersTable = ({ subscriberSearchValue, subscribersQueryFilter, onUpdate, setView, setTotalSubs }) => {
	const navigate = useNavigate()
	const { user } = useAccount()

	const [loading, setLoading] = useState(false)
	const [subscribers, setSubscribers] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 10

	const [selectedSubscribers, setSelectedSubscribers] = useState([])
	const rowsPerPage = resultsPerPage

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	const dropdownOptions = [{ value: 'delete_sub', label: 'Delete' }]

	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/${uuid}`)
	}

	const getSubscribers = async (page = 1, filterString = '') => {
		setLoading(true)
		const query = {
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
		console.log('filter from getSubscribers', filterString)
		console.log('filter from getSubscribers', qs.stringify(filterString, { encode: false }))
		// delete filterString.filters.createdAt
		const queryString = filterString ? qs.stringify(filterString, { encode: false }) : qs.stringify(query, { encode: false })

		console.log('queryString from getSubscribers', queryString)

		try {
			// const resp = await ApiService.get(
			// 	`fairymailer/getSubscribers?sort[0]=createdAt:desc&filters[email][$contains]=${subscriberSearchValue}&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1`,
			// 	user.jwt
			// )
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
				console.log('Confirmed with input:', result)
				const deleteSubscriberResponse = await ApiService.post(`fairymailer/removeSubscriber`, { data: rowData }, user.jwt)
				if (deleteSubscriberResponse) {
					onUpdate()
				}
			}
		})
	}

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue.value) {
			case 'edit_sub':
				console.log('Overview action triggered')
				break
			case 'delete_sub':
				console.log('Edit action triggered')
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
			console.log('useEffect running', subscribersQueryFilter)
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
		return dayjs(rowData.createdAt).tz('Europe/Athens').format('DD-MM-YYYY HH:mm')
	}

	return (
		// <div>
		<>
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
									checked={selectedSubscribers.some((subscribers) => subscribers.name === rowData.name)}
									onChange={(e) => {
										if (e) {
											setSelectedSubscribers((prev) => [...prev, rowData])
										} else {
											setSelectedSubscribers((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
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
			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default SubscribersTable
