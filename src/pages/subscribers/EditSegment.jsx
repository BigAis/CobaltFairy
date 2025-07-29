import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Card from '../../components/Card'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import PopupText from '../../components/PopupText/PopupText'
import GoBackButton from '../../components/GoBackButton'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import DatePicker from '../../components/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

import qs from 'qs'

const EditSegment = () => {
	const { uuid } = useParams()
	const navigate = useNavigate()
	const { user, account, createNotification } = useAccount()
	const [segment, setSegment] = useState({
		name: '',
		filters: {
			email: { $contains: '' },
			name: { $contains: '' },
			createdAt: {},
			groups: { udid: { $in: [] } },
		},
	})
	const [loading, setLoading] = useState(false)
	const [groups, setGroups] = useState([])
	const [selectedGroups, setSelectedGroups] = useState([])

	// Get groups for filtering
	const getGroups = async () => {
		try {
			setLoading(true)
			const query = {
				pagination: {
					pageSize: 100,
					page: 1,
				},
			}
			const queryString = qs.stringify(query, { encode: false })

			const response = await ApiService.get(`fairymailer/getGroups?${queryString}&populate[subscribers][count]=true`, user.jwt)
			if (response.data && response.data.data) {
				setGroups(response.data.data)
				return response.data.data // Return the groups data
			}
			return []
		} catch (error) {
			console.error('Error fetching groups:', error)
			createNotification({
				message: 'Error fetching groups. Please try again.',
				type: 'warning',
			})
			return []
		} finally {
			setLoading(false)
		}
	}

	// Fetch existing segment if in edit mode
	const fetchSegment = async () => {
		if (!uuid || !user?.jwt) return

		setLoading(true)
		try {
			const response = await ApiService.get(`fairymailer/getSegments`, user.jwt)

			if (response?.data?.data && Array.isArray(response.data.data)) {
				// Find the segment with matching UUID
				const foundSegment = response.data.data.find((s) => s.uuid === uuid)

				if (foundSegment) {
					console.log('Found matching segment:', foundSegment)
					setSegment(foundSegment)

					// Set selected groups if they exist in the filters
					if (foundSegment.filters?.groups?.udid?.$in || foundSegment.filters?.groups?.id?.$in) {
						// Handle both old (id-based) and new (udid-based) group filters for backwards compatibility
						const groupUdids = foundSegment.filters.groups.udid?.$in || []
						const groupIds = foundSegment.filters.groups.id?.$in || []

						getGroups().then((fetchedGroups) => {
							// Find the matching groups by UDID or ID and set them as selected
							const matchingGroups = fetchedGroups
								.filter((group) => groupUdids.includes(group.udid) || groupIds.includes(group.id))
								.map((group) => ({
									value: group.udid,
									label: group.name,
								}))
							setSelectedGroups(matchingGroups)
						})
					}
				} else {
					console.error('No segment found with UUID:', uuid)
					setSegment({ name: '', filters: { email: { $contains: '' }, name: { $contains: '' }, createdAt: {}, groups: { udid: { $in: [] } } } })
				}
			}
		} catch (error) {
			console.error('Error fetching segment:', error)
			createNotification({
				message: 'Error fetching segment details. Please try again.',
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}

	// Save segment
	const saveSegment = async () => {
		if (!segment.name.trim()) {
			PopupText.fire({
				text: 'Please enter a segment name.',
				icon: 'warning',
			})
			return
		}

		try {
			setLoading(true)

			// Create payload according to API specification
			const payload = {
				name: segment.name,
				filters: segment.filters,
			}

			// Include uuid only if editing existing segment
			if (uuid) {
				payload.uuid = uuid
			}

			console.log('Saving segment with payload:', payload)

			// Send the segment to the API
			const response = await ApiService.post('fairymailer/setSegment', payload, user.jwt)

			console.log('Segment save response:', response.data)

			if (response.data) {
				createNotification({
					message: `Segment "${segment.name}" ${uuid ? 'updated' : 'created'} successfully.`,
					type: 'default',
					autoClose: 3000,
				})
				navigate('/subscribers/segments')
			}
		} catch (error) {
			console.error('Error saving segment:', error)
			createNotification({
				message: `Error ${uuid ? 'updating' : 'creating'} segment. Please try again.`,
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}

	// Handle deleting a segment
	const deleteSegment = async () => {
		PopupText.fire({
			text: `Do you really want to remove segment "${segment.name}"?`,
			confirmButtonText: 'Yes, delete.',
			showCancelButton: true,
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					setLoading(true)

					// Create delete payload - mark segment as inactive to delete it
					const deletePayload = {
						uuid: uuid,
						name: segment.name,
						filters: segment.filters,
						active: false,
					}

					const deleteResponse = await ApiService.post('fairymailer/setSegment', deletePayload, user.jwt)

					if (deleteResponse.data) {
						createNotification({
							message: `Segment "${segment.name}" deleted successfully.`,
							type: 'default',
							autoClose: 3000,
						})
						navigate('/subscribers/segments')
					}
				} catch (error) {
					console.error('Error deleting segment:', error)
					createNotification({
						message: 'Error deleting segment. Please try again.',
						type: 'warning',
					})
				} finally {
					setLoading(false)
				}
			}
		})
	}

	// Handle filter changes
	const handleFilterChange = (field, value) => {
		setSegment((prev) => {
			// Create a deep copy of the previous filters
			const newFilters = JSON.parse(JSON.stringify(prev.filters))

			// Update the specific filter field
			if (field === 'email' || field === 'name') {
				newFilters[field] = { $contains: value }
			} else if (field === 'dateFrom') {
				newFilters.createdAt = {
					...newFilters.createdAt,
					$gte: value ? dayjs(value).tz('Europe/Athens').startOf('day').toISOString() : undefined,
				}
			} else if (field === 'dateTo') {
				newFilters.createdAt = {
					...newFilters.createdAt,
					$lte: value ? dayjs(value).tz('Europe/Athens').endOf('day').toISOString() : undefined,
				}
			}

			// Remove empty filters
			Object.keys(newFilters).forEach((key) => {
				if (key === 'email' || key === 'name') {
					if (!newFilters[key].$contains) {
						delete newFilters[key]
					}
				} else if (key === 'createdAt') {
					if (!newFilters[key].$gte && !newFilters[key].$lte) {
						delete newFilters[key]
					}
				}
			})

			return {
				...prev,
				filters: newFilters,
			}
		})
	}

	// Handle group selection
	const handleGroupSelection = (selected) => {
		setSelectedGroups(selected)

		setSegment((prev) => {
			const newFilters = { ...prev.filters }

			if (selected && selected.length > 0) {
				newFilters.groups = {
					udid: {
						$in: selected.map((group) => String(group.value)), // Ensure values are strings (UDIDs)
					},
				}
			} else {
				delete newFilters.groups
			}

			return {
				...prev,
				filters: newFilters,
			}
		})
	}

	// Load data when component mounts
	useEffect(() => {
		if (user) {
			getGroups()
			if (uuid) {
				fetchSegment()
			}
		}
	}, [user, uuid])

	// Create group options for dropdown
	const groupOptions = groups.map((group) => ({
		value: group.udid, // Use UDID as value
		label: group.name,
	}))

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{user && account && <PageHeader user={user.user} account={{ plan: 'Free Plan', ...(account || {}) }} />}

					<GoBackButton destination="/subscribers/segments" />

					<div className="page-name-container">
						<div className="page-name">{uuid ? 'Edit Segment' : 'New Segment'}</div>
					</div>

					{loading ? (
						<Card>
							<div>Loading...</div>
						</Card>
					) : (
						<Card className="segment-form">
							<InputText
								label={'Segment Name'}
								value={segment.name || ''}
								onChange={(e) => {
									setSegment((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}}
								placeholder="Enter a name for this segment"
							/>

							<h3 style={{ marginBottom: '20px', marginTop: '30px' }}>Segment Filters</h3>

							<div className="d-flex flex-column gap-20">
								<div className="d-flex gap-20">
									<InputText
										label={'Email Contains'}
										value={segment.filters.email?.$contains || ''}
										onChange={(e) => handleFilterChange('email', e.target.value)}
										placeholder="Filter by email content"
									/>

									<InputText
										label={'Name Contains'}
										value={segment.filters.name?.$contains || ''}
										onChange={(e) => handleFilterChange('name', e.target.value)}
										placeholder="Filter by name content"
									/>
								</div>

								<div className="d-flex gap-20">
									<div style={{ flex: 1 }}>
										<label style={{ display: 'block', marginBottom: '8px' }}>Groups</label>
										<MultipleDropdown placeholder="Select Groups" options={groupOptions} selectedValues={selectedGroups} onOptionSelect={handleGroupSelection} />
									</div>
								</div>

								<div className="d-flex gap-20">
									<div style={{ flex: 1 }}>
										<label style={{ display: 'block', marginBottom: '8px' }}>From Date</label>
										<DatePicker
											hasMinDate={false}
											hasDefaultDate={false}
											dateFormat="d/m/Y"
											timeFormat="H:i"
											pickerType="date"
											onChange={(date) => handleFilterChange('dateFrom', date)}
											value={segment.filters.createdAt?.$gte ? new Date(segment.filters.createdAt.$gte) : ''}
										/>
									</div>

									<div style={{ flex: 1 }}>
										<label style={{ display: 'block', marginBottom: '8px' }}>To Date</label>
										<DatePicker
											hasMinDate={false}
											hasDefaultDate={false}
											dateFormat="d/m/Y"
											timeFormat="H:i"
											pickerType="date"
											onChange={(date) => handleFilterChange('dateTo', date)}
											value={segment.filters.createdAt?.$lte ? new Date(segment.filters.createdAt.$lte) : ''}
										/>
									</div>
								</div>
							</div>

							<div className="action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '30px' }}>
								<Button onClick={saveSegment} loading={loading}>
									{uuid ? 'Update Segment' : 'Create Segment'}
								</Button>

								{uuid && (
									<Button type="secondary" onClick={deleteSegment} loading={loading}>
										Delete
									</Button>
								)}
							</div>
						</Card>
					)}
				</div>
			</div>
		</>
	)
}

export default EditSegment
