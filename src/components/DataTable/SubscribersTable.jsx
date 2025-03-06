import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
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

const SubscribersTable = ({ subscribers, resultsPerPage = 10 }) => {
	console.log('subscribers are : ', subscribers)

	const navigate = useNavigate()
	const { user } = useAccount()
	const [selectedSubscribers, setSelectedSubscribers] = useState([])

	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = resultsPerPage

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const dropdownOptions = [
		// { value: 'view_sub', label: 'Option 1' },
		// { value: 'edit_sub', label: 'Edit' },
		{ value: 'delete_sub', label: 'Delete' },
	]
	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/${uuid}`)
	}

	const deleteSubscriber = async (rowData) => {
		PopupText.fire({
			text: `Do you really want to remove subscriber ${rowData.email}? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
		}).then(async (result) => {
			if (result.isConfirmed) {
				console.log('Confirmed with input:', result)
				await ApiService.post(`fairymailer/removeSubscriber`, { data: rowData }, user.jwt)
				// if (response.data && response.data.code == 200) {
				// 	navigate('/subscribers/')
				// }
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
		console.log('selected subscribers : ', selectedSubscribers)
	}, [selectedSubscribers])

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
				value={paginatedData}
				paginator={false}
				selection={selectedSubscribers}
				onSelectionChange={(e) => setSelectedSubscribers(e.value)}
				dataKey="name"
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
				<Column field="name" header="Name" />
				<Column field="email" header="Email" />
				<Column field="createdAt" body={dateBodyTemplate} header="Subscribed" />
				<Column header="Actions" body={actionsBodyTemplate} />
			</DataTable>
			<Pagination currentPage={1} totalResults={subscribers.length} resultsPerPage={10} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default SubscribersTable
