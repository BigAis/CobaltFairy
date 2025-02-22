import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'

const GroupsTable = ({ groups }) => {

    const [selectedGroups, setSelectedGroups] = useState([])

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
    const handleLeftClick = () => {
        alert('Left action triggered!')
    }

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedData = groups.slice(startIndex, endIndex)

    useEffect(() => {

    }, [selectedGroups])

    const actionsBodyTemplate = () => {
        return (
            <div>
                <Dropdown withDivider={true} icon={'Plus'} options={dropdownOptions} onLeftClick={handleLeftClick}>
                    Edit
                </Dropdown>
            </div>
        )
    }

    return (
        // <div>
        <>
            <DataTable value={paginatedData} paginator={false} selection={selectedGroups} onSelectionChange={(e) => setSelectedGroups(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
                <Column
                    body={(rowData) => (
                        <div style={{ position: 'relative' }}>
                            {/* Checkbox in the Top-Left Corner */}
                            <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
                                <Checkbox
                                    checked={selectedGroups.some((subscribers) => subscribers.name === rowData.name)}
                                    onChange={(e) => {
                                        if (e) {
                                            setSelectedGroups((prev) => [...prev, rowData])
                                        } else {
                                            setSelectedGroups((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    header={() => (
                        <Checkbox
                            checked={selectedGroups.length === paginatedData.length && selectedGroups.length > 0}
                            onChange={(e) => {
                                if (e) {
                                    setSelectedGroups([...paginatedData])
                                } else {
                                    setSelectedGroups([])
                                }
                            }}
                        />
                    )}
                    headerStyle={{ width: '80px' }}
                />
                <Column field="name" header="Name" />
                <Column field="click_rate" header="Subscribers" />
                <Column field="open_rate" header="Opens" />
                <Column field="click_rate" header="Click" />
                <Column header="Actions" body={actionsBodyTemplate} />
            </DataTable>
            <Pagination currentPage={1} totalResults={groups.length} resultsPerPage={20} onChange={handlePageChange} />
            {/* </div> */}
        </>
    )
}

export default GroupsTable
