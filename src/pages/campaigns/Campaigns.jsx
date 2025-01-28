import CampaignsTable from '../../components/DataTable/CampaignsTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './campaigns.scss'
import InputText from '../../components/InputText/InputText'

const account = {
	name: 'Cobalt Fairy',
	plan: 'Free Plan',
}
const user = {
	name: 'Cobalt Fairy',
	email: 'cf@fairymail.app',
}
const getNameInitials = (name) =>
	name
		.split(' ')
		.map((word) => word[0].toUpperCase())
		.join('')
const stats = [
	{
		label: 'Emails Sent',
		value: '752',
		percentage: -12,
		defaultValue: false, // This will be the default selected option
	},
	{
		label: 'Totals Clicks',
		value: '159',
		percentage: 17,
		defaultValue: false,
	},
	{
		label: 'Total Opens',
		value: '340',
		percentage: 19,
		defaultValue: false,
	},
	{
		label: 'Spam',
		value: '85',
		percentage: 5,
		defaultValue: false,
	},
]
const subs_stats = [
	{
		label: 'Total',
		value: '752',
		default: false,
		percentage: 5,
	},
	{
		label: 'Unsubscribed',
		value: '159',
		default: true,
		percentage: 5,
	},
]

const Campaigns = () => {
	return (
		<>
			<div className="dashboard-wrapper">
				<Sidemenu />
				<div className="dashboard-container">
					<div className="dashboard-head">
						<Card className="account-info-card">
							<div className="account-info">
								<div>
									<h4>{account.name}</h4>
									<span>{account.plan}</span>
								</div>
								<Icon name="Caret" size={16} />
							</div>
						</Card>
						<div className="user-info">
							<Card>{getNameInitials(user.name)}</Card>
							<div className="user">
								<h4>{user.name}</h4>
								<span>{user.email}</span>
							</div>
							<Icon name="Caret" size={24} />
						</div>
					</div>
					<div className="page-name-container">
						<div className="page-name">Campaigns</div>
						<Button icon={'Plus'} type="action">
							New Campaign
						</Button>
					</div>
					<div className="filters-container">
						<div className="row">
							<ButtonGroup
								value="today"
								options={[
									{ value: 'today', label: 'Sent (2)' },
									{ value: '7days', label: 'Draft (1)' },
									{ value: '30days', label: 'Outbox (0)' },
									{ value: 'all', label: 'Tempaltes (4)' },
								]}
								onChange={(value) => {
									console.log(value)
								}}
							></ButtonGroup>
						</div>
						<div className="row d-flex content-space-between">
							<InputText style={{ width: '85%' }} placeholder="Search Campaign" label="Search Campaign" hasError={false} errorMessage="Name must be at least 3 characters long." />
							<Button type="secondary" icon={'Filters'}>
								Filters
							</Button>
						</div>
					</div>

					<div className="">
						<CampaignsTable />
					</div>
				</div>
			</div>
		</>
	)
}

export default Campaigns
