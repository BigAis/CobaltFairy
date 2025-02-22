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
const AutomationsTable = ({ automations }) => {

    const [selectedAutomations, setSelectedAutomations] = useState([])
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 20

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const dropdownOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ]
    const handleLeftClick = (item) => {
        navigate('/automations/'+item.uuid)
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedData = automations.slice(startIndex, endIndex)

    useEffect(() => {

    }, [selectedAutomations])

    const actionsBodyTemplate = (item) => {
        return (
            <div>
                <Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onLeftClick={()=>{handleLeftClick(item)}}>
                    Edit
                </Dropdown>
            </div>
        )
    }
    const enabledSwitchTemplate = (item) => {
        return (
            <div>
                <Switch checked={item.active} onChange={()=>{item.active=!item.active}}></Switch>
            </div>
        )
    }

    return (
        // <div>
        <>
            <DataTable value={paginatedData} paginator={false} selection={selectedAutomations} onSelectionChange={(e) => setSelectedAutomations(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
                <Column
                    body={(rowData) => (
                        <div style={{ position: 'relative' }}>
                            {/* Checkbox in the Top-Left Corner */}
                            <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
                                <Checkbox
                                    checked={selectedAutomations.some((subscribers) => subscribers.name === rowData.name)}
                                    onChange={(e) => {
                                        if (e) {
                                            setSelectedAutomations((prev) => [...prev, rowData])
                                        } else {
                                            setSelectedAutomations((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
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
            <Pagination currentPage={1} totalResults={automations.length} resultsPerPage={20} onChange={handlePageChange} />
            {/* </div> */}
        </>
    )
}

export default AutomationsTable
