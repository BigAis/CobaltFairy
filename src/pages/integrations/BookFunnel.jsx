import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ApiService } from '../../service/api-service'
import { useAccount } from '../../context/AccountContext'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import Button from '../../components/Button'
import BookFunnelIntegrationsTable from '../../components/DataTable/IntegrationBookFunnelTable'
import Dropdown from '../../components/Dropdown'
import SearchBar from '../../components/SearchBar/SearchBar'
import Card from '../../components/Card'
import './integrations.scss'

const BookFunnel = () => {
	const { user, account, createNotification } = useAccount()
	const navigate = useNavigate()
	const { mode } = useParams()
	const [currentPage] = useState(1)
	const [itemsPerPage] = useState(20)
	const [integrations, setIntegrations] = useState([])
	const [meta, setMeta] = useState(null)
	const [loading, setLoading] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')

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

	// Get BookFunnel integrations
	const getIntegrations = useCallback(async () => {
		try {
			setLoading(true)
			const response = await ApiService.get(
				// `fairymailer/bookfunnel-integrations?pagination[page]=${currentPage}&pagination[pageSize]=${itemsPerPage}`,
				`fairymailer/bookfunnel-maps?populate[group]=true&pagination[page]=${currentPage}&pagination[pageSize]=${itemsPerPage}`,
				user.jwt
			)
			if (response.data && response.data.data) {
				setIntegrations(response.data.data)
				if (response.data.meta) {
					setMeta(response.data.meta)
				}
			}
		} catch (error) {
			console.error('Error fetching BookFunnel integrations:', error)
			createNotification({
				message: 'Error fetching integrations. Please try again.',
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}, [user, createNotification, currentPage, itemsPerPage])

	// Search function for BookFunnel integrations
	const searchIntegrations = async (term) => {
		try {
			setSearchTerm(term)
			setLoading(true)

			const response = await ApiService.get(`fairymailer/bookfunnel-integrations?filters[name][$contains]=${term}&pagination[page]=${currentPage}&pagination[pageSize]=${itemsPerPage}`, user.jwt)

			if (response.data && response.data.data) {
				setIntegrations(response.data.data)
				if (response.data.meta) {
					setMeta(response.data.meta)
				}
			}
		} catch (error) {
			console.error('Error searching BookFunnel integrations:', error)
			createNotification({
				message: 'Error searching integrations. Please try again.',
				type: 'warning',
			})
		} finally {
			setLoading(false)
		}
	}

	const getBookFunnelBooks = useCallback(async () => {
		try {
			let refresh = await ApiService.get('fairymailer/bookfunnel-fetch', user.jwt)
			console.log('Book funnel books:', refresh.data.data)
			setBookFunnelBooks(refresh.data.data)
		} catch (error) {
			console.error('Error fetching book funnel books:', error)
			createNotification({
				message: 'Error fetching Book Funnel books. Please try again.',
				type: 'warning',
			})
		}
	}, [user, createNotification])

	const getGroups = useCallback(async () => {
		try {
			let groups = await ApiService.get(`fairymailer/getGroups/?populate[subscribers][count]=true&pagination[page]=1&pagination[pageSize]=100`, user.jwt)
			console.log('groups', groups.data.data)
			setGroups(groups.data.data)
		} catch (error) {
			console.error('Error fetching groups:', error)
			createNotification({
				message: 'Error fetching groups. Please try again.',
				type: 'warning',
			})
		}
	}, [user, createNotification])

	const saveBookFunnelIntegration = async () => {
		try {
			if (!selectedBookFunnelBook || !selectedGroup) {
				createNotification({
					message: 'Please select both a Book Funnel page and a group',
					type: 'warning',
				})
				return
			}

			await ApiService.post(
				'bookfunnel-maps',
				{
					data: {
						bf_page: selectedBookFunnelBook.value,
						group: selectedGroup.value,
						account: account.id,
					},
				},
				user.jwt
			).then((res) => {
				console.log('saveResult', res)
				createNotification({
					message: 'Book Funnel integration saved successfully!',
					type: 'default',
					autoClose: 3000,
				})
				window.location.reload()
			})
		} catch (error) {
			console.error('Error saving integration:', error)
			createNotification({
				message: 'Error saving integration. Please try again.',
				type: 'warning',
			})
		}
	}

	useEffect(() => {
		if (user && mode !== 'new') {
			getIntegrations()
		}
	}, [user, mode, currentPage, itemsPerPage, getIntegrations])

	useEffect(() => {
		if (user && mode === 'new') {
			getBookFunnelBooks()
			getGroups()
		}
	}, [user, mode, getBookFunnelBooks, getGroups])

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />

					{mode !== 'new' ? (
						<>
							<div className="page-name-container">
								<div className="page-name">
									<Link to="/integrations" className="integration-breadcrumb">
										All Integrations
									</Link>{' '}
									{'>'} <span>Book Funnel</span>
								</div>
								<Button icon={'Plus'} type="action" onClick={() => navigate('/integrations/bookfunnel/new')}>
									New Integration
								</Button>
							</div>
							<div className="filters-container">
								<div className="row" style={{ marginBottom: '1rem' }}></div>
								<div className="row d-flex content-space-between">
									<SearchBar placeholder="Search Integrations" label="Search Integrations" initialValue={searchTerm} onSearch={searchIntegrations} style={{ width: '100%' }} />
								</div>
							</div>
							<div>
								{loading ? (
									<Card>
										<div className="text-center p-4">Loading integrations...</div>
									</Card>
								) : integrations && integrations.length > 0 ? (
									<BookFunnelIntegrationsTable integrations={integrations} meta={meta} />
								) : (
									<Card>
										<div className="text-center p-4">
											<p>No integrations found.</p>
											{searchTerm && (
												<Button
													type="secondary"
													onClick={() => {
														setSearchTerm('')
														getIntegrations()
													}}
												>
													Clear Search
												</Button>
											)}
										</div>
									</Card>
								)}
							</div>
						</>
					) : (
						<>
							<div className="page-name-container">
								<div className="page-name">
									<Link to="/integrations" className="integration-breadcrumb" style={{ color: '#000000 !important' }}>
										All Integrations
									</Link>{' '}
									{'>'} <span>Book Funnel</span>
								</div>
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
