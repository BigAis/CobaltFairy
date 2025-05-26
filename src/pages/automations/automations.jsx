import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './automations.scss'

import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Stat from '../../components/Stat/Stat'
import ButtonGroup from '../../components/ButtonGroup'
import InputText from '../../components/InputText/InputText'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import AutomationsTable from '../../components/DataTable/AutomationsTable'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/SearchBar/SearchBar';

const Automations = ()=>{
    const {user, account} = useAccount(); 
    const [automations,setAutomations] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();


    const loadData = async () =>{
        let resp = await ApiService.get('fairymailer/getAutomations?sort[0]=createdAt:desc&pagination[pageSize]=1000&pagination[page]=1&',user.jwt)
        if(resp.data && resp.data.data) setAutomations(resp.data.data.map(data=>{
            data.createdAt = data.createdAt.split('T')[0];
            return data;
        }))
        // if(resp.data && resp.data.meta) setTotalSubs(resp.data.meta.pagination.total)
    }

	// Add a search function
	const searchAutomations = async (term) => {
	try {
		setSearchTerm(term);
		
		let resp = await ApiService.get(
		`fairymailer/getAutomations?sort[0]=createdAt:desc&filters[name][$contains]=${term}&pagination[pageSize]=1000&pagination[page]=1&`,
		user.jwt
		);
		
		if (resp.data && resp.data.data) {
		setAutomations(resp.data.data.map(data => {
			data.createdAt = data.createdAt.split('T')[0];
			return data;
		}));
		}
	} catch (error) {
		console.error('Error searching automations:', error);
	}
	};
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
						<div className="page-name">Automations</div>
						<Button icon={'Plus'} type="action" onClick={()=>{navigate('/automations/new')}}>
							Add Automation
						</Button>
					</div>
					<div className="filters-container">
					<div className="input-text-container" style={{marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
						<SearchBar
						placeholder="Search Automations" 
						label="Search Automations"
						initialValue={searchTerm}
						onSearch={searchAutomations}
						style={{ width: '100%', marginRight: '20px' }}
						/>
						<Button type="secondary" icon={'Filters'} className="button-filters"> Filters </Button>
					</div>
					</div>
					<div className="groups">
							{automations && automations.length>0 && <AutomationsTable incomingAutomations={automations} />}
                    </div>

				</div>
			</div>
		</>
	)
}

export default Automations