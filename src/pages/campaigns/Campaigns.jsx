import CampaignsTable from '../../components/DataTable/CampaignsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import './campaigns.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { ApiService } from '../../service/api-service'
import PopupText from '../../components/PopupText/PopupText'
import TemplateCard from '../../components/TemplateCard/TemplateCard'
import TemplatePreview from '../../components/TemplatePreview/TemplatePreview'
import CampaignCalendar from './CampaignCalendar'
import { v4 as uuidv4 } from 'uuid'

const Campaigns = () => {
	const navigate = useNavigate()

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

	const totalCampaignsSent = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.sent : 2
	const totalCampaignsDraft = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.draft : 1
	const totalCampaignsOutBox = campaignsMeta && campaignsMeta.counts ? campaignsMeta.counts.outbox : 0

	// Handle window resize for mobile detection
	useEffect(() => {
		const handleResize = () => {
		  setIsMobile(window.innerWidth <= 768);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	  }, []);

	// Handle clicks outside of dropdown menus
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (actionMenuCampaign && !event.target.closest('.overview-button') && !event.target.closest('.campaign-dropdown-menu')) {
				setActionMenuCampaign(null);
			}
		};
		
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [actionMenuCampaign]);

	useEffect(() => {
		getCampaigns()
		getTemplates()
	}, [account])

	// Filter campaigns whenever selectedCampaignType or campaigns change
	useEffect(() => {
		if (campaigns && campaigns.length > 0) {
			const filtered = campaigns.filter(campaign => {
				if (selectedCampaignType === 'outbox') {
					return campaign.status === 'draft' && campaign.date;
				} else {
					return campaign.status === selectedCampaignType;
				}
			});
			setFilteredCampaigns(filtered);
		} else {
			setFilteredCampaigns([]);
		}
	}, [campaigns, selectedCampaignType]);

	const updateSearchTerm = async (search) => {
		setSearchTerm(search)

		let outboxfilter = selectedCampaignType == 'outbox' ? '&filters[date][$notNull]=true' : selectedCampaignType == 'draft' ? '&filters[date][$null]=true' : ''

		let resp = await ApiService.get(
			`fairymailer/getCampaigns?filters[name][$contains]=${search}&filters[status]=${
				selectedCampaignType == 'outbox' ? 'draft' : selectedCampaignType == 'draft' ? 'draft' : selectedCampaignType
			}${outboxfilter}&populate[recp_groups][populate][subscribers][count]=true&pagination[pageSize]=100&pagination[page]=1`,
			user.jwt
		)

		if (resp && resp.data && resp.data.data) {
			setCampaigns(resp.data.data.map((item) => ({
				...item,
				image: '/images/cmp.png',
			})))
		}
	}

	const getCampaigns = async (page = 1) => {
		try {
			setLoading(true);
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
			setLoading(false);
		} catch (error) {
			console.error(error)
			createNotification({
				message: 'Error loading campaigns. Please try again.',
				type: 'warning'
			})
			setLoading(false);
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
				type: 'warning'
			})
		}
	}

	const refreshData = async () => {
		await getCampaigns()
		await getTemplates()
		createNotification({
			message: 'Data refreshed successfully',
			type: 'default',
			autoClose: 3000
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
					autoClose: 3000
				})
				navigate(`/templates/edit/${templateUuid}`)
			}
		} catch (error) {
			console.error(error)
			createNotification({
				message: 'Error creating template. Please try again.',
				type: 'warning'
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
		  });
		  return; // Stop further execution
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
					createNotification({
						message: 'Campaign deleted successfully',
						type: 'default',
						autoClose: 3000
					})
				}
			});
			break;
		  case 'duplicate':
			// Duplicate logic
			createNotification({
				message: 'Campaign duplicated successfully',
				type: 'default',
				autoClose: 3000
			})
			break;
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
					createNotification({
						message: 'Campaign renamed successfully',
						type: 'default',
						autoClose: 3000
					})
				}
			});
			break;
		  case 'edit':
			// Navigate to campaign edit page (design editor) - this won't execute on mobile due to check above
			navigate(`/campaigns/edit/${campaign.uuid}`);
			break;
		  case 'overview':
			// Navigate to campaign overview - this WILL execute on mobile
			navigate(`/campaigns/overview/${campaign.uuid}`);
			break;
		  default:
			break;
		}
	  }

	// Render a mobile campaign card with collapsible content
	const renderMobileCampaignCard = (campaign) => {
		const isExpanded = expandedCampaign === campaign.uuid
		const showActionMenu = actionMenuCampaign === campaign.uuid

		return (
			<div className="campaign-item" key={campaign.uuid || `campaign-${Math.random()}`}>
				<div className="campaign-item-header" onClick={() => toggleCampaignExpand(campaign.uuid)}>
					<div>
						<div className="campaign-item-title">{campaign.name || "Campaign Name"}</div>
						<div className="campaign-item-subject">{campaign.subject || "Subject goes here"}</div>
					</div>
					<div className={`campaign-item-chevron ${isExpanded ? 'expanded' : ''}`}>
						<img src="/src/components/arrow.svg" alt="Arrow" />
					</div>
				</div>
				
				{isExpanded && (
					<div className="campaign-item-content">
						<div className="campaign-item-img">
							<img src={campaign.image || '/images/cmp.png'} alt={campaign.name} />
						</div>
						
						<div className="campaign-item-details">
							<span className="campaign-detail-label">Type</span>
							<span>{campaign.type || "Normal"}</span>
						</div>
						
						<div className="campaign-item-details">
							<span className="campaign-detail-label">Created</span>
							<span>{campaign.sent_at ? new Date(campaign.sent_at).toISOString().split('T')[0] : "2024-04-17"}</span>
						</div>
						
						<div className="overview-button" onClick={(e) => toggleActionMenu(e, campaign.uuid)}>
							Overview
							<img 
								src="/src/components/arrow.svg" 
								alt="Arrow" 
								style={{ 
									position: 'absolute', 
									right: '10px', 
									top: '50%', 
									transform: 'translateY(-50%)' 
								}} 
							/>
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
								<div className="campaign-dropdown-menu-item" onClick={() => handleCampaignAction('overview', campaign)}>
									Overview
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	// Handle tab change
	const handleTabChange = (value) => {
		// Reset expanded and action menu states when changing tabs
		setExpandedCampaign(null)
		setActionMenuCampaign(null)
		
		switch (value) {
			case 'sent':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('sent')
				break
			case 'draft':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('draft')
				break
			case 'outbox':
				setDropdownViewer('campaigns')
				setSelectedCampaignType('outbox')
				break
			case 'templates':
				setDropdownViewer('templates')
				setSelectedCampaignType('templates')
				break
		}
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
			navigate('/campaigns/new');
		  });
		} else {
		  navigate('/campaigns/new');
		}
	};
	
	// Handle campaign click in calendar view
	const handleCalendarCampaignClick = (campaign) => {
	  if (campaign.status === 'sent') {
		navigate(`/campaigns/overview/${campaign.uuid}`);
	  } else {
		if (isMobile) {
		  PopupText.fire({
			icon: 'warning',
			text: 'Campaign editor is not available on mobile devices. Please use a desktop to design your campaign.',
			showCancelButton: false,
			confirmButtonText: 'OK',
		  });
		} else {
		  navigate(`/campaigns/edit/${campaign.uuid}`);
		}
	  }
	};

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="page-name-container">
						<div className="page-name">Campaigns</div>
						<Button icon={'Plus'} type="action" onClick={handleNewCampaignClick}>
							{isMobile ? '' : 'New Campaign'}
						</Button>
					</div>
					<div className="filters-container">
						<div className="row" style={{ marginBottom: '1rem' }}>
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
						</div>
						
						{/* View mode toggle moved above the search bar and converted to ButtonGroup */}
						{dropdownViewer === 'campaigns' && (
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
						
						<div className="row d-flex content-space-between">
							<InputText
								onChange={(e) => updateSearchTerm(e.target.value)}
								style={{ width: '100%' }}
								placeholder="Campaign Name"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
							/>
						</div>
					</div>

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
												filteredCampaigns.map((campaign) => (
													renderMobileCampaignCard(campaign)
												))
											) : (
												<div className="no-campaigns">
													No {selectedCampaignType} campaigns found
												</div>
											)}
											
											{filteredCampaigns.length > 0 && (
												<div className="pagination-container">
													<button><Icon name="ChevronLeft" size={16} /></button>
													<span className="current-page">1</span>
													<span>2</span>
													<span className="pagination-dots">...</span>
													<span>9</span>
													<span>10</span>
													<button><Icon name="ChevronRight" size={16} /></button>
												</div>
											)}
										</div>
									) : (
										<CampaignCalendar 
											campaigns={filteredCampaigns}
											selectedCampaignType={selectedCampaignType}
											onCampaignClick={handleCalendarCampaignClick}
										/>
									)
								) : (
									// Desktop view for campaigns (list or calendar)
									viewMode === 'list' ? (
										<CampaignsTable
											resultsPerPage={10}
											refreshData={refreshData}
											selectedCampaignType={selectedCampaignType}
											dashboardPreviewOnly={false}
										/>
									) : (
										<CampaignCalendar 
											campaigns={filteredCampaigns}
											selectedCampaignType={selectedCampaignType}
											onCampaignClick={handleCalendarCampaignClick}
										/>
									)
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