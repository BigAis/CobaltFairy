import React, { useEffect, useState, useCallback } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'
import Switch from '../Switch'
import { useNavigate } from 'react-router-dom'
import NotificationBar from '../../components/NotificationBar/NotificationBar'
import { ApiService } from '../../service/api-service'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../PopupText/PopupText'
import qs from 'qs'

const AutomationsTable = ({ 
    searchTerm, 
    onUpdate, 
    selectedAutomations, 
    setSelectedAutomations 
}) => {
    const {user, account, createNotification} = useAccount()
    const [automations, setAutomations] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const resultsPerPage = 10

    // Add an effect to handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && typeof onUpdate === 'function') {
                onUpdate();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [onUpdate]);

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Server-side data fetching function
    const getAutomations = useCallback(async (page = 1, searchTerm = '') => {
        setLoading(true)
        try {
            const query = {
                sort: ['createdAt:desc'],
                pagination: {
                    pageSize: resultsPerPage,
                    page,
                },
            }

            // Add search filter if searchTerm exists
            if (searchTerm) {
                query.filters = {
                    name: {
                        $contains: searchTerm,
                    },
                }
            }

            const queryString = qs.stringify(query, { encode: false })
            const resp = await ApiService.get(`fairymailer/getAutomations?${queryString}`, user.jwt)

            if (resp.data && resp.data.data) {
                const processedData = resp.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                })
                setAutomations(processedData)
                setTotalResults(resp.data.meta.pagination.total)
            }
            setCurrentPage(page)
        } catch (error) {
            console.error('Error fetching automations:', error)
            PopupText.fire({
                text: 'Error fetching automations. Please try again later.',
                icon: 'error',
            })
        } finally {
            setLoading(false)
        }
    }, [user?.jwt, resultsPerPage])

    // Select all automations function
    const selectAllAutomations = useCallback(async () => {
        if (!user || !user.jwt) return
    
        try {
            const query = {
                sort: ['createdAt:desc'],
                pagination: {
                    pageSize: 1000, // Large number to get all automations
                    page: 1,
                },
            }

            // Add search filter if searchTerm exists
            if (searchTerm) {
                query.filters = {
                    name: {
                        $contains: searchTerm,
                    },
                }
            }

            const queryString = qs.stringify(query, { encode: false })
            const response = await ApiService.get(`fairymailer/getAutomations?${queryString}`, user.jwt)
    
            if (response.data && response.data.data) {
                const processedData = response.data.data.map(data => {
                    data.createdAt = data.createdAt.split('T')[0]
                    return data
                })
                setSelectedAutomations(processedData)
            }
        } catch (error) {
            console.error('Error fetching all automations for selection:', error)
            PopupText.fire({
                text: 'Error selecting all automations. Please try again.',
                icon: 'error',
            })
        }
    }, [user?.jwt, searchTerm, setSelectedAutomations])

    // Updated dropdown options to include Overview
    const dropdownOptions = [
        { value: 'overview', label: 'Overview' },
        { value: 'delete', label: 'Delete' },
    ]
    
    const handleLeftClick = (item) => {
        navigate('/automations/'+item.uuid)
    }

    // Load data when component mounts or when search term changes
    useEffect(() => {
        if (user) {
            getAutomations(currentPage, searchTerm)
        }
    }, [currentPage, user, searchTerm, getAutomations])

    // Function to update automation active status
    const updateAutomationStatus = async (automation, newStatus) => {
        try {
            
            // Store original state in case we need to revert
            const originalActive = automation.active;
            
            // Optimistically update UI first
            setAutomations(currentAutomations => 
                currentAutomations.map(a => 
                    a.id === automation.id 
                        ? {...a, active: newStatus} 
                        : a
                )
            );
            
            // Call API to update the automation status
            let resp = await ApiService.put(
                `automations/${automation.id}`, 
                { data: { active: newStatus } }, 
                user.jwt
            );
            
            if (resp.status === 200) {
                
                // Show notification
                createNotification({
                    message: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully.`,
                    type: 'default',
                    autoClose: 3000
                });
                
                // Force a global data refresh with small delay to ensure API update is complete
                if (typeof refreshData === 'function') {
                    setTimeout(() => refreshData(), 300);
                }
                
                // Force a second refresh after a bit longer to catch any sync issues
                setTimeout(() => {
                    if (typeof refreshData === 'function') {
                        refreshData();
                    }
                }, 1500);
                
                return true;
            } else {
                
                // Revert UI changes
                setAutomations(currentAutomations => 
                    currentAutomations.map(a => 
                        a.id === automation.id 
                            ? {...a, active: originalActive} 
                            : a
                    )
                );
                
                PopupText.fire({ 
                    icon: 'error', 
                    text: 'Failed to update automation status.', 
                    showConfirmButton: false, 
                    cancelButtonText: 'Ok' 
                });
                return false;
            }
        } catch (error) {
            
            // Revert UI changes
            setAutomations(currentAutomations => 
                currentAutomations.map(a => 
                    a.id === automation.id 
                        ? {...a, active: !newStatus} 
                        : a
                )
            );
            
            PopupText.fire({ 
                icon: 'error', 
                text: 'An error occurred while updating the automation status.', 
                showConfirmButton: false, 
                cancelButtonText: 'Ok' 
            });
            return false;
        }
    }

    const actionsBodyTemplate = (item) => {
        return (
            <div>
                <Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onLeftClick={()=>{
                    // Always navigate to the Edit Automation page first
                    navigate(`/automations/${item.uuid}/edit`);
                }} onOptionSelect={ async (selectedOption)=>{
                    switch(selectedOption.value){
                                case "overview": 
                                    navigate(`/automations/${item.uuid}`);
                                    break;
                                case "delete": 
                                    if(item.active) {
                                        await PopupText.fire({
                                        icon: 'warning',
                                        text: 'You cannot delete active automations.',
                                        showConfirmButton: false,
                                        showCancelButton: true,
                                        cancelButtonText: 'Ok',
                                        })
                                        return;
                                    }
                                    const result = await PopupText.fire({
                                        icon: 'question',
                                        text: 'Are you sure you want to delete this automation? This action is irreversible.',
                                        focusCancel: false,
                                        showConfirmButton: true,
                                        showDenyButton: false,
                                        showCancelButton: true,
                                        confirmButtonText: 'Yes, DELETE it',
                                        cancelButtonText: 'No, abort',
                                    })

                                    if (result.isConfirmed) {    
                                        try {
                                            // Try without the nested 'data' property
                                            let sendResp = await ApiService.post(
                                                `fairymailer/delete-automation`, 
                                                { uuid: item.uuid },  // Changed from { data: { uuid: item.uuid } }
                                                user.jwt
                                            );
                                            
                                            // Check the actual response content, not just the HTTP status
                                            if (sendResp.data && sendResp.data.code === 200) {
                                                // Only update the UI if the API confirms success
                                                setAutomations(currentAutomations => 
                                                    currentAutomations.filter(a => a.uuid !== item.uuid)
                                                );
                                                
                                                PopupText.fire({ 
                                                    icon: 'success', 
                                                    text: 'Deleted successfully!', 
                                                    showConfirmButton: false, 
                                                    cancelButtonText: 'Ok' 
                                                });
                                            } else {
                                                // Show the actual error from the API
                                                PopupText.fire({ 
                                                    icon: 'error', 
                                                    text: sendResp.data.message || 'Failed to delete automation', 
                                                    showConfirmButton: false, 
                                                    cancelButtonText: 'Ok' 
                                                });
                                            }
                                        } catch (error) {
                                            // Handle error response
                                            PopupText.fire({ 
                                                icon: 'error', 
                                                text: 'An error occurred while deleting the automation.', 
                                                showConfirmButton: false, 
                                                cancelButtonText: 'Ok' 
                                            });
                                        
                                        }
                                    }
                        break;
                    }
                }}>
                    {item.active ? 'View' : 'Edit'}
                </Dropdown>
            </div>
        )
    }
    const enabledSwitchTemplate = (item) => {
        return (
            <div>
                <Switch 
                    checked={item.active} 
                    onChange={async () => {
                        const newActiveStatus = !item.active;
                        await updateAutomationStatus(item, newActiveStatus);
                    }}
                />
            </div>
        )
    }

    return (
        <>
            {notifications && notifications.length>0 &&  (
                <div style={{margin:'5px 0'}}>
                    {notifications.map((n, index) => {
                        return <NotificationBar key={n.id} type={n.type || 'default'} message={n.message} onClose={n.onClose}/>
                    })}
                </div>
            )}
            <DataTable 
                value={automations} 
                paginator={false} 
                selection={selectedAutomations} 
                onSelectionChange={(e) => setSelectedAutomations(e.value)} 
                dataKey="uuid" 
                rowClassName={() => 'p-table-row'}
            >
                <Column
                    body={(rowData) => (
                        <div style={{ position: 'relative' }}>
                            {/* Checkbox in the Top-Left Corner */}
                            <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
                                <Checkbox
                                    checked={selectedAutomations.some((automation) => automation.uuid === rowData.uuid)}
                                    onChange={(e) => {
                                        if (e) {
                                            setSelectedAutomations((prev) => [...prev, rowData])
                                        } else {
                                            setSelectedAutomations((prev) => prev.filter((automation) => automation.uuid !== rowData.uuid))
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    header={() => (
                        <Checkbox
                            checked={totalResults > 0 && selectedAutomations.length === totalResults}
                            onChange={(e) => {
                                if (e) {
                                    selectAllAutomations()
                                } else {
                                    setSelectedAutomations([])
                                }
                            }}
                        />
                    )}
                    headerStyle={{ width: '80px' }}
                />
                <Column field="name" header="Description" />
                <Column field="createdAt" header="Created" />
                <Column field="open_rate" header="Emails" />
                <Column field="open_rate" header="Opens" />
                <Column field="click_rate" header="Clicks" />
                <Column header="Status" body={enabledSwitchTemplate} />
                <Column header="Actions" body={actionsBodyTemplate} />
            </DataTable>
            <Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={resultsPerPage} onChange={handlePageChange} />
        </>
    )
}

export default AutomationsTable