// Updated version of src/pages/automations/automations.jsx

import { React, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './automations.scss'

import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import SearchBar from '../../components/SearchBar/SearchBar'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import AutomationsTable from '../../components/DataTable/AutomationsTable'
import PopupText from '../../components/PopupText/PopupText'

const Automations = () => {
    const { user, account } = useAccount()
    const [automations, setAutomations] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedAutomations, setSelectedAutomations] = useState([])
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [expandedAutomation, setExpandedAutomation] = useState(null)
    const [actionMenuAutomation, setActionMenuAutomation] = useState(null)
    const navigate = useNavigate()

    // Load automations data
    const loadData = async () => {
        try {
            setLoading(true)
            // Add a cache-busting parameter to ensure we get fresh data
            const timestamp = new Date().getTime()
            let resp = await ApiService.get(
                `fairymailer/getAutomations?sort[0]=createdAt:desc&pagination[pageSize]=1000&pagination[page]=1&_t=${timestamp}`,
                user.jwt
            )
            if (resp.data && resp.data.data) {
                setAutomations(resp.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                }))
            }
        } catch (error) {
            console.error('Error fetching automations:', error)
        } finally {
            setLoading(false)
        }
    }

    // Search function for automations
    const searchAutomations = async (term) => {
        try {
            setSearchTerm(term)
            setLoading(true)
            
            let resp = await ApiService.get(
                `fairymailer/getAutomations?sort[0]=createdAt:desc&filters[name][$contains]=${term}&pagination[pageSize]=1000&pagination[page]=1&`,
                user.jwt
            )
            
            if (resp.data && resp.data.data) {
                setAutomations(resp.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                }))
            }
        } catch (error) {
            console.error('Error searching automations:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteSelectedAutomations = async () => {
        if (selectedAutomations.length === 0) return

        const result = await PopupText.fire({
            icon: 'question',
            text: `Are you sure you want to delete ${selectedAutomations.length} automation(s)? This action is irreversible.`,
            focusCancel: false,
            showConfirmButton: true,
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: 'Yes, DELETE them',
            cancelButtonText: 'No, abort',
        })

        if (result.isConfirmed) {
            let successCount = 0
            for (const automation of selectedAutomations) {
                if (automation.active) {
                    await PopupText.fire({
                        icon: 'warning',
                        text: `You cannot delete active automations. Please deactivate "${automation.name}" first.`,
                        showConfirmButton: false,
                        showCancelButton: true,
                        cancelButtonText: 'Ok',
                    });
                    continue;
                }
                try {
                    let sendResp = await ApiService.post(
                        `fairymailer/delete-automation`,
                        { uuid: automation.uuid },
                        user.jwt
                    );
                    if (sendResp.data && sendResp.data.code === 200) {
                        successCount++
                    }
                } catch (error) {
                    console.error(`Error deleting automation ${automation.name}:`, error)
                }
            }

            if (successCount > 0) {
                await PopupText.fire({
                    icon: 'success',
                    text: `${successCount} automation(s) deleted successfully!`,
                    showConfirmButton: false,
                    cancelButtonText: 'Ok'
                });
            }
            setSelectedAutomations([])
            await loadData()
        }
    }

    // Toggle expand/collapse of an automation card
    const toggleAutomationExpand = (automationId) => {
        setExpandedAutomation(expandedAutomation === automationId ? null : automationId)
        // Close action menu when toggling expand/collapse
        setActionMenuAutomation(null)
    }

    // Toggle action menu for an automation
    const toggleActionMenu = (e, automationId) => {
        e.stopPropagation() // Prevent triggering the card expand/collapse
        setActionMenuAutomation(actionMenuAutomation === automationId ? null : automationId)
    }

    // Handle automation actions
    const handleAutomationAction = (action, automation) => {
        // Check if on mobile and trying to access editor for any automation
        if (isMobile && action === 'edit') {
            PopupText.fire({
                icon: 'warning',
                text: 'Automation editor is not available on mobile devices. Please use a desktop to design your automation.',
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
                    text: 'Are you sure you want to delete this automation?',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, delete it',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Delete logic here
                        ApiService.post(`fairymailer/delete-automation`, { uuid: automation.uuid }, user.jwt)
                            .then(() => {
                                loadData()
                                PopupText.fire({
                                    icon: 'success',
                                    text: 'Automation deleted successfully',
                                    showConfirmButton: false,
                                    cancelButtonText: 'OK'
                                })
                            })
                            .catch((error) => {
                                console.error('Error deleting automation:', error)
                                PopupText.fire({
                                    icon: 'error',
                                    text: 'Failed to delete automation. Please try again.',
                                    showConfirmButton: false,
                                    cancelButtonText: 'OK'
                                })
                            })
                    }
                })
                break
            case 'duplicate':
                // Duplicate logic
                PopupText.fire({
                    icon: 'question',
                    text: 'Please type a title for the new automation',
                    inputField: true,
                    focusCancel: false,
                    showConfirmButton: true,
                    showDenyButton: false,
                    showCancelButton: true,
                    confirmButtonText: 'Continue',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Duplicate logic here - you'll need to implement this based on your API
                        PopupText.fire({
                            icon: 'info',
                            text: 'Duplication feature will be implemented soon.',
                            showConfirmButton: false,
                            cancelButtonText: 'OK'
                        })
                    }
                })
                break
            case 'rename':
                // Rename logic
                PopupText.fire({
                    text: 'Enter new automation name',
                    inputField: true,
                    inputLabel: 'Automation Name',
                    inputValue: automation.name,
                    confirmButtonText: 'Rename',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Rename logic here - you'll need to implement this based on your API
                        PopupText.fire({
                            icon: 'info',
                            text: 'Rename feature will be implemented soon.',
                            showConfirmButton: false,
                            cancelButtonText: 'OK'
                        })
                    }
                })
                break
            case 'edit':
                // Navigate to automation edit page (design editor) - this won't execute on mobile due to check above
                navigate(`/automations/edit/${automation.uuid}`)
                break
            case 'overview':
                // Navigate to automation overview - this WILL execute on mobile
                navigate(`/automations/${automation.uuid}`)
                break
            case 'toggle':
                // Toggle active/inactive status
                const newStatus = !automation.active
                ApiService.post(`fairymailer/update-automation-status`, { 
                    uuid: automation.uuid, 
                    active: newStatus 
                }, user.jwt)
                    .then(() => {
                        loadData()
                        PopupText.fire({
                            icon: 'success',
                            text: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully`,
                            showConfirmButton: false,
                            cancelButtonText: 'OK'
                        })
                    })
                    .catch((error) => {
                        console.error('Error toggling automation status:', error)
                        PopupText.fire({
                            icon: 'error',
                            text: 'Failed to update automation status. Please try again.',
                            showConfirmButton: false,
                            cancelButtonText: 'OK'
                        })
                    })
                break
            default:
                break
        }
    }

    // Render a mobile automation card with collapsible content
    const renderMobileAutomationCard = (automation) => {
        const isExpanded = expandedAutomation === automation.uuid
        const showActionMenu = actionMenuAutomation === automation.uuid

        return (
            <div className="automation-item" key={automation.uuid || `automation-${Math.random()}`}>
                <div className="automation-item-header" onClick={() => toggleAutomationExpand(automation.uuid)}>
                    <div className="automation-item-info">
                        <div className="automation-item-title">{automation.name || 'Automation Name'}</div>
                        <div className="automation-item-subject">
                            {automation.active ? 'Active' : 'Inactive'} • {automation.triggers?.length || 0} triggers
                        </div>
                    </div>
                    <div className={`automation-item-chevron ${isExpanded ? 'expanded' : ''}`}>
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
                    <div className="automation-item-content">
                        <div className="automation-item-metrics">
                            <div className="automation-item-details">
                                <span className="automation-detail-label">Status</span>
                                <span className={`status-badge ${automation.active ? 'status-active' : 'status-inactive'}`}>
                                    {automation.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="automation-item-details">
                                <span className="automation-detail-label">Triggers</span>
                                <span>{automation.triggers?.length || 0}</span>
                            </div>

                            <div className="automation-item-details">
                                <span className="automation-detail-label">Created</span>
                                <span>{automation.createdAt || 'N/A'}</span>
                            </div>

                            <div className="automation-item-details">
                                <span className="automation-detail-label">Last Modified</span>
                                <span>{automation.updatedAt ? new Date(automation.updatedAt).toISOString().split('T')[0] : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="overview-button" onClick={(e) => toggleActionMenu(e, automation.uuid)}>
                            {automation.active ? 'Overview' : 'Edit'}
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
                            <div className="automation-dropdown-menu">
                                <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('delete', automation)}>
                                    Delete
                                </div>
                                <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('duplicate', automation)}>
                                    Duplicate
                                </div>
                                <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('rename', automation)}>
                                    Rename
                                </div>
                                <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('toggle', automation)}>
                                    {automation.active ? 'Deactivate' : 'Activate'}
                                </div>
                                {automation.active ? (
                                    <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('overview', automation)}>
                                        Overview
                                    </div>
                                ) : (
                                    <div className="automation-dropdown-menu-item" onClick={() => handleAutomationAction('edit', automation)}>
                                        Edit
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

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
            if (actionMenuAutomation && !event.target.closest('.overview-button') && !event.target.closest('.automation-dropdown-menu')) {
                setActionMenuAutomation(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [actionMenuAutomation])

    useEffect(() => {
        if (user) {
            loadData()
        }
        
        // Add an event listener to refresh data when the page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                loadData()
            }
        }
        
        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [user])

    return (
        <>
            <div className="fm-page-wrapper automations-page">
                <Sidemenu />
                <div className="fm-page-container">
                    <PageHeader user={user} account={account} />
                    <div className="page-name-container">
                        <div className="page-name">Automations</div>
                        <div className="action-buttons">
                            {selectedAutomations.length > 0 && (
                                <Button type="secondary" onClick={deleteSelectedAutomations} style={{ marginRight: '10px' }}>
                                    Delete Selected ({selectedAutomations.length})
                                </Button>
                            )}
                            {/* Desktop button - only show on desktop */}
                            {!isMobile && (
                                <Button icon={'Plus'} type="action" onClick={() => navigate('/automations/new')}>
                                    Add Automation
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile button - keep original mobile structure */}
                    {isMobile && (
                        <div className="create-new-button-container">
                            <Button icon={'Plus'} type="action" onClick={() => navigate('/automations/new')}>
                                {isMobile ? '' : 'Add Automation'}
                            </Button>
                        </div>
                    )}
                    
                    {/* Search Bar - Mobile responsive */}
                    <div className="filters-container">
                        <div className="input-text-container">
                            <SearchBar
                                placeholder="Search Automations" 
                                label="Search Automations"
                                initialValue={searchTerm}
                                onSearch={searchAutomations}
                                style={{ width: '100%' }}
                            />
                            {/* Filters button temporarily hidden
                            <Button type="secondary" icon={'Filters'} className="button-filters">
                                Filters
                            </Button>
                            */}
                        </div>
                    </div>

                    <div className="groups">
                        {loading ? (
                            <Card>
                                <div className="text-center p-4">Loading automations...</div>
                            </Card>
                        ) : automations && automations.length > 0 ? (
                            isMobile ? (
                                // Mobile view for automations with collapsible cards
                                <div className="mobile-automations-list">
                                    {automations.map((automation) => renderMobileAutomationCard(automation))}
                                </div>
                            ) : (
                                // Desktop view for automations
                                <AutomationsTable 
                                    incomingAutomations={automations} 
                                    refreshData={loadData}
                                    selectedAutomations={selectedAutomations}
                                    setSelectedAutomations={setSelectedAutomations}
                                 />
                            )
                        ) : (
                            <Card>
                                <div className="text-center p-4">
                                    <p>No automations found.</p>
                                    {searchTerm && (
                                        <Button type="secondary" onClick={() => {
                                            setSearchTerm('')
                                            loadData()
                                        }}>
                                            Clear Search
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Automations