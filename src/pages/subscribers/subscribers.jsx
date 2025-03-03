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

const Subscribers = () => {
	const {user, account} = useAccount(); 
	const [subscribers,setSubscribers] = useState([]);
	const [totalSubs,setTotalSubs] = useState(0);
	const [groups,setGroups] = useState([]);
	const [totalGroups,setTotalGroups] = useState(0);
	const [view , setView] = useState('subs');

	const loadData = async ()=>{
		let resp = await ApiService.get('fairymailer/getSubscribers?sort[0]=createdAt:desc&pagination[pageSize]=1000&pagination[page]=1&populate[groups][count]=1',user.jwt)
		if(resp.data && resp.data.data) setSubscribers(resp.data.data)
		if(resp.data && resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)
		resp = await ApiService.get('fairymailer/getGroups?polulate=*', user.jwt)
		if(resp.data && resp.data.data) setGroups(resp.data.data)
		if(resp.data && resp.data.meta) setTotalGroups(resp.data.meta.pagination.total)
	}
	const renderAddButton =()=>{
		switch(view){
			case "subs": return (<Button icon={'Plus'} type="action"> Add Subscribers </Button>);
			case "groups": return (<Button icon={'Plus'} type="action"> Add Group </Button>);
			default: return <></>
		}
	}
	useEffect(()=>{
		loadData()
	},[user])
	return (
		<>
			<div className="fm-page-wrapper">
				<Sidemenu />
				<div className="fm-page-container">
					<PageHeader user={user} account={account}/>
					<div className="page-name-container">
						<div className="page-name">Subscribers</div>
						{renderAddButton()}
					</div>
					<div className="filters-container">
						<div className="button-group-wrapper">
							<ButtonGroup
								options={[
									{ value:'subs', label: `All Subscribers (${totalSubs})` },
									{ value:null, label: `Segments (0)` },
									{ value:'groups', label: `Groups (${totalGroups})` },
									{ value:null, label: `Fields (0)` },
                                    { value:null, label: `History` },
									{ value:null, label: `Stats` },
									{ value:null, label: `Clean up` },

								]}
								onChange={(value) => {
									if(value)setView(value)
								}}
							></ButtonGroup>
						</div>
						<div className="input-text-container" style={{marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
							<InputText style={{ width: '100%', margin:0, marginRight:'20px' }} placeholder="Search Subscribers" label="Search Subscribers" hasError={false} errorMessage="Name must be at least 3 characters long." />
							<Button type="secondary" icon={'Filters'} className="button-filters"> Filters </Button>
						</div>
					</div>

					{view==="subs" && (
						<div className="subscribers">
							<SubscribersTable subscribers={subscribers} />
						</div>
					)}

					{view==="groups" && (
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
