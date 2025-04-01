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

import qs from 'qs'

// const GroupsTable = ({ groups, resultsPerPage, onUpdate, setView, currentPage, totalResults, onPageChange }) => {
const CustomFieldsTable = ({ groupSearchValue, onUpdate, setView }) => {
	const navigate = useNavigate()
	const { user } = useAccount()

	const [loading, setLoading] = useState(false)
	const [groups, setGroups] = useState([])

	const fields = [
		{ uuid: 'kDyvIO1kzX', fieldName: 'Birthday', type: 'date', format: 'DD-MM-YYYY' },
		{ uuid: 'gLCodNrUoo', fieldName: 'Age', type: 'number' },
		{ uuid: 'f5zZltwTs1', fieldName: 'Name Day', type: 'string' },
	]

	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 10

	const [selectedFields, setSelectedFields] = useState([])

	const rowsPerPage = resultsPerPage

	const dropdownOptions = [{ value: 'delete_group', label: 'Delete' }]

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = fields.slice(startIndex, endIndex)

	// useEffect(() => {
	// 	getGroups(currentPage)
	// }, [currentPage, groupSearchValue])

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue.value) {
			case 'delete_group':
				console.log('Edit action triggered')
				// deleteGroup(rowData)
				break
			default:
				console.log('No action found for:', selectedValue)
		}
	}

	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/custom-field/${uuid}`)
	}

	const actionsBodyTemplate = (rowData) => {
		return (
			<div>
				<Dropdown
					withDivider={true}
					icon={'Plus'}
					options={dropdownOptions}
					onLeftClick={() => handleLeftClick(rowData.uuid)}
					onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, rowData)}
				>
					Edit
				</Dropdown>
			</div>
		)
	}

	useEffect(() => {
		setTotalResults(fields.length)
	}, [])

	// const deleteGroup = async (rowData) => {
	// 	PopupText.fire({
	// 		text: `Do you really want to remove group ${rowData.name}? `,
	// 		confirmButtonText: 'Yes, delete.',
	// 	}).then(async (result) => {
	// 		if (result.isConfirmed) {
	// 			const deleteResponse = await ApiService.post(`fairymailer/deleteGroupByGuid/${rowData.udid}`, { data: {} }, user.jwt)
	// 			if (deleteResponse) {
	// 				onUpdate()
	// 				getGroups()
	// 			}
	// 		}
	// 	})
	// }

	// const getGroups = async (page = 1) => {
	// 	setLoading(true)
	// 	const query = {
	// 		filters: {
	// 			name: {
	// 				$contains: groupSearchValue,
	// 			},
	// 		},
	// 		pagination: {
	// 			pageSize: resultsPerPage,
	// 			page,
	// 		},
	// 	}
	// 	const queryString = qs.stringify(query, { encode: false })

	// 	try {
	// 		const resp = await ApiService.get(`fairymailer/getGroups?${queryString}&populate[subscribers][count]=true`, user.jwt)

	// 		if (resp.data && resp.data.data) {
	// 			setGroups(resp.data.data)
	// 			setTotalResults(resp.data.meta.pagination.total)
	// 		}
	// 		setCurrentPage(page)
	// 	} catch (error) {
	// 		console.error('Error fetching groups:', error)
	// 	} finally {
	// 		setLoading(false)
	// 	}
	// }

	return (
		// <div>
		<>
			<DataTable value={fields} paginator={false} selection={selectedFields} onSelectionChange={(e) => setSelectedFields(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
				<Column
					body={(rowData) => (
						<div style={{ position: 'relative' }}>
							{/* Checkbox in the Top-Left Corner */}
							<div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
								<Checkbox
									checked={selectedFields.some((subscribers) => subscribers.name === rowData.name)}
									onChange={(e) => {
										if (e) {
											setSelectedFields((prev) => [...prev, rowData])
										} else {
											setSelectedFields((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
										}
									}}
								/>
							</div>
						</div>
					)}
					header={() => (
						<Checkbox
							checked={selectedFields.length === paginatedData.length && selectedFields.length > 0}
							onChange={(e) => {
								if (e) {
									setSelectedFields([...paginatedData])
								} else {
									setSelectedFields([])
								}
							}}
						/>
					)}
					headerStyle={{ width: '80px' }}
				/>
				<Column field="fieldName" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.fieldName)} />
				<Column field="type" header="Type" body={(rowData) => (loading ? <Skeleton /> : rowData.type)} />
				<Column field="format" header="Format" body={(rowData) => (loading ? <Skeleton /> : rowData.format ?? '-')} />
				<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
			</DataTable>
			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default CustomFieldsTable
