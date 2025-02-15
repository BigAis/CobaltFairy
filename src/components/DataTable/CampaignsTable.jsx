import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'
import PopupText from '../../components/PopupText/PopupText'
import User from '../../service/User'
import { ApiService } from '../../service/api-service'
import { v4 as uuidv4 } from 'uuid'

const CampaignsTable = ({ campaigns }) => {
	const [selectedCampaigns, setSelectedCampaigns] = useState([])
	const user = User.get()

	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = 5

	const handlePageChange = (page) => {
		setCurrentPage(page)
		setSelectedCampaigns([])
	}

	const dropdownOptions = [
		{ value: 'delete_cmp', label: 'Delete' },
		{ value: 'duplicate_cmp', label: 'Duplicate' },
		{ value: 'rename_cmp', label: 'Rename' },
		{ value: 'overview_cmp', label: 'Overview' },
	]
	const handleLeftClick = () => {
		alert('Editor for specific campaign should be here. function handleLeftClick() component CampaignsTable.jsx')
	}

	const handleDeleteCampaign = async (uuid) => {
		const result = await PopupText.fire({
			icon: 'question',
			text: 'Are you sure you want to delete this campaign? This action is irreversible.',
			focusCancel: false,
			showConfirmButton: true,
			showDenyButton: false,
			showCancelButton: true,
			confirmButtonText: 'Yes, DELETE it',
			cancelButtonText: 'No, abort',
		})

		if (result.isConfirmed) {
			console.log('Deleting...')
			let sendResp = await ApiService.post(`fairymailer/removeCampaign`, { data: { udid: uuid } }, user.jwt)
			setTimeout(() => {
				PopupText.fire({ icon: 'success', text: 'Deleted successfully!', showConfirmButton: false })
			}, 1000)
		}
	}

	const handleDuplicateCampaign = async (campaign) => {
		const result = await PopupText.fire({
			icon: 'question',
			text: 'Are you sure you want to duplicate this campaign?',
			focusCancel: false,
			showConfirmButton: true,
			showDenyButton: false,
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No',
		})

		if (result.isConfirmed) {
			console.log('Duplicating...')
			console.log('campaign is : ', campaign)

			let user = User.get()
			let account = await ApiService.get(`fairymailer/getAccount`, user.jwt)
			account = account.data.user.account
			const newCampaign = {
				udid: uuidv4(),
				name: `Copy of ${campaign.name}`,
				date: null,
				stats: null,
				account: account?.id,
				recipients: 0,
				uuid_b: uuidv4(),
				status: 'draft',
				recp_groups: campaign.recp_groups.map((g) => {
					return g.id
				}),
			}

			console.log('newCampaign is : ', newCampaign)
			// return

			let resp = await ApiService.post(
				'campaigns/',
				{
					data: newCampaign,
				},
				user.jwt
			)

			console.log('resp duplicate campaign is : ', resp)
			setTimeout(() => {
				PopupText.fire({ icon: 'success', text: 'Duplicated successfully!', showConfirmButton: false })
			}, 1000)
		}
	}

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue) {
			case 'edit':
				console.log('Edit action triggered')
				// Implement edit logic here
				break
			case 'delete_cmp':
				console.log('Delete action triggered')
				handleDeleteCampaign(rowData.uuid)
				break
			case 'duplicate_cmp':
				console.log('View details action triggered')
				handleDuplicateCampaign(rowData)
				// Implement view logic here
				break
			default:
				console.log('No action found for:', selectedValue)
		}
	}

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = campaigns.slice(startIndex, endIndex)

	useEffect(() => {
		console.log('selected campagins : ', selectedCampaigns)
	}, [selectedCampaigns])

	const actionsBodyTemplate = (rowData) => {
		return (
			<div>
				<Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, rowData)} onLeftClick={handleLeftClick}>
					Edit
				</Dropdown>
			</div>
		)
	}

	const openBodyTemplate = (rowData) => {
		const totalOpens = rowData.type === 'absplit' ? (rowData.stats?.o || 0) + (rowData.stats?.ob || 0) : rowData.stats?.o || 0

		return <>{totalOpens}</>
	}

	const clickBodyTemplate = (rowData) => {
		const totalOpens = rowData.type === 'absplit' ? (rowData.stats?.c || 0) + (rowData.stats?.cb || 0) : rowData.stats?.c || 0

		return <>{totalOpens}</>
	}

	const typeBodyTemplate = (rowData) => {
		return rowData.type === 'absplit' ? 'A/B Split' : 'Normal'
	}

	return (
		// <div>
		<>
			<DataTable value={paginatedData} paginator={false} selection={selectedCampaigns} onSelectionChange={(e) => setSelectedCampaigns(e.value)} dataKey="id" rowClassName={() => 'p-table-row'}>
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
											setSelectedCampaigns((prev) => prev.filter((campaign) => campaign.id !== rowData.id))
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
				<Column field="stats.o" body={openBodyTemplate} header="Opens" />
				<Column field="clicks" body={clickBodyTemplate} header="Clicks" />
				<Column field="type" body={typeBodyTemplate} header="Type" />
				<Column field="date" header="Date" />
				<Column header="Actions" body={actionsBodyTemplate} />
			</DataTable>
			<Pagination currentPage={1} totalResults={campaigns.length} resultsPerPage={10} onChange={handlePageChange} />
			{/* </div> */}
		</>
	)
}

export default CampaignsTable
