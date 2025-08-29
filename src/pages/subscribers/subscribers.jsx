import SubscribersTable from '../../components/DataTable/SubscribersTable'
import GroupsTable from '../../components/DataTable/GroupsTable'
import SegmentsTable from '../../components/DataTable/SegmentsTable'
import CustomFieldsTable from '../../components/DataTable/CustomFieldsTable'
import HistoryTable from '../../components/DataTable/HistoryTable'
import AreaChart from '../../components/AreaChart/AreaChart'
import DoughnutChart from '../../components/DoughtnutChart/DoughtnutChart'
import Pagination from '../../components/Pagination'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import './subscribers.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import DatePicker from '../../components/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import ImportCSV from './ImportCSV'
import SubscribersCleanup from './SubscribersCleanup'
import './SubscribersCleanup.scss'
import AddSubscriber from './AddSubscriber'
import PopupText from '../../components/PopupText/PopupText'
import SearchBar from '../../components/SearchBar/SearchBar'
import GoBackButton from '../../components/GoBackButton'
import Checkbox from '../../components/Checkbox'

dayjs.extend(utc)
dayjs.extend(timezone)

import qs from 'qs'

const Subscribers = ({ initialView }) => {
	const navigate = useNavigate()
	const location = useLocation()

	const { filterString } = useParams()

	const { user, account } = useAccount()
	const [subscribers, setSubscribers] = useState([])
	const [totalSubs, setTotalSubs] = useState(0)

	const [groups, setGroups] = useState([])
	const [totalGroups, setTotalGroups] = useState(0)
	const [groupsLoading, setGroupsLoading] = useState(false)

	// New state for segments
	const [segments, setSegments] = useState([])
	const [totalSegments, setTotalSegments] = useState(0)
	const [segmentsLoading, setSegmentsLoading] = useState(false)
	const [segmentSearchValue, setSegmentSearchValue] = useState('')

	// State for history
	const [historyData, setHistoryData] = useState([])
	const [totalHistory, setTotalHistory] = useState(0)
	const [historyLoading, setHistoryLoading] = useState(false)

	// State to track selected subscribers
	const [selectedSubscribers, setSelectedSubscribers] = useState([])

	// Export state
	const [filteredCount, setFilteredCount] = useState(0)
	const [hasAppliedFilters, setHasAppliedFilters] = useState(false)
	const [isExporting, setIsExporting] = useState(false)

	const [view, setView] = useState(initialView || 'subs')
	const [importMode, setImportMode] = useState('manual') // 'manual' or 'bulk'
	const [subscriberSearchValue, setSubscriberSearchValue] = useState('')
	const [groupSearchValue, setGroupSearchValue] = useState('')
	const [showFilters, setShowFilters] = useState(false)
	const [subscribersFilters, setSubscribersFilters] = useState({
		email: '',
		name: '',
		groups: [],
		dateFrom: '',
		dateTo: '',
		active: true,
	})
	const [autoAppliedFilters, setAutoAppliedFilters] = useState(false)
	const [subscribersQueryFilter, setSubscribersQueryFilter] = useState('')

	// Stats chart state
	const [statsTimePeriod, setStatsTimePeriod] = useState('7 Days')
	const [emailClientsPage, setEmailClientsPage] = useState(1)
	const emailClientsPerPage = 2

	// Real API data state
	const [statsData, setStatsData] = useState(null)
	const [statsLoading, setStatsLoading] = useState(false)
	const [statsError, setStatsError] = useState(null)

	// Get timeseries data based on selected time period
	const getTimeseriesData = () => {
		if (!statsData?.timeseries) return []

		switch (statsTimePeriod) {
			case 'Today':
				// For today, show the last day from d7 data
				return statsData.timeseries.d7.slice(-1) || []
			case '7 Days':
				return statsData.timeseries.d7 || []
			case '30 Days':
				return statsData.timeseries.d30 || []
			case 'All':
				return statsData.timeseries.all || []
			default:
				return statsData.timeseries.d7 || []
		}
	}

	// Get device type data for chart
	const getDeviceTypeData = () => {
		if (!statsData?.deviceAnalytics?.deviceType) return { metadata: { deviceType: {} } }

		const deviceCounts = statsData.deviceAnalytics.deviceType.counts || {}
		// Convert counts to percentages if needed
		return {
			metadata: {
				deviceType: deviceCounts,
			},
		}
	}

	// Get email clients data with pagination
	const getEmailClientsData = () => {
		if (!statsData?.deviceAnalytics?.emailClient?.percentages) return []

		const emailClients = statsData.deviceAnalytics.emailClient.percentages
		// Convert to array and format percentages
		return Object.entries(emailClients)
			.filter(([key]) => key !== 'undefined' && key !== 'Unknown') // Filter out undefined/unknown
			.map(([key, value]) => [key, `${value.toFixed(1)}%`])
			.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])) // Sort by percentage desc
	}

	// Email clients pagination logic
	const emailClientsEntries = getEmailClientsData()
	const totalEmailClients = emailClientsEntries.length
	const totalEmailClientsPages = Math.ceil(totalEmailClients / emailClientsPerPage)
	const paginatedEmailClients = emailClientsEntries.slice((emailClientsPage - 1) * emailClientsPerPage, emailClientsPage * emailClientsPerPage)

	// Fetch subscriber stats from API
	const fetchSubscriberStats = useCallback(async () => {
		if (!user?.jwt) return

		setStatsLoading(true)
		setStatsError(null)

		try {
			const response = await ApiService.get('fairymailer/subscriber-stats', user.jwt)

			if (response?.data?.code === 200) {
				setStatsData(response.data.data)
			} else {
				throw new Error(response?.data?.message || 'Failed to fetch stats')
			}
		} catch (error) {
			console.error('Error fetching subscriber stats:', error)
			setStatsError(error.message || 'Failed to load stats data')
		} finally {
			setStatsLoading(false)
		}
	}, [user?.jwt])

	const base64string = btoa(JSON.stringify({}))

	const groupOptions =
		groups &&
		groups.map((grp) => ({
			label: `${grp.name}`,
			value: `${grp.udid}`,
		}))

	const handleFilterChange = (key, value) => {
		setSubscribersFilters((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const handleSelection = (selected) => {
		setSubscribersFilters((prev) => ({
			...prev,
			groups: selected,
		}))
	}

	// Build export filters based on current state
	const buildExportFilters = () => {
		const filters = {}

		// Add active filter - always include this
		filters.active = subscribersFilters.active

		// Add email filter if exists
		if (subscribersFilters.email) {
			filters.email = { $contains: subscribersFilters.email }
		}

		// Add name filter if exists
		if (subscribersFilters.name) {
			filters.name = { $contains: subscribersFilters.name }
		}

		// Add groups filter if exists
		if (subscribersFilters.groups && subscribersFilters.groups.length > 0) {
			filters.groups = {
				udid: {
					$in: subscribersFilters.groups.map((group) => group.value),
				},
			}
		}

		// Add date filters if they exist
		const dateFilter = {}
		if (subscribersFilters.dateFrom) {
			dateFilter.$gte = dayjs(subscribersFilters.dateFrom).tz('Europe/Athens').startOf('day').format('YYYY-MM-DD')
		}
		if (subscribersFilters.dateTo) {
			dateFilter.$lte = dayjs(subscribersFilters.dateTo).tz('Europe/Athens').endOf('day').format('YYYY-MM-DD')
		}
		if (Object.keys(dateFilter).length > 0) {
			filters.createdAt = dateFilter
		}

		// Add search filter if exists
		if (subscriberSearchValue) {
			filters.email = {
				...filters.email,
				$contains: subscriberSearchValue,
			}
		}

		return filters
	}

	// Count filtered subscribers
	const countFilteredSubscribers = async () => {
		if (!user?.jwt) return

		try {
			const filters = buildExportFilters()

			// Use the same query structure as your filtering
			const query = {
				filters,
				pagination: {
					pageSize: 1,
					page: 1,
				},
			}

			const queryString = qs.stringify(query, { encode: false })
			const response = await ApiService.get(`fairymailer/getSubscribers?${queryString}`, user.jwt)

			if (response?.data?.meta?.pagination?.total) {
				setFilteredCount(response.data.meta.pagination.total)
			}
		} catch (error) {
			console.error('Error counting filtered subscribers:', error)
		}
	}

	// Export subscribers function
	const exportSubscribers = async () => {
		if (!user?.jwt) return

		setIsExporting(true)

		try {
			const filters = buildExportFilters()

			console.log('Exporting subscribers with filters:', filters)

			const response = await ApiService.post('fairymailer/export-subs', { filters }, user.jwt)

			if (response.data && response.data.success && response.data.downloadUrl) {
				// Create download link
				const link = document.createElement('a')
				link.href = response.data.downloadUrl
				link.setAttribute('download', response.data.filename || `subscribers_export_${new Date().toISOString().slice(0, 10)}.csv`)
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)

				// Show success message
				PopupText.fire({
					text: `Successfully exported ${response.data.count} subscribers.`,
					icon: 'success',
				})
			} else {
				throw new Error('Invalid response format or missing download URL')
			}
		} catch (error) {
			console.error('Error exporting subscribers:', error)
			PopupText.fire({
				text: 'Error exporting subscribers. Please try again.',
				icon: 'error',
			})
		} finally {
			setIsExporting(false)
		}
	}

	const filterSubscribersAction = async () => {
		const groupIds = subscribersFilters.groups
			.map((selected) => {
				const matchedGroup = groups.find((group) => group.udid === selected.value)
				return matchedGroup ? matchedGroup.id : null
			})
			.filter((id) => id !== null)

		const query = {
			sort: ['createdAt:desc'],
			filters: {
				active: subscribersFilters.active,
				email: subscribersFilters.email ? { $contains: subscribersFilters.email } : undefined,
				name: subscribersFilters.name ? { $contains: subscribersFilters.name } : undefined,
				groups: groupIds.length > 0 ? { id: { $in: groupIds } } : undefined,
				createdAt: {
					...(subscribersFilters.dateFrom ? { $gte: dayjs(subscribersFilters.dateFrom).tz('Europe/Athens').startOf('day').toISOString() } : {}),
					...(subscribersFilters.dateTo ? { $lte: dayjs(subscribersFilters.dateTo).tz('Europe/Athens').endOf('day').toISOString() } : {}),
				},
			},
		}

		Object.keys(query.filters).forEach((key) => {
			if (query.filters[key] === undefined) delete query.filters[key]
		})

		setSubscribersQueryFilter(query)
		setHasAppliedFilters(true)

		// Count the filtered subscribers for export
		await countFilteredSubscribers()
	}

	// Delete selected subscribers function - using the same logic as single delete
	const deleteSelectedSubscribers = async () => {
		if (selectedSubscribers.length === 0) return

		PopupText.fire({
			text: `Do you really want to remove ${selectedSubscribers.length} subscriber(s)? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
			showCancelButton: true,
			cancelButtonText: 'No, abort',
		}).then(async (result) => {
			if (result.isConfirmed) {
				let successCount = 0

				// Process each subscriber sequentially
				for (const subscriber of selectedSubscribers) {
					try {
						const deleteResponse = await ApiService.post(`fairymailer/removeSubscriber`, { data: subscriber }, user.jwt)
						if (deleteResponse) {
							successCount++
						}
					} catch (error) {
						console.error(`Error deleting subscriber ${subscriber.email}:`, error)
					}
				}

				// Clear selection and refresh the list
				setSelectedSubscribers([])
				onUpdate()

				// Only show success message if at least one deletion was successful
				if (successCount > 0) {
					PopupText.fire({
						text: `${successCount} subscriber(s) removed successfully.`,
						icon: 'success',
					})
				}
			}
		})
	}

	const getSubscribers = async () => {
		try {
			const resp = await ApiService.get(
				`fairymailer/getSubscribers?sort[0]=createdAt:desc&filters[active]=true&[email][$contains]=${subscriberSearchValue}&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1`,
				user.jwt
			)
			if (resp.data && resp.data.data) setSubscribers(resp.data.data)
			if (resp.data && resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)
		} catch (error) {
			console.error('Error fetching subscribers:', error)
			PopupText.fire({
				text: 'Error fetching subscribers. Please try again later.',
				icon: 'error',
			})
		}
	}

	const getGroups = async (page = 1, searchTerm = '') => {
		// Prevent duplicate calls
		if (groupsLoading) return

		setGroupsLoading(true)
		const query = {
			pagination: {
				pageSize: 1000,
				page,
			},
			...(searchTerm && {
				filters: {
					name: {
						$contains: searchTerm,
					},
				},
			}),
		}
		const queryString = qs.stringify(query, { encode: false })

		try {
			const resp = await ApiService.get(`fairymailer/getGroups?${queryString}&populate[subscribers][count]=true`, user.jwt)

			if (resp.data && resp.data.data) {
				setGroups(resp.data.data)
				setTotalGroups(resp.data.meta.pagination.total)
			}
		} catch (error) {
			console.error('Error fetching groups:', error)
			PopupText.fire({
				text: 'Error fetching groups. Please try again later.',
				icon: 'error',
			})
		} finally {
			setGroupsLoading(false)
		}
	}

	// Get segments
	const getSegments = async (searchTerm = '') => {
		if (segmentsLoading) return

		setSegmentsLoading(true)
		try {
			const response = await ApiService.get('fairymailer/getSegments', user.jwt)

			console.log('Segments API response:', response.data) // Debug log

			if (response.data && response.data.data) {
				// Filter by search term if provided
				let filteredSegments = response.data.data

				// Log all segments to see what we're getting
				console.log('All segments before filtering:', filteredSegments)

				if (searchTerm) {
					filteredSegments = filteredSegments.filter((segment) => segment.name.toLowerCase().includes(searchTerm.toLowerCase()))
				}

				// Only show segments that are not explicitly marked as inactive
				// Changed from "active !== false" to be more inclusive
				filteredSegments = filteredSegments.filter((segment) => segment.active !== false)

				console.log('Filtered segments to display:', filteredSegments)

				setSegments(filteredSegments)
				setTotalSegments(filteredSegments.length)
			} else {
				console.log('No segments data found in response')
				setSegments([])
				setTotalSegments(0)
			}
		} catch (error) {
			console.error('Error fetching segments:', error)
			PopupText.fire({
				text: 'Error fetching segments. Please try again later.',
				icon: 'error',
			})
			setSegments([])
			setTotalSegments(0)
		} finally {
			setSegmentsLoading(false)
		}
	}

	// Search segments
	const searchSegments = (searchTerm) => {
		setSegmentSearchValue(searchTerm)
		getSegments(searchTerm)
	}

	// Get history data
	const getHistory = async () => {
		if (historyLoading) return

		setHistoryLoading(true)
		try {
			const response = await ApiService.get('fairymailer/subscribers-history', user.jwt)

			if (response.data && response.data.data) {
				setHistoryData(response.data.data)
				setTotalHistory(response.data.data.length)
			} else {
				setHistoryData([])
				setTotalHistory(0)
			}
		} catch (error) {
			console.error('Error fetching history:', error)
			PopupText.fire({
				text: 'Error fetching history. Please try again later.',
				icon: 'error',
			})
			setHistoryData([])
			setTotalHistory(0)
		} finally {
			setHistoryLoading(false)
		}
	}

	// Apply segment filter
	const applySegmentFilter = (segment) => {
		setShowFilters(true)

		// Apply the filters from the segment
		const newFilters = { ...subscribersFilters }

		// Reset filters first
		newFilters.email = ''
		newFilters.name = ''
		newFilters.groups = []
		newFilters.dateFrom = ''
		newFilters.dateTo = ''

		// Apply email filter
		if (segment.filters?.email?.$contains) {
			newFilters.email = segment.filters.email.$contains
		}

		// Apply name filter
		if (segment.filters?.name?.$contains) {
			newFilters.name = segment.filters.name.$contains
		}

		// Apply date filters
		if (segment.filters?.createdAt?.$gte) {
			newFilters.dateFrom = new Date(segment.filters.createdAt.$gte)
		}

		if (segment.filters?.createdAt?.$lte) {
			newFilters.dateTo = new Date(segment.filters.createdAt.$lte)
		}

		// Apply group filters
		if (segment.filters?.groups?.id?.$in && segment.filters.groups.id.$in.length > 0) {
			const groupIds = segment.filters.groups.id.$in

			// Find the matching groups
			const selectedGroups = groups
				.filter((group) => groupIds.includes(group.id))
				.map((group) => ({
					value: group.udid,
					label: group.name,
				}))

			newFilters.groups = selectedGroups
		}

		setSubscribersFilters(newFilters)

		// Apply the filters
		setAutoAppliedFilters(true)
		filterSubscribersAction()

		// Show a notification
		PopupText.fire({
			text: `Applied segment "${segment.name}" as filter`,
			icon: 'success',
			timer: 2000,
			showConfirmButton: false,
		})
	}

	// Initial load of groups when user is available
	useEffect(() => {
		if (user && groups.length === 0 && !groupsLoading) {
			getGroups(1, '')
		}
	}, [user])

	// Load segments when the view is set to segments
	useEffect(() => {
		if (user && view === 'segments' && segments.length === 0 && !segmentsLoading) {
			getSegments('')
		}
	}, [user, view])

	// Load history when the view is set to history
	useEffect(() => {
		if (user && view === 'history' && historyData.length === 0 && !historyLoading) {
			getHistory()
		}
	}, [user, view])

	// Load subscriber stats when the view is set to stats
	useEffect(() => {
		if (user && view === 'stats' && !statsData && !statsLoading) {
			fetchSubscriberStats()
		}
	}, [user, view, statsData, statsLoading, fetchSubscriberStats])

	// Handle search term changes for groups
	useEffect(() => {
		if (!user || view !== 'groups') return

		// Use a small debounce to prevent too many API calls
		const timeoutId = setTimeout(() => {
			getGroups(1, groupSearchValue)
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [groupSearchValue, view, user])

	// Update the URL when view changes for better navigation
	useEffect(() => {
		if (view && view !== 'subs') {
			// Don't update URL if we're already there
			if (!location.pathname.includes(`/subscribers/${view}`)) {
				navigate(`/subscribers/${view}`, { replace: true })
			}
		} else if (view === 'subs' && location.pathname !== '/subscribers') {
			navigate('/subscribers', { replace: true })
		}
	}, [view, navigate, location])

	const handleAddSubscribersClick = () => {
		// Reset to manual mode when opening the add subscribers view
		setImportMode('manual')
		setView('import')
	}

	const searchSubscribers = async (searchTerm) => {
		try {
			const resp = await ApiService.get(
				`fairymailer/getSubscribers?sort[0]=createdAt:desc&filters[active]=true&filters[email][$contains]=${searchTerm}&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1`,
				user.jwt
			)

			if (resp.data && resp.data.data) {
				setSubscribers(resp.data.data)
				if (resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)
			}
		} catch (error) {
			console.error('Error searching subscribers:', error)
			PopupText.fire({
				text: 'Error searching subscribers. Please try again.',
				icon: 'error',
			})
		}
	}

	const searchGroups = (searchTerm) => {
		// Just update the search term state
		// The useEffect will handle the API call
		setGroupSearchValue(searchTerm)
	}

	const renderAddButton = () => {
		switch (view) {
			case 'subs':
				return (
					<div className="action-buttons">
						{selectedSubscribers.length > 0 && (
							<Button type="secondary" onClick={deleteSelectedSubscribers} style={{ marginRight: '10px' }}>
								Delete Selected ({selectedSubscribers.length})
							</Button>
						)}
						{hasAppliedFilters && filteredCount > 0 && (
							<Button type="secondary" onClick={exportSubscribers} loading={isExporting} style={{ marginRight: '10px' }} icon="Download">
								{isExporting ? 'Exporting...' : `Export (${filteredCount})`}
							</Button>
						)}
						<Button icon={'Plus'} type="action" onClick={handleAddSubscribersClick}>
							Add Subscribers
						</Button>
					</div>
				)
			case 'groups':
				return (
					<Button onClick={() => navigate('/subscribers/group/new')} icon={'Plus'} type="action">
						Add Group
					</Button>
				)
			case 'segments':
				return (
					<Button onClick={() => navigate('/subscribers/segment/new')} icon={'Plus'} type="action">
						Add Segment
					</Button>
				)
			case 'fields':
				return (
					<Button onClick={() => navigate('/subscribers/field/new')} icon={'Plus'} type="action">
						Add Custom Field
					</Button>
				)
			case 'import':
				return null // No button in import view - we'll use the GoBackButton instead
			default:
				return <></>
		}
	}

	const onUpdate = async () => {
		// Reload data based on current view
		if (view === 'groups') {
			await getGroups(1, groupSearchValue)
		} else if (view === 'segments') {
			await getSegments(segmentSearchValue)
		} else if (view === 'history') {
			await getHistory()
		} else {
			autoAppliedFilters === true ? filterSubscribersAction() : getSubscribers()
		}
	}

	useEffect(() => {
		if (user) {
			// Don't load groups here, it's handled by other useEffects
			autoAppliedFilters === true ? filterSubscribersAction() : getSubscribers()
		}
	}, [user, autoAppliedFilters])

	useEffect(() => {
		if (filterString && groups && groups.length > 0) {
			setShowFilters(true)

			try {
				const objfrombase64 = JSON.parse(atob(filterString))
				console.log('Filter String:', objfrombase64)
				const groupIdToFilter = groupOptions.find((grp) => {
					return grp.value === objfrombase64.group_udid
				})
				console.log('groupIdToFilter', groupIdToFilter)
				if (groupIdToFilter) {
					setSubscribersFilters((prev) => ({
						...prev,
						groups: [groupIdToFilter],
					}))
					setAutoAppliedFilters(true)
				}
			} catch (error) {
				console.error('Error parsing filter string:', error)
			}
		}
	}, [filterString, groups])

	useEffect(() => {
		if (account) {
		}
	}, [account])

	const renderImportOptions = () => {
		// Only render this section if we're in the import view
		if (view !== 'import') return null

		// Make sure we have a valid user and account before rendering
		if (!user) {
			return <Card>Please log in to continue</Card>
		}

		// Check if groups array is available to prevent errors
		if (!groups || groups.length === 0) {
			return (
				<Card>
					<div className="text-center p-4">
						<p>You need to create a group before adding subscribers.</p>
						<Button onClick={() => navigate('/subscribers/group/new')} style={{ marginTop: '15px' }}>
							Create Group
						</Button>
					</div>
				</Card>
			)
		}

		// Render the import options with proper checks
		return (
			<div className="import-options">
				<div className="button-group-wrapper">
					<ButtonGroup
						options={[
							{ value: 'manual', label: 'Add Single Subscriber' },
							{ value: 'bulk', label: 'Bulk Import from CSV' },
						]}
						onChange={(value) => setImportMode(value)}
						value={importMode}
					/>
				</div>

				{importMode === 'manual' ? (
					<AddSubscriber
						groups={groups}
						customFields={account?.fields || []}
						onSubscriberAdded={() => {
							onUpdate()
							// Optionally return to the subscribers list after adding
							// setView('subs');
						}}
					/>
				) : (
					<ImportCSV
						groups={groups}
						onImportComplete={() => {
							setView('subs')
							onUpdate()
						}}
					/>
				)}
			</div>
		)
	}

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />

					{view === 'import' && <GoBackButton onClick={() => setView('subs')} destination="/subscribers" />}

					<div className="page-name-container">
						{view === 'subs' && <div className="page-name">Subscribers</div>}
						{view === 'groups' && <div className="page-name">Groups</div>}
						{view === 'fields' && <div className="page-name">Fields</div>}
						{view === 'segments' && <div className="page-name">Segments</div>}
						{view === 'import' && <div className="page-name">{importMode === 'manual' ? 'Add Subscriber' : 'Import Subscribers'}</div>}
						{view === 'cleanup' && <div className="page-name">Cleanup Subscribers</div>}
						{view === 'history' && <div className="page-name">History</div>}
						{view === 'stats' && <div className="page-name">Stats</div>}
						{renderAddButton()}
					</div>

					{view !== 'import' && (
						<div className="filters-container">
							<div className="button-group-wrapper">
								<ButtonGroup
									options={[
										{ value: 'subs', label: `All Subscribers (${totalSubs})` },
										{ value: 'segments', label: `Segments (${totalSegments})` },
										{ value: 'groups', label: `Groups (${totalGroups})` },
										{ value: 'fields', label: `Fields` },
										{ value: 'history', label: `History` },
										{ value: 'stats', label: `Stats` },
										{ value: 'cleanup', label: `Clean up` },
									]}
									onChange={(value) => {
										setView(value)
										setShowFilters(false)
										setHasAppliedFilters(false)
										setFilteredCount(0)
									}}
									value={view}
								></ButtonGroup>
							</div>

							{view === 'subs' && (
								<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<SearchBar
										placeholder="Search Subscribers"
										label="Search Subscribers"
										initialValue={subscriberSearchValue}
										onSearch={(value) => {
											setSubscriberSearchValue(value)
											searchSubscribers(value)
											// Reset filter state when searching
											setHasAppliedFilters(false)
											setFilteredCount(0)
										}}
										style={{ width: '100%', marginRight: '20px' }}
									/>
									<Button
										type="secondary"
										icon={'Filters'}
										className="button-filters"
										onClick={() => {
											setShowFilters((prev) => !prev)
										}}
									>
										Filters
									</Button>
								</div>
							)}

							{/* Show filtered count info */}
							{view === 'subs' && hasAppliedFilters && (
								<div
									className="filtered-info"
									style={{
										marginTop: '10px',
										padding: '10px',
										backgroundColor: 'rgba(255, 195, 173, 0.3)',
										border: '1px solid rgba(255, 99, 93, 0.5)',
										borderRadius: '8px',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<span>{filteredCount > 0 ? `Found ${filteredCount} subscriber(s) matching your filters` : 'No subscribers match your current filters'}</span>
									{filteredCount > 0 && (
										<Button type="primary" onClick={exportSubscribers} loading={isExporting} icon="Download" style={{ marginLeft: '10px' }}>
											{isExporting ? 'Exporting...' : `Export ${filteredCount} subscribers`}
										</Button>
									)}
								</div>
							)}

							{view === 'groups' && (
								<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<SearchBar placeholder="Search Groups" label="Search Groups" initialValue={groupSearchValue} onSearch={searchGroups} style={{ width: '100%' }} />
								</div>
							)}

							{view === 'segments' && (
								<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									<SearchBar placeholder="Search Segments" label="Search Segments" initialValue={segmentSearchValue} onSearch={searchSegments} style={{ width: '100%' }} />
								</div>
							)}
						</div>
					)}

					<Card style={{ display: showFilters ? 'flex' : 'none' }} className={'d-flex flex-column subscriber-filters-card gap-20 mt20'}>
						<div className="d-flex gap-20 ">
							<InputText value={subscribersFilters.email} onChange={(e) => handleFilterChange('email', e.target.value)} label={'Email Contains'}></InputText>
							<InputText value={subscribersFilters.name} onChange={(e) => handleFilterChange('name', e.target.value)} label={'Name'}></InputText>
							<MultipleDropdown
								placeholder="Belongs to group"
								style={{ width: 'auto' }}
								options={groupOptions}
								selectedValues={subscribersFilters.groups}
								onOptionSelect={handleSelection}
							/>
						</div>
						<div className="d-flex gap-20">
							<DatePicker
								hasMinDate={false}
								hasDefaultDate={false}
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(e) => {
									console.log('selected date', e)
									handleFilterChange('dateFrom', e)
								}}
								value={subscribersFilters.dateFrom}
							></DatePicker>
							<DatePicker
								hasMinDate={false}
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(e) => {
									console.log('selected date', e)
									handleFilterChange('dateTo', e)
								}}
								value={subscribersFilters.dateTo}
							></DatePicker>
							<div style={{ marginTop: '24px' }}>
								<Checkbox 
									checked={subscribersFilters.active} 
									label="Only Active Subscribers" 
									onChange={(checked) => handleFilterChange('active', checked)}
								/>
							</div>
						</div>
						<div>
							<Button onClick={filterSubscribersAction}>Apply Filters</Button>
						</div>
					</Card>

					{view === 'subs' && (
						<div className="subscribers">
							<SubscribersTable
								subscriberSearchValue={subscriberSearchValue}
								subscribersQueryFilter={subscribersQueryFilter}
								onUpdate={onUpdate}
								setView={setView}
								selectedSubscribers={selectedSubscribers}
								setSelectedSubscribers={setSelectedSubscribers}
							/>
						</div>
					)}

					{view === 'groups' && (
						<div className="groups">
							<GroupsTable groupSearchValue={groupSearchValue} onUpdate={onUpdate} setView={setView} groups={groups} totalResults={totalGroups} loading={groupsLoading} />
						</div>
					)}

					{view === 'segments' && (
						<div className="segments">
							<SegmentsTable
								segmentSearchValue={segmentSearchValue}
								onUpdate={() => getSegments(segmentSearchValue)}
								setView={setView}
								segments={segments}
								totalResults={totalSegments}
								loading={segmentsLoading}
								applySegmentFilter={applySegmentFilter}
							/>
						</div>
					)}

					{view === 'fields' && (
						<div className="groups">
							<CustomFieldsTable setView={setView} />
						</div>
					)}

					{view === 'cleanup' && (
						<div className="subscribers-cleanup-container">
							<SubscribersCleanup user={user} account={account} groups={groups} onUpdate={onUpdate} />
						</div>
					)}

					{view === 'history' && (
						<div className="history">
							<HistoryTable historyData={historyData} totalResults={totalHistory} loading={historyLoading} />
						</div>
					)}

					{view === 'stats' && (
						<div className="subscribers-stats">
							{statsLoading ? (
								<div style={{ textAlign: 'center', padding: '40px 20px' }}>
									<p>Loading stats data...</p>
								</div>
							) : statsError ? (
								<div style={{ textAlign: 'center', padding: '40px 20px' }}>
									<p style={{ color: '#ff635d' }}>Error: {statsError}</p>
									<Button type="primary" onClick={fetchSubscriberStats} style={{ marginTop: '10px' }}>
										Retry
									</Button>
								</div>
							) : (
								<>
									{/* Top Stats Cards */}
									<div className="figma-top-stats">
										<Card className="figma-stat-card">
											<div className="figma-stat-title">Avg open rate</div>
											<div className="figma-stat-value">{statsData?.campaignMetrics?.avgOpenRate ? `${statsData.campaignMetrics.avgOpenRate.toFixed(2)}%` : '0.00%'}</div>
										</Card>
										<Card className="figma-stat-card">
											<div className="figma-stat-title">Avg click rate</div>
											<div className="figma-stat-value">{statsData?.campaignMetrics?.avgClickRate ? `${statsData.campaignMetrics.avgClickRate.toFixed(2)}%` : '0.00%'}</div>
										</Card>
										<Card className="figma-stat-card">
											<div className="figma-stat-title">New subscribers (30d)</div>
											<div className="figma-stat-value">{statsData?.subscriberMetrics?.last30Days || 0}</div>
										</Card>
										<Card className="figma-stat-card">
											<div className="figma-stat-title">Total Subscribers</div>
											<div className="figma-stat-value">{statsData?.subscriberMetrics?.total || 0}</div>
										</Card>
									</div>
								</>
							)}

							{!statsLoading && !statsError && (
								<>
									{/* Subscribers Chart Card */}
									<Card className="figma-stats-card">
										<div className="figma-card-header">
											<h2 className="figma-card-title">Subscribers</h2>
											<div className="figma-chart-time-selector">
												<ButtonGroup
													options={[
														{ value: 'Today', label: 'Today' },
														{ value: '7 Days', label: '7 Days' },
														{ value: '30 Days', label: '30 Days' },
														{ value: 'All', label: 'All' },
													]}
													onChange={(value) => setStatsTimePeriod(value)}
													value={statsTimePeriod}
												/>
											</div>
										</div>

										<div className="figma-chart-area">
											<AreaChart
												timeseriesData={getTimeseriesData()}
												dataset1Key="subs_added"
												dataset2Key="subs_removed"
												dataset1Label="Subscribers Added"
												dataset2Label="Subscribers Removed"
												dataset1Color="#2FBF2F"
												dataset2Color="#FF635D"
											/>
										</div>
									</Card>

									{/* Device Type and Email Clients Cards */}
									<div className="figma-two-columns">
										<Card className="figma-stats-card">
											<div className="figma-card-header">
												<h2 className="figma-card-title">Device Type</h2>
											</div>
											<div className="figma-donut-wrapper">
												{statsData?.deviceAnalytics?.deviceType?.counts ? (
													<DoughnutChart stats={getDeviceTypeData()} />
												) : (
													<div style={{ textAlign: 'center', padding: '40px' }}>
														<p>No device data available</p>
													</div>
												)}
											</div>
										</Card>

										<Card className="figma-stats-card">
											<div className="figma-card-header">
												<h2 className="figma-card-title">Email Clients</h2>
											</div>
											<div className="figma-email-clients-content">
												{emailClientsEntries.length > 0 ? (
													<>
														<div className="d-flex content-space-between" style={{ borderBottom: '2px solid rgba(218, 209, 197, 1)' }}>
															<p className="stat-table-heading">Clients</p>
															<p className="stat-table-heading">Subscribers</p>
														</div>
														{paginatedEmailClients.map(([key, value]) => (
															<div
																className="d-flex content-space-between mt20"
																style={{ textAlign: 'left', border: '2px solid rgba(218, 209, 197, 1)', padding: '12px', borderRadius: '8px' }}
																key={key}
															>
																<p>{key}</p>
																<p>{value}</p>
															</div>
														))}

														{totalEmailClientsPages > 1 && (
															<div className="figma-pagination-wrapper">
																<Pagination currentPage={emailClientsPage} totalPages={totalEmailClientsPages} onPageChange={(page) => setEmailClientsPage(page)} />
															</div>
														)}
													</>
												) : (
													<div style={{ textAlign: 'center', padding: '40px' }}>
														<p>No email client data available</p>
													</div>
												)}
											</div>
										</Card>
									</div>
								</>
							)}
						</div>
					)}

					{/* Import options section with proper rendering */}
					{renderImportOptions()}
				</div>
			</div>
		</>
	)
}

export default Subscribers
