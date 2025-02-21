import './dashboard.scss'
import '../../fullpage.scss'
import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

const Dashboard = () => {
	const { user, account, loading, error } = useAccount()
	const [ statsData, setStatsData ] = useState({});
	const [ statsKey, setStatsKey ] = useState('all');
	const [ stats, setStats ] = useState([]); //[{label: 'Emails Sent',defaultValue: false},{label: 'Totals Clicks', defaultValue: false, }, {label: 'Total Opens',defaultValue: false,},{label: 'Spam',defaultValue: false}]
	const loadStats = async ()=>{
		if(!user) return;
		let stats = await ApiService.get('fairymailer/dashboard-stats',user.jwt);
		console.log('stats',stats.data);
		setStatsData(stats.data);
	}
	const createStatsMetrics = ()=>{
		let key = statsKey;
		if(!key || !statsData || !statsData[key]) return;
		let data = [];
			data.push({label:'Emails Sent', defaultValue:false, value: statsData[key].emails, percentage:0})
			data.push({label:'Total Opens', defaultValue:false, value: statsData[key].opens, percentage:0})
			data.push({label:'Total Clicks', defaultValue:false, value: statsData[key].clicks, percentage:0})
			data.push({label:'Spam', defaultValue:false, value: 0, percentage:0})
			console.log('stats data',data)
		setStats(data)
	}
	useEffect(()=>{
		createStatsMetrics()
	},[statsData, statsKey])
	useEffect(()=>{
		loadStats();
	},[user])
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
	return (
		<>
			<div className="dashboard-wrapper">
				<Sidemenu />
				<div className="dashboard-container">
					<PageHeader/>
					<div className="page-name-container">
						<div className="page-name">Dashboard</div>
					</div>
					<Card className="dashboard-stats">
						<div className="stats-head">
							<span className="stats-title">Campaigns</span>
							<ButtonGroup
								value="today"
								options={[
									{ value: 'today', label: 'Today' },
									{ value: 'd7', label: '7 Days' },
									{ value: 'd30', label: '30 Days' },
									{ value: 'all', label: 'All' },
								]}
								onChange={(value) => {
									setStatsKey(value);
								}}
							></ButtonGroup>
						</div>
						<div>
							<div className="campaign-charts d-flex gap-30">
								<Stat stats={stats} hasChart={true} defaultLabel={'Emails Sent'} />
								<Stat stats={stats} hasChart={true} defaultLabel={'Total Clicks'} />
								<Stat stats={stats} hasChart={true} defaultLabel={'Total Opens'} />
								<Stat stats={stats} hasChart={true} defaultLabel={'Spam'} />
							</div>
						</div>
					</Card>
					<div className="dashboard-ctas">
						<Button type={'secondary'}>
							<Icon name="Campaigns" />
							Create Campaign
						</Button>
						<Button type={'secondary'}>
							<Icon name="Contacts" />
							Import Contacts
						</Button>
						<Button type={'secondary'}>
							<Icon name="Automations" />
							Create Automation
						</Button>
					</div>
					<div className="columns-2">
						<Card className="subscribers-stats">
							<div className="stats-head">
								<span className="stats-title">Subscribers</span>
								<ButtonGroup
									value="today"
									options={[
										{ value: 'today', label: 'Today' },
										{ value: 'd7', label: '7 Days' },
										{ value: 'all', label: 'All' },
									]}
									onChange={(value) => {
										console.log(value)
									}}
								></ButtonGroup>
							</div>
							<br></br>
							<div className="campaign-charts d-flex gap-30">
								<div>
									<Stat stats={subs_stats} hasChart={false} defaultLabel={'Total'} />
								</div>
								<div>
									<Stat stats={subs_stats} hasChart={false} defaultLabel={'Unsubscribed'} />
								</div>
							</div>
							<br></br>
							<Button type={'secondary'}>All Subscribers</Button>
						</Card>
						<Card className="subscribers-stats">
							<div className="stats-head">
								<span className="stats-title">Latest Campaigns</span>
								<ButtonGroup
									value="today"
									options={[
										{ value: 'today', label: 'Today' },
										{ value: '7days', label: '7 Days' },
										{ value: 'all', label: 'All' },
									]}
									onChange={(value) => {
										console.log(value)
									}}
								></ButtonGroup>
							</div>
							<br></br>
							<Button type={'secondary'}>All Campaigns</Button>
						</Card>
					</div>
				</div>
			</div>
		</>
	)
}

export default Dashboard
