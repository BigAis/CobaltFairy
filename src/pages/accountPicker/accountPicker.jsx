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
    console.log('accounts',accounts)
    return (
        <div className="accountPicker-container">
            <Logo style={{}}/>

                <h3 className='accountPicker-header'>Pick an account:</h3>
                <div className='accounts-container'>
                    {accounts.map((account)=>{
                        return (
                            <Card className="account-info-card" onClick={()=>{chooseAccount(account.id)}}>
                                <div className="account-info" >
                                    <div>
                                        <h4>{account?.name}</h4>
                                        <span>{account?.payment_plan?.name || 'Free Plan'}</span>
                                    </div>
                                    <Icon name="Close"></Icon>
                                </div>
                            </Card>
                        )
                    })}
                </div>
        </div>
    );
};
export default AccountPicker