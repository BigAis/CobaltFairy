import { React, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './settings.scss'

import Card from '../../components/Card'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Switch from '../../components/Switch'
import VerificationBadge from '../../components/VerificationBadge'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import Dropdown from '../../components/Dropdown'

const Settings = () => {
    const { user, account, createNotification } = useAccount()
    const navigate = useNavigate()
    const location = useLocation()
    const isProfilePage = location.pathname === '/profile'
    const [activeTab, setActiveTab] = useState(isProfilePage ? 'profile' : 'personal')
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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
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
            case 'container':
                return (
                    <div className="settings-tab-content">
                        <h3 className="section-title">Default Container</h3>
                        
                        <div className="color-picker-section">
                            <div className="color-field">
                                <div className="color-display" style={{ backgroundColor: containerSettings.backgroundColor }}></div>
                                <input 
                                    type="text" 
                                    className="color-input" 
                                    value={containerSettings.backgroundColor} 
                                    onChange={(e) => setContainerSettings({...containerSettings, backgroundColor: e.target.value})}
                                />
                            </div>
                            <div className="opacity-field">
                                <input 
                                    type="text" 
                                    className="opacity-input" 
                                    value={containerSettings.opacity} 
                                    onChange={(e) => setContainerSettings({...containerSettings, opacity: e.target.value})}
                                />
                                <span className="percentage-sign">%</span>
                            </div>
                        </div>
                        
                        <div className="container-settings">
                            <div className="dropdown-section">
                                <InputText
                                    label="Container width"
                                    value={containerSettings.width}
                                    onChange={(e) => {}} // This would be a dropdown in the real UI
                                />
                                <div className="dropdown-arrow">▼</div>
                            </div>
                            
                            <div className="dropdown-section">
                                <InputText
                                    label="Container padding"
                                    value={containerSettings.padding}
                                    onChange={(e) => {}} // This would be a dropdown in the real UI
                                />
                                <div className="dropdown-arrow">▼</div>
                            </div>
                            
                            <div className="dropdown-section">
                                <InputText
                                    label="Container margin"
                                    value={containerSettings.margin}
                                    onChange={(e) => {}} // This would be a dropdown in the real UI
                                />
                                <div className="dropdown-arrow">▼</div>
                            </div>
                        </div>
                        
                        <h3 className="section-title">Default Container</h3>
                        
                        <div className="dropdown-section">
                            <InputText
                                label="Font"
                                value={containerSettings.font}
                                onChange={(e) => {}} // This would be a dropdown in the real UI
                            />
                            <div className="dropdown-arrow">▼</div>
                        </div>
                        
                        <div className="font-button-group">
                            <Button type="secondary">Load Google Fonts</Button>
                        </div>
                        
                        <div className="heading-button-group">
                            <Button type="secondary">H₁ Heading 1</Button>
                            <Button type="secondary">H₂ Heading 2</Button>
                            <Button type="secondary">H₃ Heading 3</Button>
                            <Button type="secondary">B Subtitle</Button>
                            <Button type="secondary">Text</Button>
                            <Button type="secondary">Link</Button>
                            <Button type="secondary">— Divider</Button>
                        </div>
                        
                        <h3 className="section-title">Default Logo</h3>
                        
                        <div className="logo-upload-section">
                            <Button type="secondary">Upload</Button>
                        </div>
                        
                        <h3 className="section-title">Social Links</h3>
                        
                        {containerSettings.socialLinks.map((link, index) => (
                            <div className="input-section" key={index}>
                                <InputText
                                    label={`Link ${index + 1}`}
                                    value={link}
                                    onChange={(e) => handleLinkChange(index, e.target.value)}
                                />
                            </div>
                        ))}
                        
                        <div className="add-link-button">
                            <Button type="secondary" onClick={handleAddLink}>Add Link</Button>
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

    // Handle navigation between settings and profile
    const handleProfileNavigate = () => {
        if (isProfilePage) {
            navigate('/settings')
        } else {
            navigate('/profile')
        }
    }

    return (
        <>
            <div className="fm-page-wrapper">
                <Sidemenu />
                <div className="fm-page-container">
                    <PageHeader />
                    
                    {activeTab !== 'profile' && (
                        <div className="page-name-container">
                            <div className="page-name">Settings</div>
                            <Button 
                                type="secondary" 
                                onClick={handleProfileNavigate}
                            >
                                My Profile
                            </Button>
                        </div>
                    )}
                    
                    {activeTab === 'profile' && (
                        <div className="page-name-container">
                            <Button 
                                type="secondary" 
                                icon="Caret"
                                onClick={handleProfileNavigate}
                            >
                                Back to Settings
                            </Button>
                        </div>
                    )}
                    
                    {activeTab !== 'profile' && (
                        <div className="settings-tabs">
                            <button 
                                className={`settings-tab ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                Personal Details
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'domain' ? 'active' : ''}`}
                                onClick={() => setActiveTab('domain')}
                            >
                                Domain & Identity
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'presets' ? 'active' : ''}`}
                                onClick={() => setActiveTab('presets')}
                            >
                                Campaign Presets
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Notifications
                            </button>
                        </div>
                    )}
                    
                    {activeTab === 'profile' ? (
                        <div className="profile-content">
                            {renderTabContent()}
                        </div>
                    ) : (
                        <Card className="settings-content-card">
                            {renderTabContent()}
                        </Card>
                    )}
                </div>
            </div>
        </>
    )
}

export default Settings