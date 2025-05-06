import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import VerificationBadge from '../../components/VerificationBadge'
import { ApiService } from '../../service/api-service'
import { useAccount } from '../../context/AccountContext'
import './DomainIdentity.scss'

const DomainIdentity = () => {
    const { user, createNotification } = useAccount()
    
    // Domain & Identity state
    const [domainSettings, setDomainSettings] = useState({
        sendingDomain: '',
        sendingEmail: '',
        domainStatus: null,
        dkimStatus: null,
        emailStatus: null,
        domainTxtName: '',
        domainTxtValue: '',
        dkimRecords: [],
        isAddingDomain: false,
        isAddingEmail: false,
        isVerifyingDkim: false,
        isVerifyingEmail: false,
        isDetachingDomain: false
    })

    // Function to add a domain
    const handleAddDomain = async () => {
        if (!domainSettings.sendingDomain) {
            createNotification({
                message: 'Please enter a domain name',
                type: 'warning',
                autoClose: 3000
            })
            return
        }
        
        // Prevent duplicate requests while loading
        if (domainSettings.isAddingDomain) {
            return;
        }
        
        setDomainSettings(prevState => ({...prevState, isAddingDomain: true}))
        
        try {
            const response = await ApiService.post(
                'aws/add-domain',
                { domain_name: domainSettings.sendingDomain },
                user.jwt
            )
            
            console.log('Domain add response:', response.data)
            
            // Check for response code 200
            if (response.data && response.data.code === 200) {
                // Extract the verification token from the correct location in the response
                const verificationToken = response.data.data?.VerificationToken || '';
                
                setDomainSettings(prevState => ({
                    ...prevState,
                    domainStatus: 'PENDING',
                    // Use the domain name from state to build the TXT record name
                    domainTxtName: `_amazon.${prevState.sendingDomain}`,
                    // Use the verification token from the response
                    domainTxtValue: verificationToken,
                    isAddingDomain: false
                }))
                
                // Fetch DKIM records immediately after adding domain
                setTimeout(() => {
                    getDkimRecords()
                }, 500)
                
                createNotification({
                    message: 'Domain added successfully. Please verify the DNS records.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                setDomainSettings(prevState => ({...prevState, isAddingDomain: false}))
                createNotification({
                    message: 'Failed to add domain. Please try again.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error adding domain:', error)
            setDomainSettings(prevState => ({...prevState, isAddingDomain: false}))
            createNotification({
                message: 'Error adding domain: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        }
    }
    
    // Function to add an email
    const handleAddEmail = async () => {
        if (!domainSettings.sendingEmail) {
            createNotification({
                message: 'Please enter an email address',
                type: 'warning',
                autoClose: 3000
            })
            return
        }
        
        // Check if email domain matches sending domain
        const emailParts = domainSettings.sendingEmail.split('@');
        if (emailParts.length !== 2 || emailParts[1].toLowerCase() !== domainSettings.sendingDomain.toLowerCase()) {
            createNotification({
                message: `Email must use the verified domain: @${domainSettings.sendingDomain}`,
                type: 'warning',
                autoClose: 3000
            })
            return
        }
        
        // Prevent duplicate requests
        if (domainSettings.isAddingEmail) {
            return;
        }
        
        setDomainSettings(prevState => ({...prevState, isAddingEmail: true}))
        
        try {
            const response = await ApiService.post(
                'aws/add-email',
                { email: domainSettings.sendingEmail },
                user.jwt
            )
            
            console.log('Email add response:', response.data)
            
            if (response.data && response.data.code === 200) {
                setDomainSettings(prevState => ({
                    ...prevState,
                    emailStatus: 'PENDING',
                    isAddingEmail: false
                }))
                
                createNotification({
                    message: 'Email added successfully. Verification pending.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                setDomainSettings(prevState => ({...prevState, isAddingEmail: false}))
                createNotification({
                    message: 'Failed to add email. Please try again.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error adding email:', error)
            setDomainSettings(prevState => ({...prevState, isAddingEmail: false}))
            createNotification({
                message: 'Error adding email: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        }
    }
    
    // Function to verify domain DKIM
    const handleVerifyDomainDkim = async () => {
        // Prevent duplicate requests
        if (domainSettings.isVerifyingDkim) {
            return;
        }
        
        setDomainSettings(prevState => ({...prevState, isVerifyingDkim: true}))
        
        try {
            const response = await ApiService.get(
                'aws/verify-domain-dkim',
                user.jwt
            )
            
            console.log('DKIM verify response:', response.data)
            
            if (response.data && (response.data.success || response.data.code === 200)) {
                const isVerified = response.data.verified || 
                                  (response.data.data && response.data.data.verified) || 
                                  false;
                                  
                setDomainSettings(prevState => ({
                    ...prevState,
                    dkimStatus: isVerified ? 'VERIFIED' : 'PENDING',
                    isVerifyingDkim: false
                }))
                
                createNotification({
                    message: isVerified 
                        ? 'DKIM verified successfully!' 
                        : 'DKIM verification pending. Please ensure DNS records are properly configured.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                setDomainSettings(prevState => ({...prevState, isVerifyingDkim: false}))
                createNotification({
                    message: 'Failed to verify DKIM. Please try again later.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error verifying DKIM:', error)
            setDomainSettings(prevState => ({...prevState, isVerifyingDkim: false}))
            createNotification({
                message: 'Error verifying DKIM: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        }
    }
    
    // Function to verify email
    const handleVerifyEmail = async () => {
        // Prevent duplicate requests
        if (domainSettings.isVerifyingEmail) {
            return;
        }
        
        setDomainSettings(prevState => ({...prevState, isVerifyingEmail: true}))
        
        try {
            const response = await ApiService.get(
                'aws/verify-email-status',
                user.jwt
            )
            
            console.log('Email verify response:', response.data)
            
            if (response.data) {
                const isVerified = response.data.verified || 
                                  (response.data.data && response.data.data.verified) || 
                                  false;
                                  
                setDomainSettings(prevState => ({
                    ...prevState,
                    emailStatus: isVerified ? 'VERIFIED' : 'PENDING',
                    isVerifyingEmail: false
                }))
                
                createNotification({
                    message: isVerified 
                        ? 'Email verified successfully!' 
                        : 'Email verification pending. Please check your inbox for verification email.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                setDomainSettings(prevState => ({...prevState, isVerifyingEmail: false}))
                createNotification({
                    message: 'Failed to verify email status. Please try again later.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error checking email verification:', error)
            setDomainSettings(prevState => ({...prevState, isVerifyingEmail: false}))
            createNotification({
                message: 'Error checking email verification: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        }
    }
    
    // Function to check domain and DKIM status
    const checkDomainStatus = async () => {
        try {
            const response = await ApiService.get(
                'aws/get-domain-status',
                user.jwt
            )
            
            console.log('Domain status response:', response.data)
            
            if (response.data && (response.data.success || response.data.code === 200)) {
                const domainData = response.data.data || {};
                let domainName = domainData && domainData.VerificationAttributes ? Object.keys(domainData.VerificationAttributes)[0] : '';

                const isVerified = domainData && 
                                        domainData.VerificationAttributes && 
                                        domainData.VerificationAttributes[domainName] &&
                                        domainData.VerificationAttributes[domainName].VerificationStatus == "Verified"
                                  
                const txtRecord = domainData?.VerificationAttributes[domainName]?.VerificationToken ?? 'err'; 
                
                setDomainSettings(prev => ({
                    ...prev,
                    sendingDomain: domainName,
                    domainStatus: isVerified ? 'VERIFIED' : 'PENDING',
                    domainTxtName: `_amazon.${domainName}`,
                    domainTxtValue: txtRecord || ''
                }))
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking domain status:', error)
            return false;
        }
    }
    
    // Function to get DKIM records
    const getDkimRecords = async () => {
        try {
            const response = await ApiService.get(
                'aws/get-domain-dkim',
                user.jwt
            );
            
            console.log('DKIM records response:', response.data);
            
            if (response.data && (response.data.success || response.data.code === 200)) {
                // Handle the response data directly from the API without creating placeholders
                const dkimData = response.data.data;
                
                // Extract the DKIM records from the response
                let records = [];
                
                if (Array.isArray(dkimData.DkimTokens)) {
                    // If API returns records in the expected format
                    records = dkimData.DkimTokens.map(token => ({
                        name: token.name || `${token}._domainkey.${domainSettings.sendingDomain}`,
                        value: token.value || `${token}.dkim.amazonses.com`
                    }));;
                }
                
                const isVerified = dkimData.verified || false;
                
                setDomainSettings(prev => ({
                    ...prev,
                    dkimRecords: records,
                    // dkimStatus: isVerified ? 'VERIFIED' : 'PENDING'
                }));
            }
        } catch (error) {
            console.error('Error getting DKIM records:', error);
            createNotification({
                message: 'Error retrieving DKIM records: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            });
        }
    }
    
    // Function to check email verification status
    const checkEmailStatus = async () => {
        try {
            const response = await ApiService.get(
                'aws/verify-email-status',
                user.jwt
            )
            
            console.log('Email status response:', response.data)
            
            if (response.data) {
                const emailData = response.data.data || response.data;
                const isVerified = emailData.verified || false;
                
                setDomainSettings(prev => ({
                    ...prev,
                    sendingEmail: emailData.email || prev.sendingEmail,
                    emailStatus: isVerified ? 'VERIFIED' : 'PENDING'
                }))
            }
        } catch (error) {
            console.error('Error checking email status:', error)
        }
    }
    
    // Initial loading of domain & email settings
    useEffect(() => {
        let isMounted = true;
        
        const fetchDomainData = async () => {
            if (user && user.jwt) {
                try {
                    const domainExists = await checkDomainStatus();
                    
                    // Only fetch additional data if domain exists and component is still mounted
                    if (isMounted && domainExists) {
                        // If domain exists, check DKIM status with a slight delay to avoid race conditions
                        setTimeout(() => {
                            if (isMounted) getDkimRecords();
                        }, 300);
                        
                        // Also check email status
                        setTimeout(() => {
                            if (isMounted) checkEmailStatus();
                        }, 600);
                    }
                } catch (error) {
                    console.error('Error during initial data fetch:', error);
                }
            }
        };
        
        fetchDomainData();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [user]);

    return (
        <div className="domain-identity-container">
            <Card className="domain-section">
                <h3 className="section-title">Sending domain & identity</h3>
                
                {/* Moved verification badge above input */}
                {domainSettings.domainStatus === 'VERIFIED' && (
                    <div className="verification-badge-container">
                        <VerificationBadge isVerified={true} />
                    </div>
                )}
                
                {domainSettings.domainStatus === 'PENDING' && (
                    <div className="verification-badge-container">
                        <VerificationBadge isVerified={false} />
                    </div>
                )}
                
                <div className="input-section">
                    <InputText
                        placeholder="Sending domain"
                        value={domainSettings.sendingDomain}
                        onChange={(e) => setDomainSettings({...domainSettings, sendingDomain: e.target.value})}
                        disabled={domainSettings.domainStatus !== null}
                    />
                </div>
                
                {domainSettings.domainStatus === 'PENDING' && (
                    <div className="info-text mt-10">
                        <p>Please make sure you have added the following (TXT) DNS record in order to verify your identity</p>
                        
                        <div className="record-group">
                            <div className="record-item">
                                <div className="record-label">NAME:</div>
                                <div className="record-value">{domainSettings.domainTxtName}</div>
                            </div>
                            <div className="record-item">
                                <div className="record-label">VALUE:</div>
                                <div className="record-value">{domainSettings.domainTxtValue}</div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="info-text">
                    <p>Add your domain to verify ownership and enable email sending. You'll need access to modify your domain's DNS records.</p>
                </div>
                
                {!domainSettings.domainStatus && (
                    <div className="action-buttons">
                        <Button 
                            type="primary" 
                            onClick={handleAddDomain} 
                            loading={domainSettings.isAddingDomain}
                        >
                            Add Domain
                        </Button>
                    </div>
                )}
            </Card>
            
            {domainSettings.domainStatus && (
                <>
                    <Card className="dkim-section">
                        <h3 className="section-title">DKIM Verification for domain {domainSettings.sendingDomain}</h3>
                        
                        <div className="info-text">
                            <p>You will need to add these CNAME records to make sure your mail is not marked as spam.</p>
                        </div>
                        
                        {domainSettings.dkimRecords && domainSettings.dkimRecords.length > 0 && (
                            <div className="dkim-records-container">
                                {domainSettings.dkimRecords.map((record, index) => (
                                    <div key={index} className="record-group">
                                        <div className="record-heading">Record #{index + 1}:</div>
                                        <div className="record-item">
                                            <div className="record-label">NAME:</div>
                                            <div className="record-value">{record.name}</div>
                                        </div>
                                        <div className="record-item">
                                            <div className="record-label">VALUE:</div>
                                            <div className="record-value">{record.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="dkim-status">
                            DKIM Verification status <span className={`status-${domainSettings.dkimStatus === 'VERIFIED' ? 'verified' : 'pending'}`}>
                                {domainSettings.dkimStatus === 'VERIFIED' ? 'Verified' : 'Pending verification'}
                            </span>
                        </div>
                        
                        <div className="verification-buttons mt-20">
                            <Button 
                                type="secondary" 
                                onClick={handleVerifyDomainDkim} 
                                loading={domainSettings.isVerifyingDkim}
                            >
                                Verify DKIM
                            </Button>
                        </div>
                    </Card>
                    
                    <Card className="email-section">
                        <h3 className="section-title">Sending email</h3>
                        
                        <div className="input-section">
                            <InputText
                                placeholder={`Enter email (must use @${domainSettings.sendingDomain})`}
                                value={domainSettings.sendingEmail}
                                onChange={(e) => setDomainSettings({...domainSettings, sendingEmail: e.target.value})}
                            />
                        </div>
                        
                        <div className="verification-badge-container">
                            <VerificationBadge isVerified={domainSettings.emailStatus === 'VERIFIED'} />
                        </div>
                        
                        <div className="verification-buttons mt-10">
                            <Button 
                                type="secondary" 
                                onClick={handleAddEmail} 
                                loading={domainSettings.isAddingEmail}
                            >
                                Save Email
                            </Button>
                            {domainSettings.emailStatus === 'PENDING' && (
                                <Button 
                                    type="secondary" 
                                    onClick={handleVerifyEmail} 
                                    loading={domainSettings.isVerifyingEmail}
                                    className="ml-10"
                                >
                                    Verify Email
                                </Button>
                            )}
                        </div>
                        
                        <div className="status-text">
                            Status: <span className={`status-${domainSettings.emailStatus === 'VERIFIED' ? 'verified' : 'pending'}`}>
                                {domainSettings.emailStatus === 'VERIFIED' ? 'Verified' : 'Pending verification'}
                            </span>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}

export default DomainIdentity