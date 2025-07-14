import { useEffect, useState } from 'react'
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
import PopupText from '../../components/PopupText/PopupText'
import User from '../../service/User'
import { ApiService } from '../../service/api-service'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { v4 as uuidv4 } from 'uuid'

dayjs.extend(utc)
dayjs.extend(timezone)
// import { v4 as uuidv4 } from 'uuid'

import qs from 'qs'

const CampaignsTable = ({ 
  selectedCampaignType, 
  dashboardPreviewOnly = false, 
  resultsPerPage = 20, 
  refreshData = () => {}, 
  searchTerm = '',
  campaigns: propCampaigns = null,
  loading: propLoading = false
}) => {
	const navigate = useNavigate()
	const { user, account, createNotification } = useAccount()

	const [loading, setLoading] = useState(false)
	const [campaigns, setCampaigns] = useState([])
	const [totalResults, setTotalResults] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = resultsPerPage

	const [selectedCampaigns, setSelectedCampaigns] = useState([])

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
		setSelectedCampaigns([])
		
		// If we're using server-side data, fetch the new page
		if (propCampaigns === null) {
			getCampaigns(newPage)
		}
	}

	const dropdownOptions = [
		{ value: 'delete_cmp', label: 'Delete' },
		{ value: 'duplicate_cmp', label: 'Duplicate' },
		{ value: 'rename_cmp', label: 'Rename' },
		// { value: 'overview_cmp', label: 'Overview' },
	]
	const handleLeftClick = (rowData) => {
		rowData.status === 'sent' ? navigate(`/campaigns/overview/${rowData.uuid}`) : navigate(`/campaigns/edit/${rowData.uuid}`)
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
				refreshData();
				createNotification({
					message: 'Deleted successfully.',
					type: 'warning',
					autoClose: 3000
				});
			}, 500)
		}
	}

	const handleDuplicateCampaign = async (campaign) => {
		const result = await PopupText.fire({
			icon: 'question',
			text: 'Please type a title for the new campaign',
			inputField:true,
			focusCancel: false,
			showConfirmButton: true,
			showDenyButton: false,
			showCancelButton: true,
			confirmButtonText: 'Continue',
			cancelButtonText: 'Cancel',
		})

		if (result.isConfirmed) {
			const newCampaign = {
				...campaign,
				uuid: uuidv4(),
				name: `${result.inputValue}`,
				date: null,
				sent_at:null,
				stats: null,
				account: account?.id,
				recipients: 0,
				uuid_b: uuidv4(),
				status: 'draft',
				recp_groups: campaign.recp_groups.map((g) => {
					return g.id
				}),
				recp_filters:null,
			}
			delete(newCampaign.id);
			try {
				let resp = await ApiService.post(
					'campaigns/',
					{
						data: newCampaign,
					},
					user.jwt
				)

				console.log('resp duplicate campaign is : ', resp)
				if(resp.data && resp.data.data && resp.data.data.id){
					refreshData();
					setTimeout(() => {
						createNotification({
							message: 'Campaign duplicated successfully.',
							type: 'default',
							autoClose: 3000
						});
					}, 500)
				}
			} catch (error) {
				console.error('Error duplicating campaign:', error);
				createNotification({
					message: 'Failed to duplicate campaign. Please try again.',
					type: 'warning',
					autoClose: 5000
				});
			}
		}
	}

	const renameCampaign = async(campaign) => {
		const result = await PopupText.fire({
			icon: 'question',
			text: 'Please type a title for the new campaign',
			inputField: true,
			initialInputValue: campaign.name,
			focusCancel: false,
			showConfirmButton: true,
			showDenyButton: false,
			showCancelButton: true,
			confirmButtonText: 'Continue',
			cancelButtonText: 'Cancel',
		})

		if (result.isConfirmed) {
			try {
				const updCampaign = {
					uuid: campaign.uuid,
					name: `${result.inputValue}`,
				}
				let resp = await ApiService.post(
					'fairymailer/updateCampaign',
					{
						data: updCampaign,
					},
					user.jwt
				)
				console.log('renamed resp: ',resp)
				if(resp.data && resp.data.code && resp.data.code==200){
					refreshData();
					setTimeout(() => {
						createNotification({
							message: 'Campaign renamed successfully.',
							type: 'default',
							autoClose: 3000
						});
					}, 500)
				}
			} catch (error) {
				console.error('Error renaming campaign:', error);
				createNotification({
					message: 'Failed to rename campaign. Please try again.',
					type: 'warning',
					autoClose: 5000
				});
			}
		}
	}

	const handleActionSelect = (selectedValue, rowData) => {
		console.log('rowdata2 is : ', rowData)

		switch (selectedValue.value) {
			// case 'overview_cmp':
			// 	console.log('Overview action triggered')
			// 	navigate(`/campaigns/overview/${rowData.uuid}`)
			// 	// Implement overview logic here
			// 	break
			case 'rename_cmp':
				renameCampaign(rowData)
				break;
			case 'edit':
				navigate(`/campaigns/edit/${rowData.uuid}`)
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

	const getCampaigns = async (page = 1) => {
		setLoading(true)
		let campaignStatusFilter = {}
		switch (selectedCampaignType) {
			case 'sent':
				campaignStatusFilter = {
					status: {
						$eq: 'sent',
					},
				}
				break
			case 'draft':
				campaignStatusFilter = {
					$and: [
						{
							status: {
								$eq: 'draft',
							},
						},
						{
							date: { $null: true },
						},
					],
				}
				break
			case 'outbox':
				campaignStatusFilter = {
					$and: [
						{
							status: {
								$eq: 'draft',
							},
						},
						{
							date: { $notNull: true },
						},
					],
				}
				break
		}
		console.log('campaignStatusFilter', campaignStatusFilter)
		const query = {
			filters: campaignStatusFilter,
			sort: ['id:desc'],
			pagination: {
				pageSize: dashboardPreviewOnly ? 3 : resultsPerPage,
				page,
			},
			populate: {
				recp_groups: {
					populate: {
						subscribers: {
							count: true,
						},
					},
				},
			},
		}
		const queryString = qs.stringify(query, { encode: false })

		try {
			const resp = await ApiService.get(`fairymailer/getCampaigns?${queryString}`, user.jwt)

			if (resp.data && resp.data.data) {
				console.log('cmps from getCampaigns inside campaignsTable', resp)
				setCampaigns(resp.data.data)
				setTotalResults(resp.data.meta.pagination.total)
				setCurrentPage(page)
			}
		} catch (error) {
			console.error('Error fetching campaigns:', error)
			createNotification({
				message: 'Error loading campaigns. Please try again.',
				type: 'warning',
				autoClose: 5000
			});
		} finally {
			setLoading(false)
		}
	}

	// Calculate the paginated data (only used for client-side pagination)
	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = campaigns.slice(startIndex, endIndex)

	useEffect(() => {
		if (user) {
			// Only fetch if no campaigns were provided via props
			if (propCampaigns === null) {
				getCampaigns(1) // Reset to page 1 when campaign type changes
				setCurrentPage(1)
			} else {
				// Use the campaigns provided via props
				setCampaigns(propCampaigns)
				setTotalResults(propCampaigns.length)
				setLoading(propLoading)
			}
		}
	}, [user, selectedCampaignType, propCampaigns, propLoading])

	const actionsBodyTemplate = (rowData) => {
		return (
			<div>
				<Dropdown
					withDivider={true}
					icon={'Plus'}
					options={dropdownOptions}
					onOptionSelect={(selectedValue) => handleActionSelect(selectedValue, rowData)}
					onLeftClick={() => handleLeftClick(rowData)}
				>
					{rowData.status === 'sent' ? 'Overview' : 'Edit'}
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

	const dateBodyTemplate = (rowData) => {
		return rowData.date ? dayjs(rowData.date).tz('Europe/Athens').format('DD-MM-YYYY HH:mm') : ''
	}

	// Important: Determine which data to display based on whether we're using client-side or server-side pagination
	const displayData = paginatedData

	return (
		<>
			{!dashboardPreviewOnly ? (
				<DataTable value={displayData} paginator={false} selection={selectedCampaigns} onSelectionChange={(e) => setSelectedCampaigns(e.value)} dataKey='id' rowClassName={() => 'p-table-row'}>
					<Column
						body={(rowData) =>
							loading ? (
								<Skeleton />
							) : (
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
									{rowData.image ? (
										<img src={rowData.image} alt={rowData.name} style={{ minWidth: '88px', height: '88px' }} />
									) : (
										<img src={'/images/cmp.png'} alt={rowData.name} style={{ minWidth: '88px', height: '88px' }} />
									)}
								</div>
							)
						}
						header={() => (
							<Checkbox
								checked={selectedCampaigns.length === displayData.length && selectedCampaigns.length > 0}
								onChange={(e) => {
									if (e) {
										setSelectedCampaigns([...displayData])
									} else {
										setSelectedCampaigns([])
									}
								}}
							/>
						)}
						headerStyle={{ width: '80px' }}
					/>
					<Column field="name" header="Name" body={(rowData) => (loading ? <Skeleton /> : rowData.name)} />
					<Column field="recipients" header="Recipients" body={(rowData) => (loading ? <Skeleton /> : rowData.recipients??0)} />
					<Column field="stats.o" header="Opens" body={(rowData) => (loading ? <Skeleton /> : openBodyTemplate(rowData))} />
					<Column field="clicks" header="Clicks" body={(rowData) => (loading ? <Skeleton /> : clickBodyTemplate(rowData))} />
					<Column field="type" header="Type" body={(rowData) => (loading ? <Skeleton /> : typeBodyTemplate(rowData))} />
					<Column field="date" header="Date" body={(rowData) => (loading ? <Skeleton /> : dateBodyTemplate(rowData))} />
					<Column field="uuid" header="Actions" body={(rowData) => (loading ? <Skeleton /> : actionsBodyTemplate(rowData))} />
				</DataTable>
			) : (
				<DataTable value={displayData} paginator={false} selection={selectedCampaigns} onSelectionChange={(e) => setSelectedCampaigns(e.value)} dataKey="id" rowClassName={() => 'p-table-row'}>
					<Column
						body={(rowData) => (
							<div style={{ position: 'relative' }}>
								{/* Image */}
								{rowData.image ? (
									<img src={rowData.image} alt={rowData.name} style={{ minWidth: '88px', height: '88px' }} />
								) : (
									<img src={'/images/cmp.png'} alt={rowData.name} style={{ minWidth: '88px', height: '88px' }} />
								)}
							</div>
						)}
						header={() => (
							<Checkbox
								checked={selectedCampaigns.length === displayData.length && selectedCampaigns.length > 0}
								onChange={(e) => {
									if (e) {
										setSelectedCampaigns([...displayData])
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
				</DataTable>
			)}

			<Pagination 
				currentPage={currentPage} 
				totalResults={totalResults} 
				resultsPerPage={resultsPerPage} 
				onChange={handlePageChange} 
			/>
		</>
	)
}

export default CampaignsTable