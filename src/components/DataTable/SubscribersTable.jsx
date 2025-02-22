import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import Dropdown from '../Dropdown'
import Checkbox from '../Checkbox'

const SubscribersTable = ({ subscribers }) => {

    const [selectedSubscribers, setSelectedSubscribers] = useState([])

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
    const paginatedData = subscribers.slice(startIndex, endIndex)

    useEffect(() => {
        console.log('selected subscribers : ', selectedSubscribers)
    }, [selectedSubscribers])

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
            <DataTable value={paginatedData} paginator={false} selection={selectedSubscribers} onSelectionChange={(e) => setSelectedSubscribers(e.value)} dataKey="name" rowClassName={() => 'p-table-row'}>
                <Column
                    body={(rowData) => (
                        <div style={{ position: 'relative' }}>
                            {/* Checkbox in the Top-Left Corner */}
                            <div style={{ position: 'absolute', top: '-10px', left: '5px' }}>
                                <Checkbox
                                    checked={selectedSubscribers.some((subscribers) => subscribers.name === rowData.name)}
                                    onChange={(e) => {
                                        if (e) {
                                            setSelectedSubscribers((prev) => [...prev, rowData])
                                        } else {
                                            setSelectedSubscribers((prev) => prev.filter((subscribers) => subscribers.name !== rowData.name))
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    header={() => (
                        <Checkbox
                            checked={selectedSubscribers.length === paginatedData.length && selectedSubscribers.length > 0}
                            onChange={(e) => {
                                if (e) {
                                    setSelectedSubscribers([...paginatedData])
                                } else {
                                    setSelectedSubscribers([])
                                }
                            }}
                        />
                    )}
                    headerStyle={{ width: '80px' }}
                />
                <Column field="name" header="Name" />
                <Column field="email" header="Email" />
                <Column field="emailSent" header="Email Sent" />
                <Column field="emailOpens" header="Email Opens" />
                <Column field="emailClicks" header="Email Clicks" />
                <Column field="createdAt" header="Subscribed" />
                <Column header="Actions" body={actionsBodyTemplate} />
            </DataTable>
            <Pagination currentPage={1} totalResults={subscribers.length} resultsPerPage={10} onChange={handlePageChange} />
            {/* </div> */}
        </>
    )
}

export default SubscribersTable
