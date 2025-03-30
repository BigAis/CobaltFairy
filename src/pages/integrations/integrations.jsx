import IntegrationsTable from '../../components/DataTable/IntegrationsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
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

const integrations = [
	{ img: '/images/bookfunnel-logo.png', label: 'BookFunnel', Description: 'Lorem ispum book leads platform' },
	{ img: '/images/woocommerce-logo.png', label: 'WooCommerce', Description: 'Lorem ispum e-commerce platform' },
	{ img: '/images/shopify-logo.png', label: 'Shopify', Description: 'Lorem ispum e-commerce platform' },
	{ img: '/images/zapier-logo.png', label: 'Zapier', descriptin: 'Lorem Ipsum lorem ispum dolor sit amet description.' },
	{ img: '/images/facebook-logo.png', label: 'Facebook', description: 'Lorem Ipsum lorem ispum dolor sit amet description.' },
	{ img: '/images/api-logo.png', label: 'API', description: 'Lorem Ipsum lorem ispum dolor sit amet description.' },
]

const Integrations = () => {
	const navigate = useNavigate()
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedIntegrations, setSelectedIntegrations] = useState([])
	const [availableIntegrations, setAvailableIntegrations] = useState(integrations)
	const rowsPerPage = 6

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const handleAddIntegration = (integration) => {
		setSelectedIntegrations((prev) => {
			if (!prev.some((item) => item.label === integration.label)) {
				return [...prev, integration]
			}
			return prev
		})
		setAvailableIntegrations((prev) => prev.filter((item) => item.label !== integration.label))
		setSearchQuery('')
	}

	const handleRemoveIntegration = (integration) => {
		setAvailableIntegrations((prev) => [...prev, integration])
		setSelectedIntegrations((prev) => prev.filter((item) => item.label !== integration.label))
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
								<h2 className="integrations-title">Integrations</h2>
								{selectedIntegrations.length > 0 && (
									<>
										<div className="integrations-container">
											<p className="integrations-subtitle">Active</p>
											<div className="selected-integrations">
												{selectedIntegrations.map((integration, index) => (
													<Card key={index} className={'integration-card ' + (integration.label != 'BookFunnel' ? 'disabled' : '')}>
														<img src={integration.img} alt={integration.label} className="integration-icon" />
														<h3 className="integration-title">{integration.label}</h3>
														<p className="integration-description">{integration.Description}</p>
														<div className="integration-buttons">
															<Button className="integration-remove-button" type="secondary" onClick={() => handleRemoveIntegration(integration)}>
																Deactivate
															</Button>
															<Button className="integration-edit-button" type="primary">
																Edit
															</Button>
														</div>
													</Card>
												))}
											</div>
										</div>
									</>
								)}
								<p className="integrations-subtitle">All Available</p>
								<div className="integrations-container">
									<InputText style={{ width: '100%' }} placeholder="Search" label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
									<div className="integrations-grid">
										{paginatedData.map((integration, index) => (
											<Card key={index} className={'integration-card ' + (integration.label != 'BookFunnel' ? 'disabled' : '')}>
												<img src={integration.img} alt={integration.label} className="integration-icon" />
												<h3 className="integration-title">{integration.label}</h3>
												<p className="integration-description">{integration.Description}</p>
												{integration.label === 'BookFunnel' ? (
													<Button className="integration-add-button" type="secondary" onClick={() => navigate('/integrations/bookfunnel')}>
														View
													</Button>
												) : (
													<Button className="integration-add-button" type="secondary" onClick={() => handleAddIntegration(integration)}>
														Add
													</Button>
												)}
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
