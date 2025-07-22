import SubscribersTable from '../../components/DataTable/SubscribersTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './subscribers.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import GroupsTable from '../../components/DataTable/GroupsTable'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import DatePicker from '../../components/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import CustomFieldsTable from '../../components/DataTable/CustomFieldsTable'
import ImportCSV from './ImportCSV'
import SubscribersCleanup from './SubscribersCleanup';
import './SubscribersCleanup.scss';
import AddSubscriber from './AddSubscriber'
import PopupText from '../../components/PopupText/PopupText'
import SearchBar from '../../components/SearchBar/SearchBar';
import GoBackButton from '../../components/GoBackButton'

dayjs.extend(utc)
dayjs.extend(timezone)

import qs from 'qs'

const Subscribers = ({ initialView }) => {
	const navigate = useNavigate()
	const location = useLocation()

	const { filterString } = useParams()

	// const [resultsPerPage, setResultsPerPage] = useState(10)
	const [totalGroups, setTotalGroups] = useState(0)
	// const [currentGroupPage, setCurrentGroupPage] = useState(1)

	const { user, account } = useAccount()
	const [subscribers, setSubscribers] = useState([])
	const [totalSubs, setTotalSubs] = useState(0)
	const [groups, setGroups] = useState([])
	const [groupsLoading, setGroupsLoading] = useState(false)

	// State to track selected subscribers
	const [selectedSubscribers, setSelectedSubscribers] = useState([])

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
	})
	const [autoAppliedFilters, setAutoAppliedFilters] = useState(false)
	const [subscribersQueryFilter, setSubscribersQueryFilter] = useState('')

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

	const filterSubscribersAction = async () => {
		const groupIds = subscribersFilters.groups
			.map((selected) => {
				const matchedGroup = groups.find((group) => group.udid === selected.value)
				return matchedGroup ? matchedGroup.id : null
			})
			.filter((id) => id !== null)

		const query = {
			sort: ['createdAt:desc'],
			pagination: {
				pageSize: 1000,
				page: 1,
			},
			filters: {
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
	}

	// Delete selected subscribers function - using the same logic as single delete
	const deleteSelectedSubscribers = async () => {
		if (selectedSubscribers.length === 0) return

		PopupText.fire({
			text: `Do you really want to remove ${selectedSubscribers.length} subscriber(s)? This action will unsubscribe them from all groups until they subscribe again manually.`,
			confirmButtonText: 'Yes, delete.',
			showCancelButton: true,
			cancelButtonText: 'No, abort'
		}).then(async (result) => {
			if (result.isConfirmed) {
				let successCount = 0;
				
				// Process each subscriber sequentially
				for (const subscriber of selectedSubscribers) {
					try {
						const deleteResponse = await ApiService.post(
							`fairymailer/removeSubscriber`, 
							{ data: subscriber }, 
							user.jwt
						)
						if (deleteResponse) {
							successCount++;
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
				icon: 'error'
			})
		}
	}

	const getGroups = async (page = 1, searchTerm = '') => {
		// Prevent duplicate calls
		if (groupsLoading) return;
		
		setGroupsLoading(true);
		const query = {
			pagination: {
				pageSize: 1000,
				page,
			},
			...(searchTerm && {
				filters: {
					name: {
						$contains: searchTerm
					}
				}
			})
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
				icon: 'error'
			})
		} finally {
			setGroupsLoading(false);
		}
	}

	// Initial load of groups when user is available
	useEffect(() => {
		if (user && groups.length === 0 && !groupsLoading) {
			getGroups(1, '');
		}
	}, [user])

	// Handle search term changes for groups
	useEffect(() => {
		if (!user || view !== 'groups') return;
		
		// Use a small debounce to prevent too many API calls
		const timeoutId = setTimeout(() => {
			getGroups(1, groupSearchValue);
		}, 300);
		
		return () => clearTimeout(timeoutId);
	}, [groupSearchValue, view, user])

	// Update the URL when view changes for better navigation
	useEffect(() => {
		if (view && view !== 'subs') {
			// Don't update URL if we're already there
			if (!location.pathname.includes(`/subscribers/${view}`)) {
				navigate(`/subscribers/${view}`, { replace: true });
			}
		} else if (view === 'subs' && location.pathname !== '/subscribers') {
			navigate('/subscribers', { replace: true });
		}
	}, [view, navigate, location]);

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
			);
			
			if (resp.data && resp.data.data) {
			setSubscribers(resp.data.data);
			if (resp.data.meta) setTotalSubs(resp.data.meta.pagination.total);
			}
		} catch (error) {
			console.error('Error searching subscribers:', error);
			PopupText.fire({
			text: 'Error searching subscribers. Please try again.',
			icon: 'error'
			});
		}
	};

	const searchGroups = (searchTerm) => {
		// Just update the search term state
		// The useEffect will handle the API call
		setGroupSearchValue(searchTerm);
	};

	const renderAddButton = () => {
		switch (view) {
			case 'subs':
				return (
					<div className="action-buttons">
						{selectedSubscribers.length > 0 && (
							<Button 
								type="secondary" 
								onClick={deleteSelectedSubscribers}
								style={{ marginRight: '10px' }}
							>
								Delete Selected ({selectedSubscribers.length})
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
			case 'fields':
				return (
					<Button onClick={() => navigate('/subscribers/field/new')} icon={'Plus'} type="action">
						Add Custom Field
					</Button>
				)
			case 'import':
				return null; // No button in import view - we'll use the GoBackButton instead
			default:
				return <></>
		}
	}

	const onUpdate = async () => {
		// Reload groups when called (e.g., after delete)
		if (view === 'groups') {
			await getGroups(1, groupSearchValue);
		}
		autoAppliedFilters === true ? filterSubscribersAction() : getSubscribers()
	}

	useEffect(() => {
		if (user) {
			// Don't load groups here, it's handled by other useEffects
			autoAppliedFilters === true ? filterSubscribersAction() : getSubscribers()
		}
		// Remove subscribersFilters from the dependency array
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

	useEffect(()=>{
		if(account){
			
		}
	},[account])
	
	const renderImportOptions = () => {
		// Only render this section if we're in the import view
		if (view !== 'import') return null;
		
		// Make sure we have a valid user and account before rendering
		if (!user) {
			return <Card>Please log in to continue</Card>;
		}
		
		// Check if groups array is available to prevent errors
		if (!groups || groups.length === 0) {
			return (
				<Card>
					<div className="text-center p-4">
						<p>You need to create a group before adding subscribers.</p>
						<Button 
							onClick={() => navigate('/subscribers/group/new')} 
							style={{ marginTop: '15px' }}
						>
							Create Group
						</Button>
					</div>
				</Card>
			);
		}
		
		// Render the import options with proper checks
		return (
			<div className="import-options">
				<div className="button-group-wrapper">
					<ButtonGroup
						options={[
							{ value: 'manual', label: 'Add Single Subscriber' },
							{ value: 'bulk', label: 'Bulk Import from CSV' }
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
							onUpdate();
							// Optionally return to the subscribers list after adding
							// setView('subs');
						}}
					/>
				) : (
					<ImportCSV 
						groups={groups} 
						onImportComplete={() => {
							setView('subs');
							onUpdate();
						}} 
					/>
				)}
			</div>
		);
	};
	
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					
					{view === 'import' && (
						<GoBackButton onClick={() => setView('subs')} destination="/subscribers" />
					)}
					
					<div className="page-name-container">
						{view === 'subs' && <div className="page-name">Subscribers</div>}
						{view === 'groups' && <div className="page-name">Groups</div>}
						{view === 'fields' && <div className="page-name">Fields</div>}
						{view === 'import' && (
							<div className="page-name">
								{importMode === 'manual' ? 'Add Subscriber' : 'Import Subscribers'}
							</div>
						)}
						{view === 'cleanup' && <div className="page-name">Cleanup Subscribers</div>}
						{view === 'segments' && <div className="page-name">Segments</div>}
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
									{ value: 'segments', label: `Segments (0)` },
									{ value: 'groups', label: `Groups (${totalGroups})` },
									{ value: 'fields', label: `Fields` },
									{ value: 'history', label: `History` },
									{ value: 'stats', label: `Stats` },
									{ value: 'cleanup', label: `Clean up` },
								]}
								onChange={(value) => {
									setView(value)
									setShowFilters(false)
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
									setSubscriberSearchValue(value);
									searchSubscribers(value);
								}}
								style={{ width: '100%', marginRight: '20px' }}
								/>
								<Button
								type="secondary"
								icon={'Filters'}
								className="button-filters"
								onClick={() => {
									setShowFilters((prev) => !prev);
								}}
								>
								Filters
								</Button>
							</div>
							)}


							{view === 'groups' && (
							<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<SearchBar
								placeholder="Search Groups"
								label="Search Groups"
								initialValue={groupSearchValue}
								onSearch={searchGroups}
								style={{ width: '100%' }}
								/>
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
							<GroupsTable 
								groupSearchValue={groupSearchValue} 
								onUpdate={onUpdate} 
								setView={setView}
								groups={groups}
								totalResults={totalGroups}
								loading={groupsLoading}
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
						<SubscribersCleanup 
						user={user} 
						account={account} 
						groups={groups}
						onUpdate={onUpdate}
						/>
					</div>
					)}
					
					{view === 'segments' && (
					  <Card>
						<div style={{ textAlign: 'center', padding: '40px 20px' }}>
						  <h3 style={{ marginBottom: '15px', fontFamily: 'Bitter, serif', fontWeight: 600 }}>
							Segments Under Construction
						  </h3>
						  <p>This feature is coming soon. Stay tuned!</p>
						</div>
					  </Card>
					)}

					{view === 'history' && (
					  <Card>
						<div style={{ textAlign: 'center', padding: '40px 20px' }}>
						  <h3 style={{ marginBottom: '15px', fontFamily: 'Bitter, serif', fontWeight: 600 }}>
							History Under Construction
						  </h3>
						  <p>This feature is coming soon. Stay tuned!</p>
						</div>
					  </Card>
					)}

					{view === 'stats' && (
					  <Card>
						<div style={{ textAlign: 'center', padding: '40px 20px' }}>
						  <h3 style={{ marginBottom: '15px', fontFamily: 'Bitter, serif', fontWeight: 600 }}>
							Stats Under Construction
						  </h3>
						  <p>This feature is coming soon. Stay tuned!</p>
						</div>
					  </Card>
					)}
					
					{/* Import options section with proper rendering */}
					{renderImportOptions()}
				</div>
			</div>
		</>
	)
}

export default Subscribers