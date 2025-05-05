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
        isVerifyingEmail: false
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
        
        setDomainSettings({...domainSettings, isAddingDomain: true})
        
        try {
            const response = await ApiService.post(
                'fairymailer/aws/add-domain',
                { domain_name: domainSettings.sendingDomain },
                user.jwt
            )
            
            if (response.data && response.data.success) {
                // Set domain status to pending initially
                const updatedSettings = {
                    ...domainSettings,
                    domainStatus: 'PENDING',
                    domainTxtName: response.data.txtRecord?.name || `_amazon.${domainSettings.sendingDomain}`,
                    domainTxtValue: response.data.txtRecord?.value || 'S01zjkZ3LpQjfd2Nr8TnyAmsNkpI4DGcBX2jc3UhsgY=',
                }
                
                setDomainSettings(updatedSettings)
                
                // Fetch DKIM records after adding domain
                getDkimRecords()
                
                createNotification({
                    message: 'Domain added successfully. Please verify the DNS records.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                createNotification({
                    message: 'Failed to add domain. Please try again.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error adding domain:', error)
            createNotification({
                message: 'Error adding domain: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        } finally {
            setDomainSettings({...domainSettings, isAddingDomain: false})
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
        
        setDomainSettings({...domainSettings, isAddingEmail: true})
        
        try {
            const response = await ApiService.post(
                'fairymailer/aws/add-email',
                { email: domainSettings.sendingEmail },
                user.jwt
            )
            
            if (response.data && response.data.success) {
                setDomainSettings({
                    ...domainSettings,
                    emailStatus: 'PENDING'
                })
                
                createNotification({
                    message: 'Email added successfully. Verification pending.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                createNotification({
                    message: 'Failed to add email. Please try again.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error adding email:', error)
            createNotification({
                message: 'Error adding email: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        } finally {
            setDomainSettings({...domainSettings, isAddingEmail: false})
        }
    }
    
    // Function to detach a domain
    const handleDetachDomain = async () => {
        if (!domainSettings.sendingDomain) {
            return
        }
        
        if (!confirm('Are you sure you want to detach this domain? This will invalidate all domain keys.')) {
            return
        }
        
        try {
            const response = await ApiService.post(
                'fairymailer/aws/remove-domain',
                { domain_name: domainSettings.sendingDomain },
                user.jwt
            )
            
            if (response.data && response.data.success) {
                setDomainSettings({
                    ...domainSettings,
                    domainStatus: null,
                    dkimStatus: null,
                    emailStatus: null,
                    domainTxtName: '',
                    domainTxtValue: '',
                    dkimRecords: []
                })
                
                createNotification({
                    message: 'Domain detached successfully',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                createNotification({
                    message: 'Failed to detach domain. Please try again.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error detaching domain:', error)
            createNotification({
                message: 'Error detaching domain: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        }
    }
    
    // Function to verify domain DKIM
    const handleVerifyDomainDkim = async () => {
        setDomainSettings({...domainSettings, isVerifyingDkim: true})
        
        try {
            const response = await ApiService.get(
                'fairymailer/aws/verify-domain-dkim',
                user.jwt
            )
            
            if (response.data && response.data.success) {
                setDomainSettings({
                    ...domainSettings,
                    dkimStatus: response.data.verified ? 'VERIFIED' : 'PENDING'
                })
                
                createNotification({
                    message: response.data.verified 
                        ? 'DKIM verified successfully!' 
                        : 'DKIM verification pending. Please ensure DNS records are properly configured.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                createNotification({
                    message: 'Failed to verify DKIM. Please try again later.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error verifying DKIM:', error)
            createNotification({
                message: 'Error verifying DKIM: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        } finally {
            setDomainSettings({...domainSettings, isVerifyingDkim: false})
        }
    }
    
    // Function to verify email
    const handleVerifyEmail = async () => {
        setDomainSettings({...domainSettings, isVerifyingEmail: true})
        
        try {
            const response = await ApiService.get(
                'fairymailer/aws/verify-email-status',
                user.jwt
            )
            
            if (response.data) {
                setDomainSettings({
                    ...domainSettings,
                    emailStatus: response.data.verified ? 'VERIFIED' : 'PENDING'
                })
                
                createNotification({
                    message: response.data.verified 
                        ? 'Email verified successfully!' 
                        : 'Email verification pending. Please check your inbox for verification email.',
                    type: 'default',
                    autoClose: 3000
                })
            } else {
                createNotification({
                    message: 'Failed to verify email status. Please try again later.',
                    type: 'warning',
                    autoClose: 3000
                })
            }
        } catch (error) {
            console.error('Error checking email verification:', error)
            createNotification({
                message: 'Error checking email verification: ' + (error.response?.data?.message || error.message),
                type: 'warning',
                autoClose: 3000
            })
        } finally {
            setDomainSettings({...domainSettings, isVerifyingEmail: false})
        }
    }
    
    // Function to check domain and DKIM status
    const checkDomainStatus = async () => {
        try {
            const response = await ApiService.get(
                'fairymailer/aws/get-domain-status',
                user.jwt
            )
            
            if (response.data && response.data.domain) {
                const domainName = response.data.domain
                
                setDomainSettings(prev => ({
                    ...prev,
                    sendingDomain: domainName,
                    domainStatus: response.data.verified ? 'VERIFIED' : 'PENDING',
                    domainTxtName: response.data.txtRecord?.name || `_amazon.${domainName}`,
                    domainTxtValue: response.data.txtRecord?.value || 'S01zjkZ3LpQjfd2Nr8TnyAmsNkpI4DGcBX2jc3UhsgY='
                }))
                
                // If domain exists, check DKIM status
                getDkimRecords()
                
                // Also check email status
                checkEmailStatus()
            }
        } catch (error) {
            console.error('Error checking domain status:', error)
        }
    }
    
    // Function to get DKIM records
    const getDkimRecords = async () => {
        try {
            const response = await ApiService.get(
                'fairymailer/aws/get-domain-dkim',
                user.jwt
            )
            
            if (response.data && response.data.dkimRecords) {
                const records = response.data.dkimRecords.map(record => ({
                    name: record.name,
                    value: record.value
                }))
                
                setDomainSettings(prev => ({
                    ...prev,
                    dkimRecords: records,
                    dkimStatus: response.data.verified ? 'VERIFIED' : 'PENDING'
                }))
            }
        } catch (error) {
            console.error('Error getting DKIM records:', error)
        }
    }
    
    // Function to check email verification status
    const checkEmailStatus = async () => {
        try {
            const response = await ApiService.get(
                'fairymailer/aws/verify-email-status',
                user.jwt
            )
            
            if (response.data && response.data.email) {
                setDomainSettings(prev => ({
                    ...prev,
                    sendingEmail: response.data.email,
                    emailStatus: response.data.verified ? 'VERIFIED' : 'PENDING'
                }))
            }
        } catch (error) {
            console.error('Error checking email status:', error)
        }
    }
    
    // Initial loading of domain & email settings
    useEffect(() => {
        if (user && user.jwt) {
            checkDomainStatus()
        }
    }, [user])

    return (
        <div className="domain-identity-container">
            <Card className="domain-section">
                <h3 className="section-title">Sending domain & identity</h3>
                
                <div className="input-section">
                    <InputText
                        placeholder="Sending domain"
                        value={domainSettings.sendingDomain}
                        onChange={(e) => setDomainSettings({...domainSettings, sendingDomain: e.target.value})}
                    />
                </div>
                
                {domainSettings.domainStatus === 'VERIFIED' && (
                    <div className="verification-badge-container">
                        <VerificationBadge isVerified={true} />
                    </div>
                )}
                
                {domainSettings.domainStatus === 'PENDING' && (
                    <div className="verification-badge-container">
                        <VerificationBadge isVerified={false} />
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
                    </div>
                )}
                
                {domainSettings.domainStatus && (
                    <div className="action-button">
                        <Button type="secondary" onClick={handleDetachDomain}>Detach</Button>
                    </div>
                )}
                
                <div className="info-text">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.</p>
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
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.</p>
                        </div>
                        
                        <div className="verification-badge-container">
                            <VerificationBadge isVerified={domainSettings.dkimStatus === 'VERIFIED'} />
                        </div>
                        
                        {domainSettings.dkimStatus !== 'VERIFIED' && domainSettings.dkimRecords && domainSettings.dkimRecords.length > 0 && (
                            <div className="dkim-records-container">
                                <div className="record-instructions">
                                    You will need to add these CNAME records to make sure your mail is not marked as spam.
                                </div>
                                
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
                                
                                <div className="verification-buttons mt-20">
                                    <Button 
                                        type="secondary" 
                                        onClick={handleVerifyDomainDkim} 
                                        loading={domainSettings.isVerifyingDkim}
                                    >
                                        Verify DKIM
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    <Card className="email-section">
                        <h3 className="section-title">Sending email</h3>
                        
                        <div className="input-section">
                            <InputText
                                placeholder="Enter email"
                                value={domainSettings.sendingEmail}
                                onChange={(e) => setDomainSettings({...domainSettings, sendingEmail: e.target.value})}
                            />
                        </div>
                        
                        <div className="verification-badge-container">
                            <VerificationBadge isVerified={domainSettings.emailStatus === 'VERIFIED'} />
                        </div>
                        
                        {domainSettings.emailStatus !== 'VERIFIED' && (
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
                        )}
                        
                        <div className="action-buttons mt-20">
                            <Button type="primary">Save Changes</Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}

export default DomainIdentity