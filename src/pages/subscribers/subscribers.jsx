import SubscribersTable from '../../components/DataTable/SubscribersTable'
import '../dashboard/dashboard.scss'
import '../../fullpage.scss'

import { React, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

import qs from 'qs'

const Subscribers = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const { filterString } = useParams()

	const { user, account } = useAccount()
	const [subscribers, setSubscribers] = useState([])
	const [totalSubs, setTotalSubs] = useState(0)
	const [groups, setGroups] = useState([])
	const [totalGroups, setTotalGroups] = useState(0)
	const [view, setView] = useState('subs')
	const [subscriberSearchValue, setSubscriberSearchValue] = useState('')
	const [groupSearchValue, setGroupSearchValue] = useState('')
	const [showFilters, setShowFilters] = useState(false)

	const base64string = btoa(JSON.stringify({}))

	const groupOptions =
		groups &&
		groups.map((grp) => ({
			label: `${grp.name}`,
			value: `${grp.udid}`,
		}))

	const [subscribersFilters, setSubscribersFilters] = useState({
		email: '',
		name: '',
		groups: [],
		dateFrom: '',
		dateTo: '',
	})

	const handleFilterChange = (key, value) => {
		setSubscribersFilters((prev) => ({
			...prev,
			[key]: value,
		}))
	}

	const handleSelection = (selected) => {
		// const final = selected.map((selectedOption) => {
		// 	return selectedOption.value
		// })

		setSubscribersFilters((prev) => ({
			...prev,
			groups: selected,
		}))
		// currentCampaign.recp_groups = final;
		console.log('Selected Options:', selected)
	}

	const filterSubscribersAction = async () => {
		const groupIds = subscribersFilters.groups
			.map((selected) => {
				const matchedGroup = groups.find((group) => group.udid === selected.value)
				return matchedGroup ? matchedGroup.id : null
			})
			.filter((id) => id !== null)

		console.log('groups are : ', groupIds)

		const query = {
			filters: {
				email: subscribersFilters.email ? { $contains: subscribersFilters.email } : undefined,
				name: subscribersFilters.name ? { $contains: subscribersFilters.name } : undefined,
				groups: groupIds.length > 0 ? { id: { $in: groupIds } } : undefined,
				createdAt: {
					...(subscribersFilters.dateFrom ? { $gte: dayjs(subscribersFilters.dateFrom).tz('Europe/Athens').startOf('day').toISOString() } : {}),
					...(subscribersFilters.dateTo ? { $lte: dayjs(subscribersFilters.dateTo).tz('Europe/Athens').endOf('day').toISOString() } : {}),
				},
			},
		}

		Object.keys(query.filters).forEach((key) => {
			if (query.filters[key] === undefined) delete query.filters[key]
		})

		const queryString = qs.stringify(query, { encode: false })

		const subscribersResponse = await ApiService.get(`fairymailer/getSubscribers?${queryString}&pagination[page]=${1}&pagination[pageSize]=${100}&populate[groups][count]=1`, user.jwt) ///?page=${page}&pageSize=${pageSize}
		console.log('Subscribers', subscribersResponse)
		if (subscribersResponse && subscribersResponse.data && subscribersResponse.data.data) setSubscribers(subscribersResponse.data.data)
	}
	const loadData = async () => {
		let resp = await ApiService.get(
			`fairymailer/getSubscribers?sort[0]=createdAt:desc&filters[email][$contains]=${subscriberSearchValue}&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1`,
			user.jwt
		)
		if (resp.data && resp.data.data) setSubscribers(resp.data.data)
		if (resp.data && resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)

		resp = await ApiService.get(`fairymailer/getGroups?populate[subscribers][count]=true&filters[name][$contains]=${groupSearchValue}`, user.jwt)

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
					<Button onClick={() => navigate('/subscribers/group/new')} icon={'Plus'} type="action">
						{' '}
						Add Group{' '}
					</Button>
				)
			default:
				return <></>
		}
	}

	const handleOnUpdate = async () => {
		loadData()
	}

	useEffect(() => {
		loadData()
	}, [user, subscriberSearchValue, groupSearchValue, subscribersFilters])

	useEffect(() => {
		if (filterString) {
			const objfrombase64 = JSON.parse(atob(filterString))
			console.log('Filter String:', objfrombase64)
			const groupIdToFilter = groupOptions.find((grp) => {
				return grp.value === objfrombase64.group_udid
			})
			console.log('groupIdToFilter', groupIdToFilter)
			setSubscribersFilters((prev) => ({
				...prev,
				groups: [groupIdToFilter],
			}))
		}
	}, [filterString])

	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account} />
					<div className="page-name-container">
						{view === 'subs' && <div className="page-name">Subscribers</div>}
						{view === 'groups' && <div className="page-name">Groups</div>}
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
									setShowFilters(false)
								}}
								value={'subs'}
							></ButtonGroup>
						</div>

						{view === 'subs' && (
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
								<Button
									type="secondary"
									icon={'Filters'}
									className="button-filters"
									onClick={() => {
										setShowFilters((prev) => {
											return !prev
										})
									}}
								>
									{' '}
									Filters{' '}
								</Button>
							</div>
						)}

						{view === 'groups' && (
							<div className="input-text-container" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<InputText
									style={{ width: '100%', margin: 0, marginRight: '20px' }}
									placeholder="Search Groups"
									label="Search Groups"
									hasError={false}
									errorMessage="Name must be at least 3 characters long."
									value={groupSearchValue}
									onChange={(e) => {
										setGroupSearchValue(e.target.value)
									}}
								/>
							</div>
						)}
					</div>
					<Card style={{ display: showFilters ? 'flex' : 'none' }} className={'d-flex flex-column subscriber-filters-card gap-20 mt20'}>
						<div className="d-flex gap-20 ">
							<InputText value={subscribersFilters.email} onChange={(e) => handleFilterChange('email', e.target.value)} label={'Email Contains'}></InputText>
							<InputText value={subscribersFilters.name} onChange={(e) => handleFilterChange('name', e.target.value)} label={'Name'}></InputText>
							<MultipleDropdown style={{ width: 'auto' }} options={groupOptions} selectedValues={subscribersFilters.groups} onOptionSelect={handleSelection} />
						</div>
						<div className="d-flex gap-20">
							<DatePicker
								hasMinDate={false}
								hasDefaultDate={false}
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(e) => {
									console.log('selected date', e)
									handleFilterChange('dateFrom', e)
								}}
								value={subscribersFilters.dateFrom}
							></DatePicker>
							<DatePicker
								hasMinDate={false}
								dateFormat="d/m/Y"
								timeFormat={'H:i'}
								pickerType="date"
								onChange={(e) => {
									console.log('selected date', e)
									handleFilterChange('dateTo', e)
								}}
								value={subscribersFilters.dateTo}
							></DatePicker>
						</div>
						<div>
							<Button onClick={filterSubscribersAction}>Apply Filters</Button>
						</div>
					</Card>

					{view === 'subs' && (
						<div className="subscribers">
							<SubscribersTable subscribers={subscribers} resultsPerPage={10} onUpdate={handleOnUpdate} />
						</div>
					)}

					{view === 'groups' && (
						<div className="groups">
							<GroupsTable
								groups={groups}
								resultsPerPage={10}
								onUpdate={handleOnUpdate}
								setView={setView}
								setShowFilters={setShowFilters}
								setSubscribersFilters={setSubscribersFilters}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default Subscribers
