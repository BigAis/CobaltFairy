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
import { useAccount } from '../../context/AccountContext'
import NotificationBar from '../../components/NotificationBar/NotificationBar'

const AccountPicker = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAccount, setNewAccount] = useState({
        account_name: '',
        account_website: '',
        account_email: ''
    });
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isRemovingAccount, setIsRemovingAccount] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [localNotification, setLocalNotification] = useState(null);
    
    // Use the context, but provide a fallback if it's not available
    const accountContext = useAccount();
    const createNotification = accountContext?.createNotification || 
        ((msg) => {
            console.log("Fallback notification:", msg);
            setLocalNotification(msg);
            setTimeout(() => setLocalNotification(null), msg.autoClose || 3000);
        });

    // Function to fetch accounts from server
    const fetchAccountsFromServer = async () => {
        try {
            setIsLoadingAccounts(true);
            const jwt = User.get().jwt;
            const response = await ApiService.get('fairymailer/getAccount', jwt);
            
            if (response.data && response.data.user && response.data.user.accounts) {
                const serverAccounts = response.data.user.accounts;
                setAccounts(serverAccounts);
                User.setAccounts(serverAccounts);
                console.log('Accounts refreshed from server:', serverAccounts);
                return serverAccounts;
            } else {
                console.warn('Unexpected response structure from server');
                return null;
            }
        } catch (error) {
            console.error('Error fetching accounts from server:', error);
            createNotification({
                message: 'Failed to refresh accounts list',
                type: 'warning',
                autoClose: 3000
            });
            return null;
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const chooseAccount = async (aid) => {
        const jwt = User.get().jwt;
        let accountchosen = await ApiService.post('fairymailer/chooseUserAccount',{account_id:aid},jwt)
        console.log('respaccount',accountchosen.data)
        window.location='/' // no navigate
    }

    useEffect(() => {
        // Try to load from local storage first for immediate display
        const localAccounts = User.getAccounts();
        if (localAccounts && localAccounts.length > 0) {
            setAccounts(localAccounts);
        }
        
        // Then fetch fresh data from server
        fetchAccountsFromServer();
    }, [])
    
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
                
                // Refresh accounts from server after deletion
                await fetchAccountsFromServer();
                
                createNotification({
                    message: 'Account has been removed',
                    type: 'default',
                    autoClose: 3000
                });
            } catch (error) {
                console.error('Error removing account:', error);
                createNotification({
                    message: 'Failed to remove account',
                    type: 'warning',
                    autoClose: 3000
                });
            } finally {
                setIsRemovingAccount(false);
            }
        }
    }

    const handleAddAccount = async () => {
        // Validate form
        if (!newAccount.account_name.trim()) {
            createNotification({
                message: 'Please enter an account name',
                type: 'warning',
                autoClose: 3000
            });
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
            
            console.log('Account creation response:', response);
            
            // Check if account was created successfully
            if (response && response.status === 200) {
                // Reset form
                setNewAccount({
                    account_name: '',
                    account_website: '',
                    account_email: ''
                });
                
                // Close modal
                setShowAddModal(false);
                
                // Fetch fresh accounts from server to ensure we have the latest data
                console.log('Account created successfully, fetching updated accounts...');
                const updatedAccounts = await fetchAccountsFromServer();
                
                if (updatedAccounts) {
                    createNotification({
                        message: 'Account has been created successfully',
                        type: 'success',
                        autoClose: 4000
                    });
                } else {
                    // If server fetch failed, try to parse the response
                    const createdAccount = response.data.account || 
                                          (response.data.data && response.data.data.account) || 
                                          response.data;
                    
                    if (createdAccount && createdAccount.id) {
                        const updatedAccounts = [...accounts, createdAccount];
                        setAccounts(updatedAccounts);
                        User.setAccounts(updatedAccounts);
                        
                        createNotification({
                            message: 'Account has been created successfully',
                            type: 'success',
                            autoClose: 4000
                        });
                    } else {
                        createNotification({
                            message: 'Account created, but failed to refresh list. Please refresh the page.',
                            type: 'warning',
                            autoClose: 5000
                        });
                    }
                }
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            
            createNotification({
                message: 'Failed to create account: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 5000
            });
            
            PopupText.fire({
                icon: 'error',
                text: 'Failed to create account: ' + (error.response?.data?.message || error.message),
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
            createNotification({
                message: 'Failed to switch to account for editing',
                type: 'warning',
                autoClose: 3000
            });
        }
    }

    return (
        <div className="accountPicker-container">
            <Logo style={{}}/>
            
            {/* Local fallback notification in case context notifications aren't working */}
            {localNotification && (
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
                    <NotificationBar 
                        message={localNotification.message}
                        type={localNotification.type || 'default'}
                        onClose={() => setLocalNotification(null)}
                        autoClose={localNotification.autoClose || 3000}
                    />
                </div>
            )}

            <h3 className='accountPicker-header'>Pick an account:</h3>
            
            {/* Loading indicator */}
            {isLoadingAccounts && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <p>Loading accounts...</p>
                </div>
            )}
            
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