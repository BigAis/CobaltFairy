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
import InputText from '../../components/InputText/InputText'

const AccountPicker = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([{name:'test'}]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAccount, setNewAccount] = useState({
        account_name: '',
        account_website: '',
        account_email: ''
    });
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isRemovingAccount, setIsRemovingAccount] = useState(false);

    const chooseAccount = async (aid) => {
        const jwt = User.get().jwt;
        let accountchosen = await ApiService.post('fairymailer/chooseUserAccount',{account_id:aid},jwt)
        console.log('respaccount',accountchosen.data)
        window.location='/' // no navigate
    }

    useEffect(()=>{
        setAccounts(User.getAccounts())
    },[])
    
    const handleDeleteAccount = async (account) => {
        const result = await PopupText.fire({
            icon: 'warning',
            title: 'Confirm Delete',
            text: `Are you sure you want to remove "${account.name}" account?`,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        })

        if (result.isConfirmed) {
            try {
                setIsRemovingAccount(true);
                const jwt = User.get().jwt;
                await ApiService.post('fairymailer/removeAccount', { account_id: account.id }, jwt);
                
                // Refresh accounts list
                const updatedAccounts = accounts.filter(acc => acc.id !== account.id);
                setAccounts(updatedAccounts);
                User.setAccounts(updatedAccounts);
                
                PopupText.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Account has been removed',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                console.error('Error removing account:', error);
                PopupText.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to remove account',
                    showConfirmButton: true
                });
            } finally {
                setIsRemovingAccount(false);
            }
        }
    }

    const handleAddAccount = async () => {
        // Validate form
        if (!newAccount.account_name.trim()) {
            PopupText.fire({
                icon: 'warning',
                text: 'Please enter an account name',
                showConfirmButton: true
            });
            return;
        }

        try {
            setIsAddingAccount(true);
            const jwt = User.get().jwt;
            const response = await ApiService.post('fairymail/createAccount', newAccount, jwt);
            
            if (response.data && response.data.success) {
                // Reset form
                setNewAccount({
                    account_name: '',
                    account_website: '',
                    account_email: ''
                });
                
                // Close modal
                setShowAddModal(false);
                
                // Refresh accounts list
                const updatedAccounts = [...accounts, response.data.account];
                setAccounts(updatedAccounts);
                User.setAccounts(updatedAccounts);
                
                PopupText.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Account has been created',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error creating account:', error);
            PopupText.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create account',
                showConfirmButton: true
            });
        } finally {
            setIsAddingAccount(false);
        }
    }

    const handleEditAccount = async (account) => {
        try {
            // First change to the account that we want to edit
            const jwt = User.get().jwt;
            await ApiService.post('fairymailer/chooseUserAccount', {
                account_id: account.id
            }, jwt);
            
            // Use window.location instead of navigate to force a full page reload
            window.location.href = '/settings/details';
        } catch (error) {
            console.error('Error switching to account for editing:', error);
            PopupText.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to switch to account for editing',
                showConfirmButton: true
            });
        }
    }

    return (
        <div className="accountPicker-container">
            <Logo style={{}}/>

            <h3 className='accountPicker-header'>Pick an account:</h3>
            <div className='accounts-container'>
                {accounts.map((account, index) => {
                    return (
                        <Card className="account-info-card" key={account.id || index}>
                            <div className="account-info">
                                <div onClick={() => {chooseAccount(account.id)}}>
                                    <h4>{account?.name}</h4>
                                    <span>{account?.payment_plan?.name || 'Free Plan'}</span>
                                </div>
                                <div className='buttons'>
                                    <Icon onClick={() => handleEditAccount(account)} name="Pencil"></Icon>
                                    <Icon onClick={() => handleDeleteAccount(account)} name="CloseCircle"></Icon>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <Button icon={'Plus'} style={{margin:'30px auto'}} onClick={() => setShowAddModal(true)}>Add Account</Button>
            <p style={{minHeight:'5vh'}}></p>

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="add-account-modal">
                        <div className="modal-header">
                            <h2>Add Account</h2>
                            <button className="close-button" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="input-field">
                                <InputText
                                    placeholder="Account Name"
                                    value={newAccount.account_name}
                                    onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                                />
                            </div>
                            
                            <div className="input-field">
                                <InputText
                                    placeholder="Account Website"
                                    value={newAccount.account_website}
                                    onChange={(e) => setNewAccount({...newAccount, account_website: e.target.value})}
                                />
                            </div>
                            
                            <div className="input-field">
                                <InputText
                                    placeholder="Account Email"
                                    value={newAccount.account_email}
                                    onChange={(e) => setNewAccount({...newAccount, account_email: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <Button 
                                type="secondary" 
                                onClick={() => setShowAddModal(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={handleAddAccount} 
                                loading={isAddingAccount}
                                className="create-button"
                            >
                                Create Account
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPicker