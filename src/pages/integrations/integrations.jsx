import '../dashboard/dashboard.scss'
import '../../fullpage.scss'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Button from '../../components/Button'
import './integrations.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import Pagination from '../../components/Pagination'

const account = {
	name: 'Cobalt Fairy',
	plan: 'Free Plan',
}
const user = {
	name: 'Cobalt Fairy',
	email: 'cf@fairymail.app',
}

// Active integrations (hardcoded)
const activeIntegrations = [
	{
		img: '/images/bookfunnel-logo.png',
		label: 'BookFunnel',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: true,
	},
]

// Available integrations (inactive)
const availableIntegrations = [
	{
		img: '/images/shopify-logo.png',
		label: 'Shopify',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: false,
	},
	{
		img: '/images/zapier-logo.png',
		label: 'Zapier',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: false,
	},
	{
		img: '/images/facebook-logo.png',
		label: 'Facebook',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: false,
	},
	{
		img: '/images/woocommerce-logo.png',
		label: 'WooCommerce',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: false,
	},
	{
		img: '/images/api-logo.png',
		label: 'API',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse venenatis dapibus.',
		isActive: false,
	},
]

const Integrations = () => {
	const navigate = useNavigate()
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const rowsPerPage = 6

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const filteredIntegrations = availableIntegrations.filter((integration) => integration.label.toLowerCase().includes(searchQuery.toLowerCase()))

	const startIndex = (currentPage - 1) * rowsPerPage
	const endIndex = startIndex + rowsPerPage
	const paginatedData = filteredIntegrations.slice(startIndex, endIndex)

	return (
		<>
			<div className="integrations-component">
				<div className="fm-page-wrapper">
					<Sidemenu />
					<div className="fm-page-container">
						<PageHeader user={user} account={account} />
						<div className="intergrations">
							<div className="integrations-table-container">
								<h2 style={{ fontFamily: 'Bitter', fontSize: '28px', fontWeight: '600' }} className="integrations-title">
									Integrations
								</h2>

								{/* Active Integrations Section */}
								<div className="integrations-container">
									<p className="integrations-subtitle">Active</p>
									<div className="selected-integrations">
										{activeIntegrations.map((integration, index) => (
											<Card key={index} className="integration-card active">
												<img src={integration.img} alt={integration.label} className="integration-icon" />
												<h3 className="integration-title">{integration.label}</h3>
												<p className="integration-description">{integration.description}</p>
												<div className="integration-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
													<Button type="secondary" disabled>
														Deactivate
													</Button>
													<Button type="secondary" onClick={() => navigate('/integrations/bookfunnel')}>
														Edit
													</Button>
												</div>
											</Card>
										))}
									</div>
								</div>

								{/* Available Integrations Section */}
								<div className="integrations-container">
									<p className="integrations-subtitle">All Available</p>
									<InputText style={{ width: '100%' }} placeholder="Search" label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
									<div className="integrations-grid">
										{paginatedData.map((integration, index) => (
											<Card key={index} className="integration-card disabled">
												<img src={integration.img} alt={integration.label} className="integration-icon" />
												<h3 className="integration-title">{integration.label}</h3>
												<p className="integration-description">{integration.description}</p>
												<Button type="secondary" disabled>
													Add
												</Button>
											</Card>
										))}
									</div>
									<Pagination currentPage={currentPage} totalResults={filteredIntegrations.length} resultsPerPage={rowsPerPage} onChange={handlePageChange} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Integrations
