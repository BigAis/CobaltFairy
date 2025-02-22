import '../accountPicker/accountPicker.scss'
import '../../fullpage.scss'

import { React, useEffect, useState } from 'react'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Icon from '../../components/Icon/Icon'
import Button from '../../components/Button'
import Logo from '../../components/Logo/Logo'
import User from '../../service/User'
import { ApiService } from '../../service/api-service'
import { useNavigate } from 'react-router-dom'
import PopupText from '../../components/PopupText/PopupText'


const AccountPicker = ()=>{
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([{name:'test'}]);
    const chooseAccount = async (aid) => {
        const jwt = User.get().jwt;
        let accountchosen = await ApiService.post('fairymailer/chooseUserAccount',{account_id:aid},jwt)
        console.log('respaccount',accountchosen.data)
        window.location='/' // no navigate
    }
    useEffect(()=>{
        setAccounts(User.getAccounts())
    },[])
    
    const notReadyYet = async ()=>{
        const result = await PopupText.fire({
            icon: 'warning',
            text: 'This action is not possible yet (staging version)',
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonText: 'Ok',
        })
    }

    return (
        <div className="accountPicker-container">
            <Logo style={{}}/>

                <h3 className='accountPicker-header'>Pick an account:</h3>
                <div className='accounts-container'>
                    {accounts.map((account)=>{
                        return (
                            <Card className="account-info-card" >
                                <div className="account-info" >
                                    <div onClick={()=>{chooseAccount(account.id)}}>
                                        <h4>{account?.name}</h4>
                                        <span>{account?.payment_plan?.name || 'Free Plan'}</span>
                                    </div>
                                    <div className='buttons'>
                                        <Icon onClick={notReadyYet} name="Pencil"></Icon>
                                        <Icon onClick={notReadyYet} name="CloseCircle"></Icon>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
                <Button icon={'Plus'} style={{margin:'30px auto'}}>Add Account</Button>
                <p style={{minHeight:'5vh'}}></p>
        </div>
    );
};
export default AccountPicker