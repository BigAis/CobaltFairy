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

const SegmentsTable = ({ segmentSearchValue, onUpdate, setView, applySegmentFilter, segments: propSegments = null, totalResults: propTotalResults = 0, loading: propLoading = false }) => {
	const navigate = useNavigate()
	const { user, createNotification } = useAccount()

	const [loading, setLoading] = useState(propLoading)
	const [segments, setSegments] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const resultsPerPage = 10

	const [selectedSegments, setSelectedSegments] = useState([])

	const rowsPerPage = resultsPerPage

	const dropdownOptions = [
		{ value: 'apply_segment', label: 'Apply Filter' },
		{ value: 'edit_segment', label: 'Edit' },
		{ value: 'delete_segment', label: 'Delete' },
	]

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = segments.slice(startIndex, endIndex)

	useEffect(() => {
		// Always use provided segments when available
		if (propSegments !== null) {
			setSegments(propSegments)
			setTotalResults(propTotalResults)
			setLoading(propLoading)
		} else if (user) {
			getSegments()
		}
	}, [propSegments, propTotalResults, propLoading, user, currentPage, segmentSearchValue])

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	const getSegments = async () => {
		try {
			setLoading(true)
			const response = await ApiService.get('fairymailer/getSegments', user.jwt)

			if (response.data && response.data.data) {
				let filteredSegments = response.data.data

				// Apply search filter if provided
				if (segmentSearchValue) {
					filteredSegments = filteredSegments.filter((segment) => segment.name.toLowerCase().includes(segmentSearchValue.toLowerCase()))
				}

				setSegments(filteredSegments)
				setTotalResults(filteredSegments.length)
			}
		} catch (error) {
			console.error('Error fetching segments:', error)
			createNotification({
				message: 'Error loading segments. Please try again.',
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}

	const handleActionSelect = (selectedValue, rowData) => {
		switch (selectedValue.value) {
			case 'apply_segment':
				console.log('Apply segment filter triggered')
				applySegmentFilter(rowData)
				setView('subs')
				break
			case 'edit_segment':
				console.log('Edit segment triggered')
				navigate(`/subscribers/segment/${rowData.uuid}`)
				break
			case 'delete_segment':
				console.log('Delete segment triggered')
				deleteSegment(rowData)
				break
			default:
				console.log('No action found for:', selectedValue)
		}
	}

	const handleLeftClick = (uuid) => {
		navigate(`/subscribers/segment/${uuid}`)
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

	const deleteSegment = async (rowData) => {
		PopupText.fire({
			text: `Do you really want to remove segment "${rowData.name}"?`,
			confirmButtonText: 'Yes, delete.',
			showCancelButton: true,
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					// Directly call the API with the existing setSegment endpoint
					// Set active to false to mark it as deleted
					const deleteResponse = await ApiService.post(
						'fairymailer/setSegment',
						{
							uuid: rowData.uuid,
							name: rowData.name,
							filters: rowData.filters,
							active: false,
						},
						user.jwt
					)

					if (deleteResponse) {
						createNotification({
							message: `Segment "${rowData.name}" deleted successfully.`,
							type: 'default',
						})
						onUpdate()
					}
				} catch (error) {
					console.error('Error deleting segment:', error)
					createNotification({
						message: 'Error deleting segment. Please try again.',
						type: 'warning',
					})
				}
			}
		})
	}

	// Filter description body template
	const filterDescriptionTemplate = (rowData) => {
		let description = 'No filters'

		if (rowData.filters) {
			const filterParts = []

			if (rowData.filters.email && rowData.filters.email.$contains) {
				filterParts.push(`Email contains: ${rowData.filters.email.$contains}`)
			}

			if (rowData.filters.name && rowData.filters.name.$contains) {
				filterParts.push(`Name contains: ${rowData.filters.name.$contains}`)
			}

			if (rowData.filters.createdAt) {
				if (rowData.filters.createdAt.$gte) {
					const date = new Date(rowData.filters.createdAt.$gte)
					filterParts.push(`From: ${date.toLocaleDateString()}`)
				}
				if (rowData.filters.createdAt.$lte) {
					const date = new Date(rowData.filters.createdAt.$lte)
					filterParts.push(`To: ${date.toLocaleDateString()}`)
				}
			}

			if (rowData.filters.groups && rowData.filters.groups.id && rowData.filters.groups.id.$in) {
				filterParts.push(`Groups: ${rowData.filters.groups.id.$in.length} selected`)
			}

			if (filterParts.length > 0) {
				description = filterParts.join(', ')
			}
		}

		return loading ? <Skeleton /> : <div className="filter-description">{description}</div>
	}

	return (
		<>
			<DataTable
				value={segments}
				paginator={false}
				selection={selectedSegments}
				onSelectionChange={(e) => setSelectedSegments(e.value)}
				dataKey="uuid"
				rowClassName={() => 'p-table-row'}
				emptyMessage="No segments found."
			>
				<Column
					body={(rowData) => (
						<div style={{ position: 'relative' }}>
							<div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
								<Checkbox
									checked={selectedSegments.some((seg) => seg.uuid === rowData.uuid)}
									onChange={(e) => {
										if (e) {
											setSelectedSegments((prev) => [...prev, rowData])
										} else {
											setSelectedSegments((prev) => prev.filter((seg) => seg.uuid !== rowData.uuid))
										}
									}}
								/>
							</div>
						</div>
					)}
					header={() => (
						<Checkbox
							checked={selectedSegments.length === paginatedData.length && selectedSegments.length > 0}
							onChange={(e) => {
								if (e) {
									setSelectedSegments([...paginatedData])
								} else {
									setSelectedSegments([])
								}
							}}
						/>
					)}
					headerStyle={{ width: '80px' }}
				/>
				<Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
				{/* <Column field="filters" header="Filters" body={filterDescriptionTemplate} /> */}
				<Column field="updatedAt" header="Last Updated" body={(rowData) => (loading ? <Skeleton /> : new Date(rowData.updatedAt).toLocaleDateString())} />
				<Column header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
			</DataTable>
			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
		</>
	)
}

export default SegmentsTable
