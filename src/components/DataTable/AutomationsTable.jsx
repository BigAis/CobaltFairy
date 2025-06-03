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
const AutomationsTable = ({ incomingAutomations }) => {
    console.log('incomingAutomations',incomingAutomations);
    const {user,account} = useAccount()
    const [selectedAutomations, setSelectedAutomations] = useState([])
    const [automations,setAutomations] = useState(incomingAutomations);
    const [notifications,setNotifications] = useState([]);
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 20

    // Update automations state when incomingAutomations changes
    useEffect(() => {
        setAutomations(incomingAutomations);
    }, [incomingAutomations]);

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const dropdownOptions = [
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

    const actionsBodyTemplate = (item) => {
        return (
            <div>
                <Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onLeftClick={()=>{
                    // If automation is active, navigate to view-only mode
                    if (item.active) {
                        navigate(`/automations/${item.uuid}?viewOnly=true`);
                    } else {
                        handleLeftClick(item);
                    }
                }} onOptionSelect={ async (selectedOption)=>{
                    switch(selectedOption.value){
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
                                            // Use the correct endpoint
                                            let sendResp = await ApiService.post(
                                                `fairymail/delete-automation`, 
                                                { data: { uuid: item.uuid } },
                                                user.jwt
                                            );
                                            
                                            // Update automations list immediately on success
                                            setAutomations(currentAutomations => 
                                                currentAutomations.filter(a => a.uuid !== item.uuid)
                                            );
                                            
                                            PopupText.fire({ 
                                                icon: 'success', 
                                                text: 'Deleted successfully!', 
                                                showConfirmButton: false, 
                                                cancelButtonText:'Ok' 
                                            });
                                        } catch (error) {
                                            // Handle error response
                                            if (error.response && error.response.status === 500) {
                                                PopupText.fire({ 
                                                    icon: 'error', 
                                                    text: 'Cannot delete an active automation. Please deactivate it first.', 
                                                    showConfirmButton: false, 
                                                    cancelButtonText:'Ok' 
                                                });
                                            } else {
                                                PopupText.fire({ 
                                                    icon: 'error', 
                                                    text: 'An error occurred while deleting the automation.', 
                                                    showConfirmButton: false, 
                                                    cancelButtonText:'Ok' 
                                                });
                                            }
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
                <Switch checked={item.active} onChange={async (e)=>{
                    const newActiveStatus = !item.active;
                    
                    try {
                        let resp = await ApiService.put(`automations/${item.id}`, { data: { active: newActiveStatus } }, user.jwt);
                        
                        // Update the item in the automations state
                        setAutomations(currentAutomations => 
                            currentAutomations.map(automation => 
                                automation.id === item.id 
                                    ? {...automation, active: newActiveStatus} 
                                    : automation
                            )
                        );
                        
                        const notificationId = Date.now();
                        setNotifications(current => [
                            ...current,
                            {
                                id: notificationId, 
                                type: 'warning', 
                                message: 'Automation status was updated.', 
                                onClose: () => {
                                    setNotifications(n => n.filter(notification => notification.id !== notificationId))
                                }
                            }
                        ]);
                        
                        setTimeout(() => {
                            setNotifications(current => current.filter(n => n.id !== notificationId));
                        }, 5000);
                    } catch (error) {
                        console.error("Error updating automation status:", error);
                        PopupText.fire({ 
                            icon: 'error', 
                            text: 'Failed to update automation status.', 
                            showConfirmButton: false, 
                            cancelButtonText:'Ok' 
                        });
                    }
                }}></Switch>
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