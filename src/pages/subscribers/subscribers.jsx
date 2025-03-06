import SubscribersTable from '../../components/DataTable/SubscribersTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import './subscribers.scss'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import GroupsTable from '../../components/DataTable/GroupsTable'
import MultipleDropdown from '../../components/MultipleDropdown/MultipleDropdown'
import DatePicker from '../../components/DatePicker'

const Subscribers = () => {
	const { user, account } = useAccount()
	const [subscribers, setSubscribers] = useState([])
	const [totalSubs, setTotalSubs] = useState(0)
	const [groups, setGroups] = useState([])
	const [totalGroups, setTotalGroups] = useState(0)
	const [view, setView] = useState('subs')
	const [subscriberSearchValue, setSubscriberSearchValue] = useState('')

	const loadData = async () => {
		let resp = await ApiService.get(
			`fairymailer/getSubscribers?sort[0]=createdAt:desc&filters[email][$contains]=${subscriberSearchValue}&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1`,
			user.jwt
		)
		if (resp.data && resp.data.data) setSubscribers(resp.data.data)
		if (resp.data && resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)
		resp = await ApiService.get('fairymailer/getGroups?polulate=*', user.jwt)
		if (resp.data && resp.data.data) setGroups(resp.data.data)
		if (resp.data && resp.data.meta) setTotalGroups(resp.data.meta.pagination.total)
	}
	const renderAddButton = () => {
		switch (view) {
			case 'subs':
				return (
					<Button icon={'Plus'} type="action">
						{' '}
						Add Subscribers{' '}
					</Button>
				)
			case 'groups':
				return (
					<Button icon={'Plus'} type="action">
						{' '}
						Add Group{' '}
					</Button>
				)
			default:
				return <></>
		}
	}
	useEffect(() => {
		loadData()
	}, [user, subscriberSearchValue])
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="page-name-container">
						<div className="page-name">Subscribers</div>
						{renderAddButton()}
					</div>
					<div className="filters-container">
						<div className="button-group-wrapper">
							<ButtonGroup
								options={[
									{ value: 'subs', label: `All Subscribers (${totalSubs})` },
									{ value: null, label: `Segments (0)` },
									{ value: 'groups', label: `Groups (${totalGroups})` },
									{ value: null, label: `Fields (0)` },
									{ value: null, label: `History` },
									{ value: null, label: `Stats` },
									{ value: null, label: `Clean up` },
								]}
								onChange={(value) => {
									if (value) setView(value)
								}}
								value={'subs'}
							></ButtonGroup>
						</div>
						<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<InputText
								style={{ width: '100%', margin: 0, marginRight: '20px' }}
								placeholder="Search Subscribers"
								label="Search Subscribers"
								hasError={false}
								errorMessage="Name must be at least 3 characters long."
								value={subscriberSearchValue}
								onChange={(e) => {
									setSubscriberSearchValue(e.target.value)
								}}
							/>
							<Button type="secondary" icon={'Filters'} className="button-filters">
								{' '}
								Filters{' '}
							</Button>
						</div>
					</div>
					<Card className={'d-flex flex-column subscriber-filters-card gap-20'}>
						<div className="d-flex gap-20 ">
							<InputText label={'Email Contains'}></InputText>
							<InputText label={'Name'}></InputText>
							<MultipleDropdown style={{ width: 'auto' }} options={subscribers} selectedValues={[]} onOptionSelect={''} />
						</div>
						<div className="d-flex gap-20">
							<DatePicker
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(selection) => {
									console.log('selected date', selection)
								}}
							></DatePicker>
							<DatePicker
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(selection) => {
									console.log('selected date', selection)
								}}
							></DatePicker>
						</div>
						<div>
							<Button>Apply Filters</Button>
						</div>
					</Card>

					{view === 'subs' && (
						<div className="subscribers">
							<SubscribersTable subscribers={subscribers} resultsPerPage={10} />
						</div>
					)}

					{view === 'groups' && (
						<div className="groups">
							<GroupsTable groups={groups} />
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default Subscribers
