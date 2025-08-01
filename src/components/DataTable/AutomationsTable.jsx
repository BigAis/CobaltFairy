import React, { useEffect, useState } from 'react'
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

const AutomationsTable = ({ incomingAutomations, refreshData }) => {
    console.log('incomingAutomations', incomingAutomations);
    const {user, account, createNotification} = useAccount()
    const [selectedAutomations, setSelectedAutomations] = useState([])
    const [automations, setAutomations] = useState(incomingAutomations);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 20

    // Update automations state when incomingAutomations changes
    useEffect(() => {
        console.log('AutomationsTable received updated automations:', incomingAutomations);
        setAutomations(incomingAutomations);
    }, [incomingAutomations]);

    // Add an effect to handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && typeof refreshData === 'function') {
                console.log('Page visible again, refreshing automations data');
                refreshData();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refreshData]);

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    // Updated dropdown options to include Overview
    const dropdownOptions = [
        { value: 'overview', label: 'Overview' },
        { value: 'delete', label: 'Delete' },
    ]
    
    const handleLeftClick = (item) => {
        navigate('/automations/'+item.uuid)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedData = automations ? automations.slice(startIndex, endIndex) : [];

    useEffect(() => {

    }, [selectedAutomations])

    // Function to update automation active status
    const updateAutomationStatus = async (automation, newStatus) => {
        try {
            console.log(`AUTOMATION TABLE - Updating automation ${automation.id} status to:`, newStatus);
            
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
                console.log('AUTOMATION TABLE - Status updated successfully in backend');
                
                // Show notification
                createNotification({
                    message: `Automation ${newStatus ? 'activated' : 'deactivated'} successfully.`,
                    type: 'default',
                    autoClose: 3000
                });
                
                // Force a global data refresh with small delay to ensure API update is complete
                if (typeof refreshData === 'function') {
                    console.log('AUTOMATION TABLE - Triggering global data refresh');
                    setTimeout(() => refreshData(), 300);
                }
                
                // Force a second refresh after a bit longer to catch any sync issues
                setTimeout(() => {
                    if (typeof refreshData === 'function') {
                        console.log('AUTOMATION TABLE - Triggering second global data refresh');
                        refreshData();
                    }
                }, 1500);
                
                return true;
            } else {
                console.error('AUTOMATION TABLE - Failed to update automation status:', resp);
                
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
            console.error("AUTOMATION TABLE - Error updating automation status:", error);
            
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
                                                `fairymail/delete-automation`, 
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
                        console.log(`Switch clicked for automation ${item.id}, current status:`, item.active);
                        const newActiveStatus = !item.active;
                        const success = await updateAutomationStatus(item, newActiveStatus);
                        console.log(`Switch update result for automation ${item.id}:`, success ? 'success' : 'failed');
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
                value={paginatedData} 
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
                            checked={selectedAutomations.length === paginatedData.length && selectedAutomations.length > 0}
                            onChange={(e) => {
                                if (e) {
                                    setSelectedAutomations([...paginatedData])
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
            <Pagination currentPage={1} totalResults={automations ? automations.length : 0} resultsPerPage={20} onChange={handlePageChange} />
        </>
    )
}

export default AutomationsTable