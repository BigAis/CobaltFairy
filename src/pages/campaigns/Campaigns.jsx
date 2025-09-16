import CampaignsTable from '../../components/DataTable/CampaignsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import './Campaigns.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { ApiService } from '../../service/api-service'
import PopupText from '../../components/PopupText/PopupText'
import TemplateCard from '../../components/TemplateCard/TemplateCard'
import TemplatePreview from '../../components/TemplatePreview/TemplatePreview'
import CampaignCalendar from './CampaignCalendar'
import { v4 as uuidv4 } from 'uuid'
import SearchBar from '../../components/SearchBar/SearchBar'
import DatePicker from '../../components/DatePicker'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import Pagination from '../../components/Pagination'

const Campaigns = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const [dropdownViewer, setDropdownViewer] = useState('campaigns')
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'

	const { user, account, createNotification } = useAccount()
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [itemsPerPage, setItemsPerPage] = useState(100)
	const [currentPage, setCurrentPage] = useState(1)
	const [campaigns, setCampaigns] = useState([])
	const [filteredCampaigns, setFilteredCampaigns] = useState([])
	const [templates, setTemplates] = useState([])
	const [expandedCampaign, setExpandedCampaign] = useState(null)
	const [actionMenuCampaign, setActionMenuCampaign] = useState(null)

	const [campaignsMeta, setCampaignsMeta] = useState([])
	const [selectedCampaignType, setSelectedCampaignType] = useState('sent')

	// New state for filters
	const [showFilters, setShowFilters] = useState(false)
	// Calculate default dates (last 30 days)
	const defaultFromDate = () => {
		const date = new Date()
		date.setDate(date.getDate() - 30)
		return date
	}

	const [campaignFilters, setCampaignFilters] = useState({
		dateFrom: defaultFromDate(),
		dateTo: new Date(),
		minOpenRate: '',
		maxOpenRate: '',
		minClickRate: '',
		maxClickRate: '',
		recipientGroups: [],
	})

	const totalCampaignsSent = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.sent : 0
	const totalCampaignsDraft = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.draft : 0
	const totalCampaignsOutBox = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.outbox : 0

	// Handle window resize for mobile detection
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Handle clicks outside of dropdown menus
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (actionMenuCampaign && !event.target.closest('.overview-button') && !event.target.closest('.campaign-dropdown-menu')) {
				setActionMenuCampaign(null)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [actionMenuCampaign])

	useEffect(() => {
		// Only load data initially, not on every account change
		if (!searchTerm) {
			getCampaigns()
			getTemplates()
		}
	}, [account])

	// handle URL-based tab initialization
	useEffect(() => {
		// Only process if account is loaded to avoid unnecessary resets
		if (!account) return

		// Set initial tab based on URL path
		const path = location.pathname
		let shouldRefreshData = false

		if (path === '/campaigns') {
			// Get the last active tab from localStorage, default to 'sent' if none
			const lastActiveTab = localStorage.getItem('fairymail_last_active_tab') || 'sent'

			// Navigate to the appropriate tab URL
			if (lastActiveTab) {
				navigate(`/campaigns/${lastActiveTab}`, { replace: true })
				return // Exit early as we're redirecting
			}
		} else if (path.includes('/campaigns/sent')) {
			if (selectedCampaignType !== 'sent' || dropdownViewer !== 'campaigns') {
				setDropdownViewer('campaigns')
				setSelectedCampaignType('sent')
				shouldRefreshData = true
			}
		} else if (path.includes('/campaigns/draft')) {
			if (selectedCampaignType !== 'draft' || dropdownViewer !== 'campaigns') {
				setDropdownViewer('campaigns')
				setSelectedCampaignType('draft')
				shouldRefreshData = true
			}
		} else if (path.includes('/campaigns/outbox')) {
			if (selectedCampaignType !== 'outbox' || dropdownViewer !== 'campaigns') {
				setDropdownViewer('campaigns')
				setSelectedCampaignType('outbox')
				shouldRefreshData = true
			}
		} else if (path.includes('/campaigns/templates')) {
			if (selectedCampaignType !== 'templates' || dropdownViewer !== 'templates') {
				setDropdownViewer('templates')
				setSelectedCampaignType('templates')
				shouldRefreshData = true
			}
		}

		// Refresh data if the tab changed from URL
		if (shouldRefreshData && !searchTerm) {
			if (path.includes('/campaigns/templates') || selectedCampaignType === 'templates') {
				getTemplates()
			} else {
				getCampaigns()
			}
		}
	}, [location.pathname, account, navigate])

	// Filter campaigns whenever selectedCampaignType or campaigns change
	useEffect(() => {
		if (campaigns && campaigns.length > 0) {
			const filtered = campaigns.filter((campaign) => {
				if (selectedCampaignType === 'sent') {
					return campaign.status === 'sent'
				} else if (selectedCampaignType === 'outbox') {
					return campaign.status === 'draft' && campaign.date // Drafts WITH a date
				} else if (selectedCampaignType === 'draft') {
					return campaign.status === 'draft' && !campaign.date // Drafts WITHOUT a date
				}
				return false
			})
			setFilteredCampaigns(filtered)
		} else {
			setFilteredCampaigns([])
		}
	}, [campaigns, selectedCampaignType])

	// Handle filter changes
	const handleFilterChange = (key, value) => {
		setCampaignFilters((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	// Handle group selection
	const handleGroupSelection = (selected) => {
		setCampaignFilters((prev) => ({
			...prev,
			recipientGroups: selected,
		}))
	}

	// Apply filters
	const applyCampaignFilters = async () => {
		try {
			setLoading(true)

			// Build API query with all filters
			let endpoint = `fairymailer/getCampaigns?sort[id]=desc&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=${itemsPerPage}&pagination[page]=${currentPage}`

			// Add campaign type filtering
			if (selectedCampaignType === 'sent') {
				endpoint += `&filters[status]=sent`
			} else if (selectedCampaignType === 'outbox') {
				endpoint += `&filters[status]=draft&filters[date][$notNull]=true`
			} else if (selectedCampaignType === 'draft') {
				endpoint += `&filters[status]=draft&filters[date][$null]=true`
			}

			// Add date range filtering
			if (campaignFilters.dateFrom) {
				const dateField = selectedCampaignType === 'sent' ? 'sent_at' : 'date'
				endpoint += `&filters[${dateField}][$gte]=${new Date(campaignFilters.dateFrom).toISOString()}`
			}

			if (campaignFilters.dateTo) {
				const dateField = selectedCampaignType === 'sent' ? 'sent_at' : 'date'
				endpoint += `&filters[${dateField}][$lte]=${new Date(campaignFilters.dateTo).toISOString()}`
			}

			// Add open/click rate filtering if applicable
			if (campaignFilters.minOpenRate) {
				endpoint += `&filters[stats][or][$gte]=${parseFloat(campaignFilters.minOpenRate)}`
			}

			if (campaignFilters.maxOpenRate) {
				endpoint += `&filters[stats][or][$lte]=${parseFloat(campaignFilters.maxOpenRate)}`
			}

			if (campaignFilters.minClickRate) {
				endpoint += `&filters[stats][cr][$gte]=${parseFloat(campaignFilters.minClickRate)}`
			}

			if (campaignFilters.maxClickRate) {
				endpoint += `&filters[stats][cr][$lte]=${parseFloat(campaignFilters.maxClickRate)}`
			}

			// Add recipient group filtering
			if (campaignFilters.recipientGroups.length > 0) {
				const groupIds = campaignFilters.recipientGroups.map((g) => g.value).join(',')
				endpoint += `&filters[recp_groups][id][$in]=${groupIds}`
			}

			console.log('API filter endpoint:', endpoint)

			// Make the API call with all filters
			const response = await ApiService.get(endpoint, user.jwt)

			if (response && response.data && response.data.data) {
				const filteredData = response.data.data.map((item) => ({
					...item,
					image: '/images/cmp.png',
				}))

				setCampaigns(filteredData)
				setFilteredCampaigns(filteredData)

				if (response.data.meta) {
					setCampaignsMeta(response.data.meta)
				}

				createNotification({
					message: `Found ${filteredData.length} campaigns matching your filters.`,
					type: 'default',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Error applying filters:', error)
			createNotification({
				message: 'Error filtering campaigns. Please try again.',
				type: 'warning',
				autoClose: 5000,
			})
		} finally {
			setLoading(false)
		}
	}

	// Create group options for dropdown
	const groupOptions = () => {
		// Get all groups from campaigns
		const allGroups = new Map()

		campaigns.forEach((campaign) => {
			if (campaign.recp_groups && campaign.recp_groups.length > 0) {
				campaign.recp_groups.forEach((group) => {
					const groupId = typeof group === 'object' ? group.id : group
					const groupName = typeof group === 'object' ? group.name : `Group ${groupId}`

					if (!allGroups.has(groupId.toString())) {
						allGroups.set(groupId.toString(), groupName)
					}
				})
			}
		})

		// Convert to array of options
		return Array.from(allGroups).map(([value, label]) => ({
			value,
			label,
		}))
	}

	// Updated search function with loading state
	const updateSearchTerm = async (search) => {
		try {
			// Set state for UI updates
			setSearchTerm(search)
			setLoading(true)

			// Skip search if empty
			if (!search.trim()) {
				getCampaigns()
				return
			}

			let endpoint = ''

			// Use appropriate endpoint based on viewer
			if (dropdownViewer === 'campaigns') {
				let outboxfilter = selectedCampaignType === 'outbox' ? '&filters[date][$notNull]=true' : selectedCampaignType === 'draft' ? '&filters[date][$null]=true' : ''

				endpoint = `fairymailer/getCampaigns?filters[name][$contains]=${search}&filters[status]=${
					selectedCampaignType === 'outbox' ? 'draft' : selectedCampaignType === 'draft' ? 'draft' : selectedCampaignType
				}${outboxfilter}&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=100&pagination[page]=1`
			} else {
				// For templates
				endpoint = `fairymailer/getTemplates?filters[name][$contains]=${search}&pagination[pageSize]=100&pagination[page]=1`
			}

			console.log('Search endpoint:', endpoint)

			let resp = await ApiService.get(endpoint, user.jwt)

			if (resp && resp.data) {
				if (dropdownViewer === 'campaigns') {
					const searchResults = resp.data.data.map((item) => ({
						...item,
						image: '/images/cmp.png',
					}))

					console.log('Search found:', searchResults.length, 'results')

					// Update campaigns and filtered campaigns
					setCampaigns(searchResults)
					// This will trigger the useEffect that updates filteredCampaigns
				} else {
					// For templates
					setTemplates(resp.data.data)
				}
			}
		} catch (error) {
			console.error('Error searching:', error)
			createNotification({
				message: `Error searching ${dropdownViewer}. Please try again.`,
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}

	const getCampaigns = async (page = 1) => {
		try {
			setLoading(true)
			let resp = await ApiService.get(
				`fairymailer/getCampaigns?sort[id]=desc&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=${itemsPerPage}&pagination[page]=${page}`,
				user.jwt
			)

			if (resp && resp.data && resp.data.data) {
				setCampaigns(
					resp.data.data.map((item) => ({
						...item,
						image: '/images/cmp.png',
					}))
				)

				setCampaignsMeta(resp.data.meta)
			}
			setLoading(false)
		} catch (error) {
			console.error(error)
			createNotification({
				message: 'Error loading campaigns. Please try again.',
				type: 'warning',
			})
			setLoading(false)
		}
	}

	const getTemplates = async (page = 1) => {
		try {
			let resp = await ApiService.get(`fairymailer/getTemplates?pagination[pageSize]=${itemsPerPage}&pagination[page]=${page}`, user.jwt)
			if (resp.data && resp.data.data) {
				setTemplates(resp.data.data)
			}
		} catch (error) {
			console.error(error)
			createNotification({
				message: 'Error loading templates. Please try again.',
				type: 'warning',
			})
		}
	}

	const refreshData = async () => {
		await getCampaigns()
		await getTemplates()
		createNotification({
			message: 'Data refreshed successfully',
			type: 'default',
			autoClose: 3000,
		})
	}

	const createTemplateByName = async (templateName) => {
		try {
			const templateUuid = uuidv4()
			const resp = await ApiService.post(`templates/`, { data: { uuid: templateUuid, name: templateName, account: account.id } }, user.jwt)
			if (resp && resp.data && resp.data.data) {
				createNotification({
					message: 'Template created successfully',
					type: 'default',
					autoClose: 3000,
				})
				navigate(`/templates/edit/${templateUuid}`)
			}
		} catch (error) {
			console.error(error)
			createNotification({
				message: 'Error creating template. Please try again.',
				type: 'warning',
			})
		}
	}
	// Toggle expand/collapse of a campaign card
	const toggleCampaignExpand = (campaignId) => {
		setExpandedCampaign(expandedCampaign === campaignId ? null : campaignId)
		// Close action menu when toggling expand/collapse
		setActionMenuCampaign(null)
	}

	// Toggle action menu for a campaign
	const toggleActionMenu = (e, campaignId) => {
		e.stopPropagation() // Prevent triggering the card expand/collapse
		setActionMenuCampaign(actionMenuCampaign === campaignId ? null : campaignId)
	}

	// Handle campaign actions

	const handleCampaignAction = (action, campaign) => {
		// Check if on mobile and trying to access editor for any campaign
		if (isMobile && action === 'edit') {
			PopupText.fire({
				icon: 'warning',
				text: 'Campaign editor is not available on mobile devices. Please use a desktop to design your campaign.',
				showCancelButton: false,
				confirmButtonText: 'OK',
			})
			return // Stop further execution
		}

		// Allow viewing overview even on mobile
		// Proceed with normal action handling
		switch (action) {
			case 'delete':
				// Implement delete logic
				PopupText.fire({
					icon: 'question',
					text: 'Are you sure you want to delete this campaign?',
					showCancelButton: true,
					confirmButtonText: 'Yes, delete it',
				}).then((result) => {
					if (result.isConfirmed) {
						// Delete logic here
						ApiService.post(`fairymailer/removeCampaign`, { data: { udid: campaign.uuid } }, user.jwt)
							.then(() => {
								refreshData()
								createNotification({
									message: 'Campaign deleted successfully',
									type: 'default',
									autoClose: 3000,
								})
							})
							.catch((error) => {
								console.error('Error deleting campaign:', error)
								createNotification({
									message: 'Failed to delete campaign. Please try again.',
									type: 'warning',
									autoClose: 5000,
								})
							})
					}
				})
				break
			case 'duplicate':
				// Duplicate logic
				PopupText.fire({
					icon: 'question',
					text: 'Please type a title for the new campaign',
					inputField: true,
					focusCancel: false,
					showConfirmButton: true,
					showDenyButton: false,
					showCancelButton: true,
					confirmButtonText: 'Continue',
					cancelButtonText: 'Cancel',
				}).then((result) => {
					if (result.isConfirmed) {
						const newUuid = uuidv4()
						const newCampaign = {
							...campaign,
							uuid: newUuid,
							name: `${result.inputValue}`,
							date: null,
							sent_at: null,
							stats: null,
							account: account?.id,
							recipients: 0,
							uuid_b: uuidv4(),
							status: 'draft',
							recp_groups:
								campaign.recp_groups && campaign.recp_groups.map
									? campaign.recp_groups.map((g) => {
											return typeof g === 'object' ? g.id : g
									  })
									: [],
						}
						delete newCampaign.id

						ApiService.post('campaigns/', { data: newCampaign }, user.jwt)
							.then((response) => {
								if (response.data && response.data.data && response.data.data.id) {
									refreshData()
									createNotification({
										message: 'Campaign duplicated successfully',
										type: 'default',
										autoClose: 3000,
									})
								}
							})
							.catch((error) => {
								console.error('Error duplicating campaign:', error)
								createNotification({
									message: 'Failed to duplicate campaign. Please try again.',
									type: 'warning',
									autoClose: 5000,
								})
							})
					}
				})
				break
			case 'rename':
				// Rename logic
				PopupText.fire({
					text: 'Enter new campaign name',
					inputField: true,
					inputLabel: 'Campaign Name',
					inputValue: campaign.name,
					confirmButtonText: 'Rename',
				}).then((result) => {
					if (result.isConfirmed) {
						// Rename logic here
						const updCampaign = {
							uuid: campaign.uuid,
							name: `${result.inputValue}`,
						}

						ApiService.post('fairymailer/updateCampaign', { data: updCampaign }, user.jwt)
							.then((response) => {
								if (response.data && response.data.code && response.data.code == 200) {
									refreshData()
									createNotification({
										message: 'Campaign renamed successfully',
										type: 'default',
										autoClose: 3000,
									})
								}
							})
							.catch((error) => {
								console.error('Error renaming campaign:', error)
								createNotification({
									message: 'Failed to rename campaign. Please try again.',
									type: 'warning',
									autoClose: 5000,
								})
							})
					}
				})
				break
			case 'reschedule':
				// New reschedule action for outbox campaigns
				if (campaign.date) {
					const currentDate = new Date(campaign.date)

					PopupText.fire({
						title: 'Reschedule Campaign',
						html: `
				<div style="text-align: left; margin-bottom: 15px;">
				<label for="campaign-date">Date:</label>
				<input type="date" id="campaign-date" class="swal2-input" value="${currentDate.toISOString().split('T')[0]}" style="width: 100%">
				</div>
				<div style="text-align: left; margin-bottom: 15px;">
				<label for="campaign-time">Time:</label>
				<input type="time" id="campaign-time" class="swal2-input" value="${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}" style="width: 100%">
				</div>
			`,
						showCancelButton: true,
						confirmButtonText: 'Update Schedule',
						preConfirm: () => {
							const dateInput = document.getElementById('campaign-date').value
							const timeInput = document.getElementById('campaign-time').value

							if (!dateInput || !timeInput) {
								PopupText.showValidationMessage('Please enter both date and time')
								return false
							}

							return { date: dateInput, time: timeInput }
						},
					}).then((result) => {
						if (result.isConfirmed) {
							const { date, time } = result.value
							const [hours, minutes] = time.split(':')

							const newDate = new Date(date)
							newDate.setHours(parseInt(hours, 10))
							newDate.setMinutes(parseInt(minutes, 10))

							// Update campaign date
							const updatedCampaign = {
								uuid: campaign.uuid,
								date: newDate.toISOString(),
							}

							ApiService.post('fairymailer/updateCampaign', { data: updatedCampaign }, user.jwt)
								.then((response) => {
									if (response.data && response.data.code && response.data.code === 200) {
										refreshData()
										createNotification({
											message: 'Campaign rescheduled successfully',
											type: 'default',
											autoClose: 3000,
										})
									}
								})
								.catch((error) => {
									console.error('Error rescheduling campaign:', error)
									createNotification({
										message: 'Failed to reschedule campaign. Please try again.',
										type: 'warning',
										autoClose: 5000,
									})
								})
						}
					})
				} else {
					createNotification({
						message: 'This campaign is not scheduled',
						type: 'warning',
						autoClose: 3000,
					})
				}
				break
			case 'edit':
				// Navigate to campaign edit page (design editor) - this won't execute on mobile due to check above
				navigate(`/campaigns/edit/${campaign.uuid}`)
				break
			case 'overview':
				// Navigate to campaign overview - this WILL execute on mobile
				navigate(`/campaigns/overview/${campaign.uuid}`)
				break
			default:
				break
		}
	}

	// Render a mobile campaign card with collapsible content

	const renderMobileCampaignCard = (campaign) => {
		const isExpanded = expandedCampaign === campaign.uuid
		const showActionMenu = actionMenuCampaign === campaign.uuid
		const isSent = campaign.status === 'sent'

		// Determine button text based on campaign status
		const primaryButtonText = isSent ? 'Overview' : 'Edit'

		return (
			<div className="campaign-item" key={campaign.uuid || `campaign-${Math.random()}`}>
				<div className="campaign-item-header" onClick={() => toggleCampaignExpand(campaign.uuid)}>
					<div>
						<div className="campaign-item-title">{campaign.name || 'Campaign Name'}</div>
						<div className="campaign-item-subject">{campaign.subject || 'Subject goes here'}</div>
					</div>
					<div className={`campaign-item-chevron ${isExpanded ? 'expanded' : ''}`}>
						<span
							style={{
								transform: isExpanded ? 'rotate(180deg)' : 'none',
								display: 'inline-block',
								fontSize: '16px',
								fontWeight: 'bold',
							}}
						>
							▼
						</span>
					</div>
				</div>

				{isExpanded && (
					<div className="campaign-item-content">
						<div className="campaign-item-img">
							<img src={campaign.image || '/images/cmp.png'} alt={campaign.name} />
						</div>

						<div className="campaign-item-details">
							<span className="campaign-detail-label">Type</span>
							<span>{campaign.type === 'absplit' ? 'A/B Split' : 'Normal'}</span>
						</div>

						<div className="campaign-item-details">
							<span className="campaign-detail-label">{isSent ? 'Sent' : campaign.date ? 'Scheduled' : 'Created'}</span>
							<span>
								{isSent && campaign.sent_at
									? new Date(campaign.sent_at).toISOString().split('T')[0]
									: campaign.date
									? new Date(campaign.date).toISOString().split('T')[0]
									: campaign.createdAt
									? new Date(campaign.createdAt).toISOString().split('T')[0]
									: 'N/A'}
							</span>
						</div>

						<div className="overview-button" onClick={(e) => toggleActionMenu(e, campaign.uuid)}>
							{primaryButtonText}
							<span
								style={{
									position: 'absolute',
									right: '10px',
									top: '50%',
									transform: 'translateY(-50%)',
								}}
							>
								›
							</span>
						</div>

						{showActionMenu && (
							<div className="campaign-dropdown-menu">
								<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('delete', campaign)}>
									Delete
								</div>
								<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('duplicate', campaign)}>
									Duplicate
								</div>
								<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('rename', campaign)}>
									Rename
								</div>
								{isSent ? (
									<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('overview', campaign)}>
										Overview
									</div>
								) : (
									<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('edit', campaign)}>
										Edit
									</div>
								)}
								{!isSent && campaign.date && (
									<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('reschedule', campaign)}>
										Reschedule
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		)
	}
	// Handle tab change
	const handleTabChange = (value) => {
		// Reset expanded and action menu states when changing tabs
		setExpandedCampaign(null)
		setActionMenuCampaign(null)

		// Clear search term when changing tabs
		setSearchTerm('')

		// Reset filters when changing tabs
		setShowFilters(false)
		setCampaignFilters({
			dateFrom: '',
			dateTo: '',
			minOpenRate: '',
			maxOpenRate: '',
			minClickRate: '',
			maxClickRate: '',
			recipientGroups: [],
		})

		// Store the selected tab in localStorage for returning later
		localStorage.setItem('fairymail_last_active_tab', value)

		// Update tab state and navigate to appropriate URL
		switch (value) {
			case 'sent':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('sent')
				navigate('/campaigns/sent', { replace: true })
				break
			case 'draft':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('draft')
				navigate('/campaigns/draft', { replace: true })
				break
			case 'outbox':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('outbox')
				navigate('/campaigns/outbox', { replace: true })
				break
			case 'templates':
				setDropdownViewer('templates')
				setSelectedCampaignType('templates')
				navigate('/campaigns/templates', { replace: true })
				break
		}

		// Refresh data after tab change (with a slight delay to ensure state is updated)
		setTimeout(() => {
			if (value === 'templates') {
				getTemplates()
			} else {
				getCampaigns()
			}
		}, 50)
	}

	// Handle "New Campaign" button click with mobile restriction check
	const handleNewCampaignClick = () => {
		if (isMobile) {
			PopupText.fire({
				icon: 'info',
				text: 'You can create a campaign on mobile, but the campaign editor is not available. You will be able to set up campaign details and review, but design editing requires a desktop device.',
				showCancelButton: false,
				confirmButtonText: 'Continue',
			}).then(() => {
				navigate('/campaigns/new')
			})
		} else {
			navigate('/campaigns/new')
		}
	}

	// Handle campaign click in calendar view

	const handleCalendarCampaignClick = (campaign) => {
		if (campaign.status === 'sent') {
			// For sent campaigns, navigate to overview
			navigate(`/campaigns/overview/${campaign.uuid}`)
		} else if (campaign.status === 'draft' && campaign.date) {
			// For scheduled/outbox campaigns, show reschedule dialog on mobile
			if (isMobile) {
				// Show reschedule dialog since edit is not available on mobile

				PopupText.fire({
					title: 'Campaign Options',
					html: `
			<div style="text-align: left; margin-bottom: 15px;">
				<p>What would you like to do with this scheduled campaign?</p>
			</div>
			`,
					showDenyButton: true,
					showCancelButton: true,
					confirmButtonText: 'Reschedule',
					denyButtonText: 'View Details',
					cancelButtonText: 'Cancel',
				}).then((result) => {
					if (result.isConfirmed) {
						// Handle reschedule
						handleCampaignAction('reschedule', campaign)
					} else if (result.isDenied) {
						// Show basic details since edit is not available
						PopupText.fire({
							title: campaign.name,
							html: `
				<div style="text-align: left;">
					<p><strong>Subject:</strong> ${campaign.subject || 'N/A'}</p>
					<p><strong>Scheduled for:</strong> ${new Date(campaign.date).toLocaleString()}</p>
					<p><strong>Recipients:</strong> ${campaign.recipients || 0}</p>
					<p><strong>Type:</strong> ${campaign.type === 'absplit' ? 'A/B Split' : 'Normal'}</p>
				</div>
				`,
							confirmButtonText: 'Close',
						})
					}
				})
			} else {
				// On desktop, navigate to edit
				navigate(`/campaigns/edit/${campaign.uuid}`)
			}
		} else {
			// For draft campaigns without date
			if (isMobile) {
				PopupText.fire({
					icon: 'warning',
					text: 'Campaign editor is not available on mobile devices. Please use a desktop to design your campaign.',
					showCancelButton: false,
					confirmButtonText: 'OK',
				})
			} else {
				navigate(`/campaigns/edit/${campaign.uuid}`)
			}
		}
	}
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="page-name-container">
						<div className="page-name">Campaigns</div>
						{selectedCampaignType !== 'templates' && (
							<Button icon={'Plus'} type="action" onClick={handleNewCampaignClick}>
								{isMobile ? '' : 'New Campaign'}
							</Button>
						)}
					</div>
					<div className="filters-container">
						<div className="row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<ButtonGroup
								value={selectedCampaignType}
								options={[
									{ value: 'sent', label: `Sent (${totalCampaignsSent})` },
									{ value: 'draft', label: `Draft (${totalCampaignsDraft})` },
									{ value: 'outbox', label: `Outbox (${totalCampaignsOutBox})` },
									...(isMobile ? [] : [{ value: 'templates', label: `Templates (${templates && templates.length > 0 ? templates.length : '0'})` }]),
								]}
								onChange={handleTabChange}
							></ButtonGroup>

							{/* View mode toggle only shows here on desktop */}
							{!isMobile && dropdownViewer === 'campaigns' && (
								<ButtonGroup
									value={viewMode}
									options={[
										{ value: 'list', label: 'List View' },
										{ value: 'calendar', label: 'Calendar' },
									]}
									onChange={setViewMode}
								/>
							)}
						</div>

						{/* Show view mode toggle in a separate row on mobile */}
						{isMobile && dropdownViewer === 'campaigns' && (
							<div className="row" style={{ marginBottom: '1rem' }}>
								<ButtonGroup
									value={viewMode}
									options={[
										{ value: 'list', label: 'List View' },
										{ value: 'calendar', label: 'Calendar' },
									]}
									onChange={setViewMode}
								/>
							</div>
						)}

						{viewMode === 'list' && (
							<div className="input-text-container" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								{dropdownViewer === 'campaigns' ? (
									<>
										<SearchBar
											placeholder="Search Campaigns"
											label="Search Campaigns"
											initialValue={searchTerm}
											onSearch={(value) => {
												updateSearchTerm(value)
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
									</>
								) : (
									<SearchBar
										placeholder="Search Templates"
										label="Search Templates"
										initialValue={searchTerm}
										onSearch={(value) => {
											updateSearchTerm(value)
										}}
									/>
								)}
							</div>
						)}
					</div>

					{/* Campaign Filter Card */}
					{dropdownViewer === 'campaigns' && (
						<Card style={{ display: showFilters ? 'flex' : 'none' }} className={'d-flex flex-column campaign-filters-card gap-20 mt20'}>
							<div className="d-flex gap-20">
								<DatePicker
									label="Date From"
									hasMinDate={false}
									hasDefaultDate={false}
									dateFormat="d/m/Y"
									timeFormat={'H:i'}
									pickerType="date"
									onChange={(date) => handleFilterChange('dateFrom', date)}
									value={campaignFilters.dateFrom}
								/>
								<DatePicker
									label="Date To"
									hasMinDate={false}
									dateFormat="d/m/Y"
									timeFormat={'H:i'}
									pickerType="date"
									onChange={(date) => handleFilterChange('dateTo', date)}
									value={campaignFilters.dateTo}
								/>
							</div>

							{selectedCampaignType === 'sent' && (
								<>
									<div className="d-flex gap-20">
										<InputText label="Min Open Rate (%)" type="number" value={campaignFilters.minOpenRate} onChange={(e) => handleFilterChange('minOpenRate', e.target.value)} />
										<InputText label="Max Open Rate (%)" type="number" value={campaignFilters.maxOpenRate} onChange={(e) => handleFilterChange('maxOpenRate', e.target.value)} />
									</div>

									<div className="d-flex gap-20">
										<InputText label="Min Click Rate (%)" type="number" value={campaignFilters.minClickRate} onChange={(e) => handleFilterChange('minClickRate', e.target.value)} />
										<InputText label="Max Click Rate (%)" type="number" value={campaignFilters.maxClickRate} onChange={(e) => handleFilterChange('maxClickRate', e.target.value)} />
									</div>
								</>
							)}

							<div className="d-flex gap-20">
								<div style={{ flex: 1 }}>
									<label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'left' }}>Recipient Groups</label>
									<MultipleDropdown
										placeholder="Select Groups"
										options={groupOptions() || []}
										selectedValues={campaignFilters.recipientGroups}
										onOptionSelect={handleGroupSelection}
									/>
								</div>
							</div>

							<div className="d-flex justify-content-end mt10">
								<Button
									onClick={() => {
										setCampaignFilters({
											dateFrom: defaultFromDate(),
											dateTo: new Date(),
											minOpenRate: '',
											maxOpenRate: '',
											minClickRate: '',
											maxClickRate: '',
											recipientGroups: [],
										})
										// Reset filteredCampaigns to match selected campaign type
										const filtered = campaigns.filter((campaign) => {
											if (selectedCampaignType === 'sent') {
												return campaign.status === 'sent'
											} else if (selectedCampaignType === 'outbox') {
												return campaign.status === 'draft' && campaign.date
											} else if (selectedCampaignType === 'draft') {
												return campaign.status === 'draft' && !campaign.date
											}
											return false
										})
										setFilteredCampaigns(filtered)
									}}
									type="secondary"
									style={{ marginRight: '10px' }}
								>
									Clear Filters
								</Button>
								<Button onClick={applyCampaignFilters}>Apply Filters</Button>
							</div>
						</Card>
					)}

					{loading ? (
						<div className="loading-indicator">Loading...</div>
					) : (
						<div className="">
							{dropdownViewer === 'campaigns' ? (
								isMobile ? (
									// Mobile view for campaigns with collapsible cards or calendar
									viewMode === 'list' ? (
										<div className="mobile-campaigns-list">
											{filteredCampaigns.length > 0 ? (
												filteredCampaigns.map((campaign) => renderMobileCampaignCard(campaign))
											) : (
												<div className="no-campaigns">
													No {selectedCampaignType} campaigns found
													{searchTerm && (
														<div style={{ marginTop: '15px' }}>
															<Button
																type="secondary"
																onClick={() => {
																	setSearchTerm('')
																	getCampaigns()
																}}
															>
																Clear Search
															</Button>
														</div>
													)}
												</div>
											)}

											{filteredCampaigns.length > 0 && (
												<Pagination 
													currentPage={currentPage} 
													totalResults={filteredCampaigns.length} 
													resultsPerPage={itemsPerPage} 
													onChange={setCurrentPage} 
												/>
											)}
										</div>
									) : (
										<CampaignCalendar campaigns={filteredCampaigns} selectedCampaignType={selectedCampaignType} onCampaignClick={handleCalendarCampaignClick} />
									)
								) : // Desktop view for campaigns (list or calendar)
								viewMode === 'list' ? (
									<CampaignsTable
										resultsPerPage={10}
										refreshData={refreshData}
										selectedCampaignType={selectedCampaignType}
										dashboardPreviewOnly={false}
										searchTerm={searchTerm}
										campaigns={filteredCampaigns} // Pass the filtered campaigns directly
										loading={loading}
									/>
								) : (
									<CampaignCalendar campaigns={filteredCampaigns} selectedCampaignType={selectedCampaignType} onCampaignClick={handleCalendarCampaignClick} />
								)
							) : (
								// Templates view
								<div className="d-flex flex-wrap templates-container gap-20 mt20">
									<Card
										style={{ cursor: 'pointer' }}
										className={'d-flex flex-column align-items-center justify-content-center gap-20'}
										onClick={() => {
											PopupText.fire({
												text: 'Enter Template Name',
												inputField: true,
												inputLabel: 'Template Name',
												confirmButtonText: 'Submit',
												onConfirm: (inputValue) => {
													console.log('User entered:', inputValue)
												},
											}).then((result) => {
												if (result.isConfirmed) {
													console.log('Confirmed with input:', result.inputValue)
													createTemplateByName(result.inputValue)
												} else if (result.isCancelled) {
													console.log('Popup cancelled')
												}
											})
										}}
									>
										<Icon name="PlusLight" size={64}></Icon>
										<p>Create New</p>
									</Card>
									{templates &&
										templates.length > 0 &&
										templates
											.sort((a, b) => a.id - b.id)
											.map((template, i) => (
												<React.Fragment key={template.uuid || `template-${i}`}>
													<TemplateCard
														key={template.uuid}
														template_udid={template.uuid}
														templateName={template.name}
														onPreviewClick={() => {
															setTemplates([...templates.filter((t) => t.uuid != template.uuid), { ...template, showPreview: true }])
														}}
														onEditClick={() => navigate(`/templates/edit/${template.uuid}`)}
													/>
													<TemplatePreview
														template_udid={template.uuid}
														show={template.showPreview}
														onClose={() => {
															setTemplates([...templates.filter((t) => t.uuid != template.uuid), { ...template, showPreview: false }])
														}}
													/>
												</React.Fragment>
											))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default Campaigns
