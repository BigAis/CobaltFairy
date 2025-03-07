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

const GroupsTable = ({ groups, resultsPerPage = 10, onUpdate, setView, setShowFilters }) => {
	console.log('groups are : ', groups)

	const navigate = useNavigate()
	const { user } = useAccount()

	const [selectedGroups, setSelectedGroups] = useState([])

	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = resultsPerPage

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const dropdownOptions = [
		{ value: 'view_subs', label: 'Subscribers' },
		{ value: 'delete_group', label: 'Delete' },
	]

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = groups.slice(startIndex, endIndex)

	useEffect(() => {}, [selectedGroups])

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue.value) {
			case 'view_subs': {
				console.log('Overview action triggered')
				const groupUdidBase64 = btoa(JSON.stringify({ group_udid: rowData.udid }))
				navigate(`/subscribers/filters/${groupUdidBase64}`)
				setView('subs')
				setShowFilters(true)
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
				console.log('Confirmed with input:', result)
				const deleteResponse = await ApiService.post(`fairymailer/deleteGroupByGuid/${rowData.udid}`, { data: {} }, user.jwt)
				if (deleteResponse) {
					console.log('on update running')
					onUpdate()
				}

				// if (response.data && response.data.code == 200) {
				// 	navigate('/subscribers/')
				// }
			}
		})
	}

	const getGroups = async () => {
		try {
			const groupsResponse = await ApiService.get('fairymailer/getGroups?populate[subscribers][count]=true', user.jwt)
			// if(groupsResponse && groupsResponse.data && groupsResponse.data.data){

			// }
		} catch (error) {
			console.log('Error from getGroups inside GroupsTable.jsx', error)
		}
	}

	return (
		// <div>
		<>
			<DataTable value={paginatedData} paginator={false} selection={selectedGroups} onSelectionChange={(e) => setSelectedGroups(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
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
				<Column field="name" header="Name" />
				<Column field="subscribers.count" header="Subscribers" />
				<Column field="open_rate" header="Opens" />
				<Column field="click_rate" header="Click" />
				<Column header="Actions" body={actionsBodyTemplate} />
			</DataTable>
			<Pagination currentPage={1} totalResults={groups.length} resultsPerPage={20} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default GroupsTable
