import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'

const CampaignsTable = ({ campaigns }) => {

	const [selectedCampaigns, setSelectedCampaigns] = useState([])

	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = 5

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const dropdownOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	]
	const handleLeftClick = () => {
		alert('Left action triggered!')
	}

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = campaigns.slice(startIndex, endIndex)

	useEffect(() => {
		console.log('selected campagins : ', selectedCampaigns)
	}, [selectedCampaigns])

	const actionsBodyTemplate = () => {
		return (
			<div>
				<Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onLeftClick={handleLeftClick}>
					Report
				</Dropdown>
			</div>
		)
	}

	return (
		// <div>
		<>
			<DataTable value={paginatedData} paginator={false} selection={selectedCampaigns} onSelectionChange={(e) => setSelectedCampaigns(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
				<Column
					body={(rowData) => (
						<div style={{ position: 'relative' }}>
							{/* Checkbox in the Top-Left Corner */}
							<div style={{ position: 'absolute', top: '10px', left: '5px' }}>
								<Checkbox
									checked={selectedCampaigns.some((campaign) => campaign.name === rowData.name)}
									onChange={(e) => {
										if (e) {
											setSelectedCampaigns((prev) => [...prev, rowData])
										} else {
											setSelectedCampaigns((prev) => prev.filter((campaign) => campaign.name !== rowData.name))
										}
									}}
								/>
							</div>
							{/* Image */}
							<img src={rowData.image} alt={rowData.name} style={{ width: '88px', height: '88px' }} />
						</div>
					)}
					header={() => (
						<Checkbox
							checked={selectedCampaigns.length === paginatedData.length && selectedCampaigns.length > 0}
							onChange={(e) => {
								if (e) {
									setSelectedCampaigns([...paginatedData])
								} else {
									setSelectedCampaigns([])
								}
							}}
						/>
					)}
					headerStyle={{ width: '80px' }}
				/>
				<Column field="name" header="Name" />
				<Column field="recipients" header="Recipients" />
				<Column field="opens" header="Opens" />
				<Column field="clicks" header="Clicks" />
				<Column field="type" header="Type" />
				<Column field="date" header="Date" />
				<Column header="Actions" body={actionsBodyTemplate} />
			</DataTable>
			<Pagination currentPage={1} totalResults={campaigns.length} resultsPerPage={10} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default CampaignsTable
