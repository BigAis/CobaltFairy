import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiService } from '../../service/api-service'
import PopupText from '../../components/PopupText/PopupText'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import NotificationBar from '../../components/NotificationBar/NotificationBar'
import Button from '../../components/Button'
import BookFunnelIntegrationsTable from '../../components/DataTable/IntegrationBookFunnelTable'
import InputText from '../../components/InputText/InputText'
import Dropdown from '../../components/Dropdown'

const BookFunnel = () => {
	const { user, account } = useAccount()
	const navigate = useNavigate()
	const { mode } = useParams()
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(20)
	const [integrations, setIntegrations] = useState([])
	const [meta, setMeta] = useState(null)
	const [notifications, setNotifications] = useState([])

	const [bookFunnelBooks, setBookFunnelBooks] = useState([])
	const [groups, setGroups] = useState([])
	const [selectedBookFunnelBook, setSelectedBookFunnelBook] = useState(null)
	const [selectedGroup, setSelectedGroup] = useState(null)
	const bookFunnelBooksOptions = bookFunnelBooks.map((book) => ({
		value: book,
		label: book.name,
	}))

	const groupsOptions = groups.map((group) => ({
		value: group.id,
		label: group.name,
	}))

	const dropdownOptions = [
		{ value: 'option1', label: 'Option 1' },
		{ value: 'option2', label: 'Option 2' },
		{ value: 'option3', label: 'Option 3' },
	]

	const getBookFunnelBooks = async () => {
		try {
			let refresh = await ApiService.get('fairymailer/bookfunnel-fetch', user.jwt)
			console.log('Book funnel books:', refresh.data.data)
			setBookFunnelBooks(refresh.data.data)
		} catch (error) {
			console.error('Error fetching book funnel books:', error)
		}
	}

	const getGroups = async () => {
		try {
			let groups = await ApiService.get(`fairymailer/getGroups/?populate[subscribers][count]=true&pagination[page]=1&pagination[pageSize]=100`, user.jwt)
			console.log('groups', groups.data.data)
			setGroups(groups.data.data)
		} catch (error) {
			console.error('Error fetching groups:', error)
		}
	}

	const saveBookFunnelIntegration = async () => {
		try {
			await ApiService.post(
				'bookfunnel-maps',
				{
					data: {
						bf_page: selectedBookFunnelBook,
						group: selectedGroup.value,
						account: account.id,
					},
				},
				user.jwt
			).then((res) => {
				console.log('saveResult', res)
				window.location.reload()
			})
		} catch (error) {
			console.error('Error saving integration:', error)
		}
	}

	useEffect(() => {
		if (user && mode === 'new') {
			getBookFunnelBooks()
			getGroups()
		}
	}, [user, mode])

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					{notifications && notifications.length > 0 && (
						<div className="notifications-container">
							{notifications.map((n, i) => {
								return <NotificationBar key={i} type={n.type || 'default'} message={n.message} onClose={n.onClose} />
							})}
						</div>
					)}
					<PageHeader user={user} account={account} />

					{mode !== 'new' ? (
						<>
							<div className="page-name-container">
								<div className="page-name">Book Funnel Integration</div>
								<Button icon={'Plus'} type="action" onClick={() => navigate('/integrations/bookfunnel/new')}>
									New Integration
								</Button>
							</div>
							<div className="filters-container">
								<div className="row" style={{ marginBottom: '1rem' }}></div>
								<div className="row d-flex content-space-between">
									{/* <InputText
								onChange={(e) => updateSearchTerm(e.target.value)}
								style={{ width: '100%' }}
								placeholder="Search Campaign"
								label="Search Campaign"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
							/> */}
									{/* <Button type="secondary" icon={'Filters'}>
								Filters
							</Button> */}
								</div>
							</div>
							<div>
								<BookFunnelIntegrationsTable />
							</div>
						</>
					) : (
						<>
							<div className="page-name-container">
								<div className="page-name">Add New Book Funnel Integration</div>
							</div>
							<div className="d-flex flex-column gap-10">
								<Dropdown searchable icon={'Plus'} options={bookFunnelBooksOptions} onOptionSelect={(e) => setSelectedBookFunnelBook(e)}>
									Please select book funnel page
								</Dropdown>
								<Dropdown searchable icon={'Plus'} options={groupsOptions} onOptionSelect={(e) => setSelectedGroup(e)}>
									Please select group
								</Dropdown>
								<Button onClick={saveBookFunnelIntegration}>Save</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}

export default BookFunnel
