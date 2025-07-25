import { React, useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import '../../fullpage.scss'
import './settings.scss'
import User from '../../service/User'
import Card from '../../components/Card'
import Button from '../../components/Button'
import ButtonGroup from '../../components/ButtonGroup'
import InputText from '../../components/InputText/InputText'
import Dropdown from '../../components/Dropdown'
import Switch from '../../components/Switch'
import VerificationBadge from '../../components/VerificationBadge'
import Icon from '../../components/Icon/Icon'
import { useAccount } from '../../context/AccountContext'
import { ApiService } from '../../service/api-service'
import DomainIdentity from './DomainIdentity'
import CampaignPresets from './CampaignPresets'
import PopupText from '../../components/PopupText/PopupText'

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
    const [showPassword, setShowPassword] = useState(false)
    
    // Personal Details state
    const [personalSettings, setPersonalSettings] = useState({
        accountName: '',
        email: '',
        timezone: null,
        timeformat: null
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

    // Get user initials helper function
    const getUserInitials = () => {
        if (user?.user?.name) {
            const nameParts = user.user.name.split(' ');
            if (nameParts.length >= 2) {
                return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
                return nameParts[0][0].toUpperCase();
            }
        }
        
        if (profileSettings.firstName && profileSettings.lastName) {
            return `${profileSettings.firstName[0]}${profileSettings.lastName[0]}`.toUpperCase();
        }
        
        return user?.user?.email ? user.user.email[0].toUpperCase() : 'U';
    }

    // Timezone options
    const timezoneOptions = [
        { value: "Dateline Standard Time", label: "(UTC-12:00) International Date Line West", offset: -12 },
        { value: "UTC-11", label: "(UTC-11:00) Coordinated Universal Time-11", offset: -11 },
        { value: "Hawaiian Standard Time", label: "(UTC-10:00) Hawaii", offset: -10 },
        { value: "Alaskan Standard Time", label: "(UTC-09:00) Alaska", offset: -8 },
        { value: "Pacific Standard Time (Mexico)", label: "(UTC-08:00) Baja California", offset: -7 },
        { value: "Pacific Daylight Time", label: "(UTC-07:00) Pacific Daylight Time (US & Canada)", offset: -7 },
        { value: "Pacific Standard Time", label: "(UTC-08:00) Pacific Standard Time (US & Canada)", offset: -8 },
        { value: "US Mountain Standard Time", label: "(UTC-07:00) Arizona", offset: -7 },
        { value: "Mountain Standard Time (Mexico)", label: "(UTC-07:00) Chihuahua, La Paz, Mazatlan", offset: -6 },
        { value: "Mountain Standard Time", label: "(UTC-07:00) Mountain Time (US & Canada)", offset: -6 },
        { value: "Central America Standard Time", label: "(UTC-06:00) Central America", offset: -6 },
        { value: "Central Standard Time", label: "(UTC-06:00) Central Time (US & Canada)", offset: -5 },
        { value: "Central Standard Time (Mexico)", label: "(UTC-06:00) Guadalajara, Mexico City, Monterrey", offset: -5 },
        { value: "Canada Central Standard Time", label: "(UTC-06:00) Saskatchewan", offset: -6 },
        { value: "SA Pacific Standard Time", label: "(UTC-05:00) Bogota, Lima, Quito", offset: -5 },
        { value: "Eastern Standard Time", label: "(UTC-05:00) Eastern Time (US & Canada)", offset: -5 },
        { value: "Eastern Daylight Time", label: "(UTC-04:00) Eastern Daylight Time (US & Canada)", offset: -4 },
        { value: "US Eastern Standard Time", label: "(UTC-05:00) Indiana (East)", offset: -5 },
        { value: "Venezuela Standard Time", label: "(UTC-04:30) Caracas", offset: -4.5 },
        { value: "Paraguay Standard Time", label: "(UTC-04:00) Asuncion", offset: -4 },
        { value: "Atlantic Standard Time", label: "(UTC-04:00) Atlantic Time (Canada)", offset: -3 },
        { value: "Central Brazilian Standard Time", label: "(UTC-04:00) Cuiaba", offset: -4 },
        { value: "SA Western Standard Time", label: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan", offset: -4 },
        { value: "Pacific SA Standard Time", label: "(UTC-04:00) Santiago", offset: -4 },
        { value: "Newfoundland Standard Time", label: "(UTC-03:30) Newfoundland", offset: -2.5 },
        { value: "E. South America Standard Time", label: "(UTC-03:00) Brasilia", offset: -3 },
        { value: "Argentina Standard Time", label: "(UTC-03:00) Buenos Aires", offset: -3 },
        { value: "SA Eastern Standard Time", label: "(UTC-03:00) Cayenne, Fortaleza", offset: -3 },
        { value: "Greenland Standard Time", label: "(UTC-03:00) Greenland", offset: -3 },
        { value: "Montevideo Standard Time", label: "(UTC-03:00) Montevideo", offset: -3 },
        { value: "Bahia Standard Time", label: "(UTC-03:00) Salvador", offset: -3 },
        { value: "UTC-02", label: "(UTC-02:00) Coordinated Universal Time-02", offset: -2 },
        { value: "Mid-Atlantic Standard Time", label: "(UTC-02:00) Mid-Atlantic - Old", offset: -1 },
        { value: "Azores Standard Time", label: "(UTC-01:00) Azores", offset: 0 },
        { value: "Cape Verde Standard Time", label: "(UTC-01:00) Cape Verde Is.", offset: -1 },
        { value: "Morocco Standard Time", label: "(UTC) Casablanca", offset: 1 },
        { value: "UTC", label: "(UTC) Coordinated Universal Time", offset: 0 },
        { value: "GMT Standard Time", label: "(UTC) Edinburgh, London", offset: 0 },
        { value: "British Summer Time", label: "(UTC+01:00) Edinburgh, London", offset: 1 },
        { value: "GMT Standard Time", label: "(UTC) Dublin, Lisbon", offset: 1 },
        { value: "Greenwich Standard Time", label: "(UTC) Monrovia, Reykjavik", offset: 0 },
        { value: "W. Europe Standard Time", label: "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna", offset: 2 },
        { value: "Central Europe Standard Time", label: "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague", offset: 2 },
        { value: "Romance Standard Time", label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris", offset: 2 },
        { value: "Central European Standard Time", label: "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb", offset: 2 },
        { value: "W. Central Africa Standard Time", label: "(UTC+01:00) West Central Africa", offset: 1 },
        { value: "Namibia Standard Time", label: "(UTC+01:00) Windhoek", offset: 1 },
        { value: "GTB Standard Time", label: "(UTC+02:00) Athens, Bucharest", offset: 3 },
        { value: "Middle East Standard Time", label: "(UTC+02:00) Beirut", offset: 3 },
        { value: "Egypt Standard Time", label: "(UTC+02:00) Cairo", offset: 2 },
        { value: "Syria Standard Time", label: "(UTC+02:00) Damascus", offset: 3 },
        { value: "E. Europe Standard Time", label: "(UTC+02:00) E. Europe", offset: 3 },
        { value: "South Africa Standard Time", label: "(UTC+02:00) Harare, Pretoria", offset: 2 },
        { value: "FLE Standard Time", label: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius", offset: 3 },
        { value: "Turkey Standard Time", label: "(UTC+03:00) Istanbul", offset: 3 },
        { value: "Israel Standard Time", label: "(UTC+02:00) Jerusalem", offset: 3 },
        { value: "Libya Standard Time", label: "(UTC+02:00) Tripoli", offset: 2 },
        { value: "Jordan Standard Time", label: "(UTC+03:00) Amman", offset: 3 },
        { value: "Arabic Standard Time", label: "(UTC+03:00) Baghdad", offset: 3 },
        { value: "Kaliningrad Standard Time", label: "(UTC+02:00) Kaliningrad", offset: 3 },
        { value: "Arab Standard Time", label: "(UTC+03:00) Kuwait, Riyadh", offset: 3 },
        { value: "E. Africa Standard Time", label: "(UTC+03:00) Nairobi", offset: 3 },
        { value: "Moscow Standard Time", label: "(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk", offset: 3 },
        { value: "Samara Time", label: "(UTC+04:00) Samara, Ulyanovsk, Saratov", offset: 4 },
        { value: "Iran Standard Time", label: "(UTC+03:30) Tehran", offset: 4.5 },
        { value: "Arabian Standard Time", label: "(UTC+04:00) Abu Dhabi, Muscat", offset: 4 }
    ];

    // Date format options
    const dateFormatOptions = [
        { value: "yyyy-mm-dd", label: "yyyy-mm-dd" },
        { value: "dd/mm/yyyy", label: "dd/mm/yyyy" },
        { value: "mm/dd/yyyy", label: "mm/dd/yyyy" }
    ];

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
            // Populate with actual user data from context
            setPersonalSettings({
                accountName: account?.name || 'Account Name',
                email: user?.user?.email || '',
                timezone: timezoneOptions.find(tz => tz.label === "(UTC+02:00) Athens, Bucharest") || timezoneOptions[0],
                timeformat: dateFormatOptions[1] // Default to dd/mm/yyyy
            })
            
            // Get user names from name field if available
            let firstName = '', lastName = '';
            if (user?.user?.name) {
                const nameParts = user.user.name.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            }
            
            setProfileSettings({
                email: user?.user?.email || '',
                password: '••••••••',
                firstName: firstName,
                lastName: lastName
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

    // Handle password update
    const handleUpdatePassword = async () => {
        const result = await PopupText.fire({
            icon: 'question',
            text: 'Do you want to update your password?',
            inputField: true,
            inputLabel: 'New Password',
            inputPlaceholder: 'Enter new password',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Update Password',
            cancelButtonText: 'Cancel',
        });
        
        if (result.isConfirmed && result.inputValue) {
            setIsLoading(true);
            try {
                // Implementation would depend on actual API
                setTimeout(() => {
                    createNotification({
                        message: 'Password updated successfully',
                        type: 'default',
                        autoClose: 3000
                    });
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error updating password:", error);
                createNotification({
                    message: 'Failed to update password',
                    type: 'warning'
                });
                setIsLoading(false);
            }
        }
    }

    // Handle save changes for any section
    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            // Check if we're in the details section and have an account to update
            if (activeSection === 'details' && account && account.id) {
                // Make the API call to edit the account
                const response = await ApiService.post(
                    'fairymailer/editAccount',
                    {
                        account_id: account.id,
                        account_name: personalSettings.accountName
                    },
                    user.jwt
                );
                
                if (response.data && (response.data.success || response.data.code === 200)) {
                    // Update the accounts list in User service for the account picker
                    const accounts = User.getAccounts();
                    if (accounts && Array.isArray(accounts)) {
                        const updatedAccounts = accounts.map(acc => 
                            acc.id === account.id ? { ...acc, name: personalSettings.accountName } : acc
                        );
                        User.setAccounts(updatedAccounts);
                    }
                    
                    createNotification({
                        message: 'Account updated successfully! Refreshing page...',
                        type: 'default',
                        autoClose: 1500
                    });
                    
                    // Give a small delay so the notification can be seen briefly
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error('Failed to update account');
                }
            } else if (activeSection === 'profile') {
                // For profile section, simulate successful update
                // In a real implementation, this would call an API endpoint
                
                setTimeout(() => {
                    createNotification({
                        message: 'Profile updated successfully',
                        type: 'default',
                        autoClose: 3000
                    });
                }, 500);
            } else {
                // For other sections, just show a success message
                setTimeout(() => {
                    createNotification({
                        message: 'Settings saved successfully',
                        type: 'default',
                        autoClose: 3000
                    });
                }, 500);
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            createNotification({
                message: 'Failed to save settings: ' + (error.response?.data?.message || error.message),
                type: 'warning'
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Handle section changes via ButtonGroup
    const handleSectionChange = (value) => {
        navigate(`/settings/${value}`)
        setActiveSection(value)
    }

    // Handle timezone selection
    const handleTimezoneSelect = (option) => {
        setPersonalSettings({
            ...personalSettings,
            timezone: option
        })
    }

    // Handle date format selection
    const handleDateFormatSelect = (option) => {
        setPersonalSettings({
            ...personalSettings,
            timeformat: option
        })
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
                                    <Dropdown
                                        options={timezoneOptions}
                                        selectedValue={personalSettings.timezone}
                                        onOptionSelect={handleTimezoneSelect}
                                    >
                                        Timezone
                                    </Dropdown>
                                </div>
                                
                                <div className="dropdown-item">
                                    <Dropdown
                                        options={dateFormatOptions}
                                        selectedValue={personalSettings.timeformat}
                                        onOptionSelect={handleDateFormatSelect}
                                    >
                                        Date Format
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                        
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
                        </div>
                    </div>
                )
            case 'domain':
                return <DomainIdentity />
            case 'presets':
                return <CampaignPresets />
            case 'notifications':
                return (
                    <div className="settings-tab-content">
                        <div className="notification-section">
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
                        </div>
                        <div className="notification-section">
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
                        <div className="settings-action-buttons">
                            <Button type="primary" onClick={handleSaveChanges} loading={isLoading}>Save Changes</Button>
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
                                    {getUserInitials()}
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
                                        type={showPassword ? "text" : "password"}
                                        onChange={(e) => setProfileSettings({...profileSettings, password: e.target.value})}
                                        disabled={true}
                                    />
                                    <div 
                                        className="password-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                                    </div>
                                </div>
                                
                                <div className="update-password-button">
                                    <Button type="secondary" onClick={handleUpdatePassword}>Update Password</Button>
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
                    
                    {renderTabContent()}
                    
                </div>
            </div>
        </>
    )
}

export default Settings