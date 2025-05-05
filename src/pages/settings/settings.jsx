import { React, useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './settings.scss'

import Card from '../../components/Card'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import InputText from '../../components/InputText/InputText'
import Switch from '../../components/Switch'
import VerificationBadge from '../../components/VerificationBadge'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'

const Settings = () => {
    const { user, account, createNotification } = useAccount()
    const navigate = useNavigate()
    const location = useLocation()
    const { section } = useParams()
    
    // Define available sections
    const sections = {
        details: 'details',
        domain: 'domain',
        presets: 'presets',
        notifications: 'notifications',
        profile: 'profile'
    }
    
    // Determine the active section based on URL route
    const [activeSection, setActiveSection] = useState(
        section && sections[section] ? sections[section] : 'details'
    )
    
    const [isLoading, setIsLoading] = useState(false)
    
    // Personal Details state
    const [personalSettings, setPersonalSettings] = useState({
        accountName: '',
        email: '',
        timezone: 'Timezone',
        timeformat: 'Timeformat'
    })
    
    // Domain & Identity state
    const [domainSettings, setDomainSettings] = useState({
        sendingDomain: '',
        sendingEmail: ''
    })
    
    // Container settings state
    const [containerSettings, setContainerSettings] = useState({
        backgroundColor: '#FFA600',
        opacity: '100',
        width: 'Container width',
        padding: 'Container padding',
        margin: 'Container margin',
        font: 'Inter',
        socialLinks: ['']
    })
    
    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState({
        monthlyActivity: true,
        monthlyActivityEmail: '',
        campaignNotifications: false,
        campaignNotificationsEmail: ''
    })
    
    // Profile state
    const [profileSettings, setProfileSettings] = useState({
        email: '',
        password: '••••••••',
        firstName: '',
        lastName: ''
    })

    useEffect(() => {
        // Update active section when route changes
        if (section && sections[section]) {
            setActiveSection(sections[section])
        }
    }, [section])

    useEffect(() => {
        // Load initial settings
        if (user && account) {
            loadSettings()
        }
    }, [user, account])

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            // In a real implementation, we would fetch these settings from an API
            // For now, we'll just populate with sample data
            setPersonalSettings({
                accountName: account?.name || 'Account Name',
                email: user?.user?.email || 'johndoe@gmail.com',
                timezone: 'Timezone',
                timeformat: 'Timeformat'
            })
            
            setDomainSettings({
                sendingDomain: account?.domain || 'cobaltfairy.online',
                sendingEmail: user?.user?.email || 'johndoe@gmail.com'
            })
            
            setProfileSettings({
                email: user?.user?.email || 'johndoe@gmail.com',
                password: '••••••••',
                firstName: user?.user?.firstName || 'John',
                lastName: user?.user?.lastName || 'Doe'
            })
            
            setIsLoading(false)
        } catch (error) {
            console.error("Error loading settings:", error)
            createNotification({
                message: 'Failed to load settings. Please try again.',
                type: 'warning'
            })
            setIsLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        setIsLoading(true)
        try {
            // In a real implementation, we would save these settings via an API
            // For now, we'll just show a success notification
            setTimeout(() => {
                createNotification({
                    message: 'Settings saved successfully',
                    type: 'default',
                    autoClose: 3000
                })
                setIsLoading(false)
            }, 1000)
        } catch (error) {
            console.error("Error saving settings:", error)
            createNotification({
                message: 'Failed to save settings. Please try again.',
                type: 'warning'
            })
            setIsLoading(false)
        }
    }

    const handleDetach = () => {
        createNotification({
            message: 'Domain detached successfully',
            type: 'default',
            autoClose: 3000
        })
    }

    const handleAddLink = () => {
        setContainerSettings({
            ...containerSettings,
            socialLinks: [...containerSettings.socialLinks, '']
        })
    }

    const handleLinkChange = (index, value) => {
        const updatedLinks = [...containerSettings.socialLinks]
        updatedLinks[index] = value
        setContainerSettings({
            ...containerSettings,
            socialLinks: updatedLinks
        })
    }

    // Handle section changes via ButtonGroup
    const handleSectionChange = (value) => {
        navigate(`/settings/${value}`)
        setActiveSection(value)
    }

    const renderTabContent = () => {
        switch (activeSection) {
            case 'details':
                return (
                    <div className="settings-tab-content">
                        <div className="input-section">
                            <InputText
                                label="Account Name"
                                value={personalSettings.accountName}
                                onChange={(e) => setPersonalSettings({...personalSettings, accountName: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-section">
                            <InputText
                                label="Email"
                                value={personalSettings.email}
                                onChange={(e) => setPersonalSettings({...personalSettings, email: e.target.value})}
                            />
                        </div>
                        
                        <div className="dropdown-section">
                            <div className="dropdown-row">
                                <div className="dropdown-item">
                                    <InputText
                                        label="Timezone"
                                        value={personalSettings.timezone}
                                        onChange={(e) => {}} // This would be a dropdown in the real UI
                                    />
                                    <div className="dropdown-arrow">▼</div>
                                </div>
                                
                                <div className="dropdown-item">
                                    <InputText
                                        label="Timeformat"
                                        value={personalSettings.timeformat}
                                        onChange={(e) => {}} // This would be a dropdown in the real UI
                                    />
                                    <div className="dropdown-arrow">▼</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
                        </div>
                    </div>
                )
            case 'domain':
                return (
                    <div className="settings-tab-content">
                        <h3 className="section-title">Sending domain & identity</h3>
                        
                        <div className="input-section">
                            <InputText
                                label="Sending domain"
                                value={domainSettings.sendingDomain}
                                onChange={(e) => setDomainSettings({...domainSettings, sendingDomain: e.target.value})}
                            />
                        </div>
                        
                        <div className="verification-badge-container standalone">
                            <VerificationBadge isVerified={true} />
                        </div>
                        
                        <div className="action-button">
                            <Button type="secondary" onClick={handleDetach}>Detatch</Button>
                        </div>
                        
                        <div className="info-text">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.</p>
                        </div>
                        
                        <h3 className="section-title">DKIM Verification for domain {domainSettings.sendingDomain}</h3>
                        
                        <div className="info-text">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis suscipit justo. Nunc id lacus sem. Nam sit amet arcu eu nibh rhoncus iaculis eget id arcu.</p>
                        </div>
                        
                        <div className="verification-badge-container standalone">
                            <VerificationBadge isVerified={true} />
                        </div>
                        
                        <h3 className="section-title">Sending email</h3>
                        
                        <div className="input-section">
                            <InputText
                                label="Enter email"
                                value={domainSettings.sendingEmail}
                                onChange={(e) => setDomainSettings({...domainSettings, sendingEmail: e.target.value})}
                            />
                        </div>
                        
                        <div className="verification-badge-container standalone">
                            <VerificationBadge isVerified={false} />
                        </div>
                        
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
                        </div>
                    </div>
                )
            case 'presets':
                return (
                    <div className="settings-tab-content">
                        <h3 className="section-title">Campaign Presets</h3>
                        <p>Campaign presets content will go here</p>
                        
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
                        </div>
                    </div>
                )
            case 'notifications':
                return (
                    <div className="settings-tab-content">
                        <div className="notification-setting">
                            <Switch 
                                checked={notificationSettings.monthlyActivity} 
                                label="Monthly account activity" 
                                onChange={(checked) => setNotificationSettings({...notificationSettings, monthlyActivity: checked})}
                            />
                        </div>
                        
                        <div className="notification-email">
                            <InputText
                                label="Email"
                                value={notificationSettings.monthlyActivityEmail}
                                onChange={(e) => setNotificationSettings({...notificationSettings, monthlyActivityEmail: e.target.value})}
                            />
                        </div>
                        
                        <div className="notification-setting">
                            <Switch 
                                checked={notificationSettings.campaignNotifications} 
                                label="Campaign Notifications" 
                                onChange={(checked) => setNotificationSettings({...notificationSettings, campaignNotifications: checked})}
                            />
                        </div>
                        
                        <div className="notification-email">
                            <InputText
                                label="Email"
                                value={notificationSettings.campaignNotificationsEmail}
                                onChange={(e) => setNotificationSettings({...notificationSettings, campaignNotificationsEmail: e.target.value})}
                            />
                        </div>
                    </div>
                )
            case 'profile':
                return (
                    <div className="settings-tab-content profile-tab">
                        <h2 className="profile-title">Profile</h2>
                        
                        <h3 className="section-title">Profile Photo</h3>
                        
                        <div className="profile-photo-section">
                            <div className="profile-initials">
                                {profileSettings.firstName && profileSettings.lastName ? 
                                    `${profileSettings.firstName[0]}${profileSettings.lastName[0]}` : 'JD'}
                            </div>
                            <Button type="secondary">Upload</Button>
                        </div>
                        
                        <h3 className="section-title">Login Details</h3>
                        
                        <div className="input-section">
                            <InputText
                                label="Email"
                                value={profileSettings.email}
                                onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                            />
                        </div>
                        
                        <div className="password-section">
                            <div className="password-field">
                                <InputText
                                    label="Password"
                                    value={profileSettings.password}
                                    type="password"
                                    onChange={(e) => setProfileSettings({...profileSettings, password: e.target.value})}
                                />
                                <div className="password-icon">
                                    <Icon name="Eye" size={16} />
                                </div>
                            </div>
                            
                            <div className="update-password-button">
                                <Button type="secondary">Update Password</Button>
                            </div>
                        </div>
                        
                        <h3 className="section-title">Basic Information</h3>
                        
                        <div className="input-section">
                            <InputText
                                label="First Name"
                                value={profileSettings.firstName}
                                onChange={(e) => setProfileSettings({...profileSettings, firstName: e.target.value})}
                            />
                        </div>
                        
                        <div className="input-section">
                            <InputText
                                label="Last Name"
                                value={profileSettings.lastName}
                                onChange={(e) => setProfileSettings({...profileSettings, lastName: e.target.value})}
                            />
                        </div>
                        
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
                        </div>
                    </div>
                )
            default:
                return <div>Select a tab</div>
        }
    }

    return (
        <>
            <div className="fm-page-wrapper">
                <Sidemenu />
                <div className="fm-page-container">
                    <PageHeader />
                    
                    <div className="page-name-container">
                        <div className="page-name">Settings</div>
                    </div>
                    
                    <div className="settings-tabs">
                        <ButtonGroup
                            value={activeSection}
                            options={[
                                { value: 'details', label: 'Personal Details' },
                                { value: 'domain', label: 'Domain & Identity' },
                                { value: 'presets', label: 'Campaign Presets' },
                                { value: 'notifications', label: 'Notifications' },
                                { value: 'profile', label: 'Profile' }
                            ]}
                            onChange={handleSectionChange}
                        />
                    </div>
                    
                    <Card className="settings-content-card">
                        {renderTabContent()}
                    </Card>
                </div>
            </div>
        </>
    )
}

export default Settings