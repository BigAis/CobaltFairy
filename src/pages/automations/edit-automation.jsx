import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './automations.scss'
import Stepper from '../../components/Stepper/Stepper'
import { useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Skeleton from 'react-loading-skeleton'
import { ApiService } from '../../service/api-service'
import InputText from '../../components/InputText/InputText'

 
const EditAutomation = ()=>{
    const {user,account} = useAccount()
    const steps = [
        {label:'Automations'},
        {label:'Edit Automation'},
        {label:'Editor'},
    ];
    const [automationData, setAutomationData] = useState(null)
    const params = useParams();
    const isEdit = params.autId!=="new";
    const loadData = async()=>{
        let automationresp = await ApiService.get(`fairymailer/getAutomations?filters[uuid]=${params.autId}&populate=*`, user.jwt)
        if(automationresp&& automationresp.data){
            console.log(automationresp.data)
            setAutomationData(automationresp.data.data[0])
        }
    }
    useEffect(()=>{
        loadData();
    },[user])
    return (
        <div className='edit-automation-wrapper'>
            <div className='edit-automation-header'>
                <Stepper steps={steps} current={1}></Stepper>
            </div>
            <div className='edit-automation-body'>
                {isEdit ? (
                
                    <h3>Editing Automation </h3>
                    
                ) : (
                    <h3>Add new automation</h3>
                )}
            </div>

        </div>
    )
}

export default EditAutomation;