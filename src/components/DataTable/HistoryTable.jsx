import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Skeleton } from 'primereact/skeleton'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import './DataTable.scss'
import Pagination from '../Pagination'
import { useState } from 'react'

const HistoryTable = ({ historyData = [], totalResults = 0, loading = false }) => {
	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = 10

	// Pagination logic
	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = historyData.slice(startIndex, endIndex)

	// Handle page change
	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	// Format date function
	const formatDate = (dateString) => {
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch {
			return 'Invalid Date'
		}
	}

	// Date column body template
	const dateBodyTemplate = (rowData) => {
		if (loading) return <Skeleton />
		return formatDate(rowData.createdAt)
	}

	// Name column body template
	const nameBodyTemplate = (rowData) => {
		if (loading) return <Skeleton />
		return rowData.name
	}

	// Type column body template to show what kind of action it was
	const typeBodyTemplate = (rowData) => {
		if (loading) return <Skeleton />

		const type = rowData.meta?.type
		const subtype = rowData.meta?.subtype

		let displayType = type
		if (subtype) {
			displayType += ` (${subtype})`
		}

		// Capitalize first letter
		return displayType ? displayType.charAt(0).toUpperCase() + displayType.slice(1) : 'Unknown'
	}

	// Details column to show relevant information based on type
	const detailsBodyTemplate = (rowData) => {
		if (loading) return <Skeleton />

		const { meta } = rowData
		if (!meta) return '-'

		switch (meta.type) {
			case 'cleanup':
				return `${meta.deletedCount} deleted`
			case 'export':
				return `${meta.amount} exported`
			case 'import':
				return `${meta.amount} imported${meta.failures?.length > 0 ? ` (${meta.failures.length} failed)` : ''}`
			default:
				return '-'
		}
	}

	return (
		<>
			<DataTable value={paginatedData} paginator={false} dataKey="id" rowClassName={() => 'p-table-row'} emptyMessage={loading ? 'Loading...' : 'No history records found'}>
				<Column field="createdAt" header="Date" body={(rowData) => (loading ? <Skeleton /> : dateBodyTemplate(rowData))} style={{ width: '25%' }} />
				<Column field="name" header="Action" body={(rowData) => (loading ? <Skeleton /> : nameBodyTemplate(rowData))} style={{ width: '35%' }} />
				<Column field="type" header="Type" body={(rowData) => (loading ? <Skeleton /> : typeBodyTemplate(rowData))} style={{ width: '20%' }} />
				<Column field="details" header="Details" body={(rowData) => (loading ? <Skeleton /> : detailsBodyTemplate(rowData))} style={{ width: '20%' }} />
			</DataTable>
			<Pagination currentPage={currentPage} totalResults={totalResults} resultsPerPage={rowsPerPage} onChange={handlePageChange} />
		</>
	)
}

export default HistoryTable
