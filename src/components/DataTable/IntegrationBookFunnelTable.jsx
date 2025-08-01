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
import Button from '../Button'
import { ApiService } from '../../service/api-service'

import qs from 'qs'

const BookFunnelIntegrationsTable = () => {
	const navigate = useNavigate()
	const { user } = useAccount()

	const [loading, setLoading] = useState(false)
	const [integrations, setIntegrations] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 20

	const [selectedIntegrations, setSelectedIntegrations] = useState([])

	const rowsPerPage = resultsPerPage

	const dropdownOptions = [
		{ value: 'view_subs', label: 'Subscribers' },
		{ value: 'delete_group', label: 'Delete' },
	]

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = integrations.slice(startIndex, endIndex)

	useEffect(() => {}, [selectedIntegrations])
	useEffect(() => {
		if (user) getBookfunnelMaps(currentPage)
	}, [currentPage, user])

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
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
				<Button
					type="secondary"
					onClick={() => {
						deleteMap(rowData)
					}}
				>
					Delete
				</Button>
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
					getGroups()
				}
			}
		})
	}

	const deleteMap = async (rowData) => {
		PopupText.fire({
			icon: 'question',
			text: 'Are you sure you want to delete this BookFunnel Mapping?',
			showCancelButton: true,
			cancelButtonText: 'Cancel',
			focusCancel: true,
			confirmButtonText: 'Delete it',
		}).then(async (res) => {
			if (res.isConfirmed) {
				setLoading(true)
				try {
					const resp = await ApiService.delete(`bookfunnel-maps/${rowData.id}`, user.jwt)
					window.location.reload()
				} catch (error) {
					console.error('Error deleting map:', error)
				} finally {
					setLoading(false)
				}
			}
		})
	}

	const getBookfunnelMaps = async (page = 1) => {
		setLoading(true)
		try {
			const query = {
				populate: {
					group: true,
				},
				pagination: {
					pageSize: resultsPerPage,
					page,
				},
			}
			const queryString = qs.stringify(query, { encode: false })

			const resp = await ApiService.get(`fairymailer/bookfunnel-maps/?${queryString}`, user.jwt)

			if (resp.data && resp.data.data) {
				console.log('bfpage', resp.data.data)
				setIntegrations(resp.data.data)
				setTotalResults(resp.data.data.length)
			} else {
				PopupText.fire({ icon: 'error', text: 'Failed to retrieve integrations.' })
			}
		} catch (error) {
			console.error('Error fetching integration:', error)
			PopupText.fire({ icon: 'error', text: 'An error occurred while retrieving integrations.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		// <div>
		<>
			<DataTable
				value={integrations}
				paginator={false}
				selection={selectedIntegrations}
				onSelectionChange={(e) => setSelectedIntegrations(e.value)}
				dataKey="name"
				rowClassName={() => 'p-table-row'}
				className="integrations-table"
			>
				<Column
					body={(rowData) => (
						<div style={{ position: 'relative' }}>
							{/* Checkbox in the Top-Left Corner */}
							<div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
								<Checkbox
									checked={selectedIntegrations.some((subscribers) => subscribers.name === rowData.name)}
									onChange={(e) => {
										if (e) {
											setSelectedIntegrations((prev) => [...prev, rowData])
										} else {
											setSelectedIntegrations((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
										}
									}}
								/>
							</div>
						</div>
					)}
					header={() => (
						<Checkbox
							checked={selectedIntegrations.length === paginatedData.length && selectedIntegrations.length > 0}
							onChange={(e) => {
								if (e) {
									setSelectedIntegrations([...paginatedData])
								} else {
									setSelectedIntegrations([])
								}
							}}
						/>
					)}
					headerStyle={{ width: '80px' }}
				/>
				<Column field="bf_page.name" header="BF Page" body={(rowData) => (loading ? <Skeleton /> : rowData?.bf_page?.name)} />
				<Column field="group.name" header="Account Group" body={(rowData) => (loading ? <Skeleton /> : rowData?.group?.name)} />
				<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
			</DataTable>
			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default BookFunnelIntegrationsTable
