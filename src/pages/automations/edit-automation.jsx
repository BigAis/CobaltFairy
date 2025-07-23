import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './automations.scss'
import Stepper from '../../components/Stepper/Stepper'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccount } from '../../context/AccountContext'
import Skeleton from 'react-loading-skeleton'
import { ApiService } from '../../service/api-service'
import InputText from '../../components/InputText/InputText'
import Button from '../../components/Button'
import { v4 as uuidv4 } from 'uuid'
import PopupText from '../../components/PopupText/PopupText'

const EditAutomation = ()=>{
    const {user,account} = useAccount()
    const steps = [
        {label:'Automations'},
        {label:'Edit Automation'},
        {label:'Editor'},
    ];
    const [automationData, setAutomationData] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const params = useParams();
    const isEdit = params.autId!=="new";
    
    const loadData = async()=>{
        if(isEdit){
            let automationresp = await ApiService.get(`fairymailer/getAutomations?filters[uuid]=${params.autId}&populate=*`, user.jwt)
            if(automationresp&& automationresp.data){
                console.log(automationresp.data)
                setAutomationData(automationresp.data.data[0])
            }
        }
    }
    
    const handleNameChange = (e)=>{
        if(!automationData) setAutomationData({name:e.target.value,design:[],uuid:uuidv4()});
        else setAutomationData({...automationData, name:e.target.value})
    }
    
    const saveAutomation = async ()=>{
        if(!automationData || !automationData.name || !automationData.uuid){
            PopupText.fire({
                icon:'warning',
                text:'Please type a name first',
                showCancelButton:false
            })
            return false;
        }
        let resp;
        if(automationData.id){
            resp = await ApiService.put(`automations/${automationData.id}`,{data:{name:automationData.name}},user.jwt)
        }else{
            automationData.account = account.id// we need to fix this in backend.
            resp = await ApiService.post(`automations`,{data:automationData},user.jwt)
        }
        console.log('respdata',resp.data);
        return true
    }
    
    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(()=>{
        loadData();
    },[user])
    
    return (
        <div className='edit-automation-wrapper'>
            <div className='edit-automation-header'>
                <Stepper 
                    steps={steps} 
                    current={1} 
                    setStep={()=>{navigate('/automations')}} 
                    hasBack={true} 
                    minStep={{step:1,url:'/automations'}}
                />
            </div>
            <div className='edit-automation-body'>
                <>
                    <h3> {isEdit ? 'Editing Automation' : 'Add new automation'} </h3>
                    <InputText 
                        value={automationData ? automationData.name : ''} 
                        label={'Automation name'} 
                        onChange={handleNameChange}
                    />
                    <br></br>
                    <div className='buttons'>
                        <Button type="secondary" onClick={ async ()=>{
                            let result = await saveAutomation();
                            if(result) navigate('/automations')
                        }}>Save & back</Button>
                        <Button type="primary" style={{fontSize:'16px'}} onClick={async () => {
                            let result = await saveAutomation();
                            if (result) {
                                if (isMobile) {
                                    PopupText.fire({
                                        icon: 'warning',
                                        text: 'The automation flow editor is not available on mobile devices. Please use a desktop computer to edit your automation flow.',
                                        showCancelButton: false,
                                        confirmButtonText: 'OK',
                                    });
                                } else {
                                    navigate(`/automations/editor/${automationData.uuid}`);
                                }
                            }
                        }}>Edit flow</Button>
                    </div>
                </>
            </div>
        </div>
    )
}

export default EditAutomation;