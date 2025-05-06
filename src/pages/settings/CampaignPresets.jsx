import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';
import ColorPicker from '../../components/ColorPicker';
import Dropdown from '../../components/Dropdown';
import Switch from '../../components/Switch';
import Icon from '../../components/Icon/Icon';
import { ApiService } from '../../service/api-service';
import { useAccount } from '../../context/AccountContext';
import Checkbox from '../../components/Checkbox';
import './CampaignPresets.scss';

const CampaignPresets = () => {
    const { user, account, createNotification } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    
    // Active preset selection
    const [activePreset, setActivePreset] = useState(null);
    const [presetsList, setPresetsList] = useState([]);
    
    // Container settings
    const [containerSettings, setContainerSettings] = useState({
        backgroundColor: '#FFA600',
        opacity: '100',
        width: '600px',
        padding: '20px',
        margin: '0 auto',
        font: 'Inter',
    });
    
    // Sender information
    const [senderInfo, setSenderInfo] = useState({
        fromName: '',
        fromEmail: '',
        replyToEmail: '',
    });
    
    // Subject line templates
    const [subjectTemplates, setSubjectTemplates] = useState([
        { id: 1, text: '{{name}}, check out our latest products!', isDefault: false },
        { id: 2, text: 'Don\'t miss our exclusive offer', isDefault: true },
        { id: 3, text: 'Your weekly newsletter from [Company]', isDefault: false },
    ]);
    
    // Social links 
    const [socialLinks, setSocialLinks] = useState([
        { id: 1, platform: 'Facebook', url: 'https://facebook.com/' },
        { id: 2, platform: 'Twitter', url: 'https://twitter.com/' },
        { id: 3, platform: 'Instagram', url: 'https://instagram.com/' },
    ]);
    
    // Footer settings
    const [footerSettings, setFooterSettings] = useState({
        includeUnsubscribe: true,
        unsubscribeText: 'Click here to unsubscribe',
        companyAddress: '',
        legalText: '',
    });
    
    // Schedule defaults
    const [scheduleDefaults, setScheduleDefaults] = useState({
        preferredDays: {
            monday: false,
            tuesday: true,
            wednesday: false,
            thursday: true,
            friday: false,
            saturday: false,
            sunday: false,
        },
        preferredTime: '10:00',
        timeZone: null,
    });
    
    // Font options for dropdown
    const fontOptions = [
        { value: 'Inter', label: 'Inter' },
        { value: 'Bitter', label: 'Bitter' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Georgia', label: 'Georgia' },
    ];
    
    // Timezone options
    const timezoneOptions = [
        { value: "UTC", label: "(UTC+00:00) Coordinated Universal Time" },
        { value: "Eastern Standard Time", label: "(UTC-05:00) Eastern Time (US & Canada)" },
        { value: "Central European Time", label: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris" },
        { value: "Pacific Standard Time", label: "(UTC-08:00) Pacific Time (US & Canada)" },
    ];
    
    // Load presets from API or localStorage
    useEffect(() => {
        if (user && account) {
            loadPresets();
        }
    }, [user, account]);
    
    const loadPresets = async () => {
        setIsLoading(true);
        try {
            // Mock data - in production this would be fetched from the API
            const presets = [
                { id: 1, name: 'Default Newsletter', isDefault: true },
                { id: 2, name: 'Promo Campaign', isDefault: false },
                { id: 3, name: 'Welcome Email', isDefault: false },
            ];
            
            setPresetsList(presets);
            
            // Set active preset to the default one
            const defaultPreset = presets.find(preset => preset.isDefault);
            if (defaultPreset) {
                setActivePreset(defaultPreset);
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading presets:", error);
            createNotification({
                message: 'Failed to load campaign presets. Please try again.',
                type: 'warning'
            });
            setIsLoading(false);
        }
    };
    
    const handleSavePreset = async () => {
        setIsLoading(true);
        try {
            // Compile all settings into a single preset object
            const presetData = {
                name: activePreset?.name || 'New Preset',
                isDefault: activePreset?.isDefault || false,
                containerSettings,
                senderInfo,
                subjectTemplates,
                socialLinks,
                footerSettings,
                scheduleDefaults
            };
            
            // Mock API call - would save to backend in production
            setTimeout(() => {
                createNotification({
                    message: 'Campaign preset saved successfully',
                    type: 'default',
                    autoClose: 3000
                });
                setIsLoading(false);
            }, 1000);
            
            console.log('Preset data to save:', presetData);
        } catch (error) {
            console.error("Error saving preset:", error);
            createNotification({
                message: 'Failed to save campaign preset. Please try again.',
                type: 'warning'
            });
            setIsLoading(false);
        }
    };
    
    const handleCreateNewPreset = () => {
        const newPreset = {
            id: Date.now(), // Generate a temporary ID
            name: 'New Preset',
            isDefault: false
        };
        
        setPresetsList([...presetsList, newPreset]);
        setActivePreset(newPreset);
        
        // Reset settings to defaults
        setContainerSettings({
            backgroundColor: '#FFA600',
            opacity: '100',
            width: '600px',
            padding: '20px',
            margin: '0 auto',
            font: 'Inter',
        });
        
        setSenderInfo({
            fromName: '',
            fromEmail: '',
            replyToEmail: '',
        });
        
        // Keep subject templates intact but remove defaults
        setSubjectTemplates(subjectTemplates.map(template => ({
            ...template,
            isDefault: false
        })));
    };
    
    const handleDeletePreset = (presetId) => {
        // Confirm deletion with the user
        if (window.confirm('Are you sure you want to delete this preset?')) {
            // Remove from list
            const updatedPresets = presetsList.filter(preset => preset.id !== presetId);
            setPresetsList(updatedPresets);
            
            // If deleted the active preset, set active to first available or null
            if (activePreset?.id === presetId) {
                setActivePreset(updatedPresets.length > 0 ? updatedPresets[0] : null);
            }
            
            createNotification({
                message: 'Preset deleted successfully',
                type: 'default',
                autoClose: 3000
            });
        }
    };
    
    // Handle adding a new subject template
    const handleAddSubjectTemplate = () => {
        const newTemplate = {
            id: Date.now(),
            text: 'New Subject Line',
            isDefault: false
        };
        
        setSubjectTemplates([...subjectTemplates, newTemplate]);
    };
    
    // Handle removing a subject template
    const handleRemoveSubjectTemplate = (templateId) => {
        setSubjectTemplates(subjectTemplates.filter(template => template.id !== templateId));
    };
    
    // Set a subject template as default
    const handleSetDefaultSubject = (templateId) => {
        setSubjectTemplates(subjectTemplates.map(template => ({
            ...template,
            isDefault: template.id === templateId
        })));
    };
    
    // Handle adding a new social link
    const handleAddSocialLink = () => {
        const newLink = {
            id: Date.now(),
            platform: 'LinkedIn',
            url: 'https://linkedin.com/'
        };
        
        setSocialLinks([...socialLinks, newLink]);
    };
    
    // Handle removing a social link
    const handleRemoveSocialLink = (linkId) => {
        setSocialLinks(socialLinks.filter(link => link.id !== linkId));
    };

    return (
        <div className="campaign-presets-container">
            {/* Presets List */}
            <Card className="presets-list-card">
                <h3 className="section-title">Campaign Presets</h3>
                <p className="section-description">Create and manage presets for your email campaigns</p>
                
                <div className="presets-list">
                    {presetsList.map(preset => (
                        <div 
                            key={preset.id} 
                            className={`preset-item ${activePreset?.id === preset.id ? 'active' : ''}`}
                            onClick={() => setActivePreset(preset)}
                        >
                            <div className="preset-name">
                                {preset.name}
                                {preset.isDefault && <span className="default-badge">Default</span>}
                            </div>
                            <div className="preset-actions">
                                <button 
                                    className="action-button" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePreset(preset.id);
                                    }}
                                >
                                    <Icon name="Trash" size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="create-preset-button">
                    <Button type="secondary" onClick={handleCreateNewPreset}>
                        <Icon name="Plus" size={14} /> New Preset
                    </Button>
                </div>
            </Card>
            
            {activePreset && (
                <>
                    {/* Preset Name and Default Setting */}
                    <Card className="preset-name-card">
                        <div className="preset-name-container">
                            <div className="input-section">
                                <InputText
                                    label="Preset Name"
                                    value={activePreset.name}
                                    onChange={(e) => setActivePreset({...activePreset, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="default-checkbox">
                                <Checkbox
                                    checked={activePreset.isDefault}
                                    label="Use as default"
                                    onChange={(checked) => setActivePreset({...activePreset, isDefault: checked})}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Container Settings */}
                    <Card className="settings-card">
                        <h3 className="section-title">Container Settings</h3>
                        
                        <div className="settings-section">
                            <div className="section-subheading">Colors</div>
                            <div className="color-picker-row">
                                <div className="color-picker-column">
                                    <div className="setting-label">Background Color (Theme)</div>
                                    <div className="color-picker-container">
                                        <ColorPicker
                                            initColorHex={containerSettings.backgroundColor}
                                            initColorAlpha={parseInt(containerSettings.opacity) / 100}
                                            onChange={(color) => {
                                                setContainerSettings({
                                                    ...containerSettings,
                                                    backgroundColor: color.hex,
                                                    opacity: Math.round(color.alpha * 100).toString(),
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="color-picker-column">
                                    <div className="setting-label">Text Color</div>
                                    <div className="color-picker-container">
                                        <ColorPicker
                                            initColorHex={containerSettings.textColor}
                                            initColorAlpha={1}
                                            onChange={(color) => {
                                                setContainerSettings({
                                                    ...containerSettings,
                                                    textColor: color.hex,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="color-picker-column">
                                    <div className="setting-label">Links Color</div>
                                    <div className="color-picker-container">
                                        <ColorPicker
                                            initColorHex={containerSettings.linksColor}
                                            initColorAlpha={1}
                                            onChange={(color) => {
                                                setContainerSettings({
                                                    ...containerSettings,
                                                    linksColor: color.hex,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="background-image-section">
                                <div className="setting-label">Background Image</div>
                                <div className="background-input-group">
                                    <InputText
                                        value={containerSettings.backgroundImage}
                                        onChange={(e) => setContainerSettings({...containerSettings, backgroundImage: e.target.value})}
                                        placeholder="Image URL"
                                    />
                                    <Button type="secondary">Choose Image</Button>
                                </div>
                            </div>
                            
                            <div className="input-row">
                                <div className="input-column">
                                    <InputText
                                        label="Container Width"
                                        value={containerSettings.width}
                                        onChange={(e) => setContainerSettings({...containerSettings, width: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Font Size"
                                        value={containerSettings.fontSize}
                                        onChange={(e) => setContainerSettings({...containerSettings, fontSize: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Line Height"
                                        value={containerSettings.lineHeight}
                                        onChange={(e) => setContainerSettings({...containerSettings, lineHeight: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="section-subheading">Section Padding</div>
                            <div className="input-row">
                                <div className="input-column">
                                    <InputText
                                        label="Top"
                                        value={containerSettings.paddingTop}
                                        onChange={(e) => setContainerSettings({...containerSettings, paddingTop: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Right"
                                        value={containerSettings.paddingRight}
                                        onChange={(e) => setContainerSettings({...containerSettings, paddingRight: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Bottom"
                                        value={containerSettings.paddingBottom}
                                        onChange={(e) => setContainerSettings({...containerSettings, paddingBottom: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Left"
                                        value={containerSettings.paddingLeft}
                                        onChange={(e) => setContainerSettings({...containerSettings, paddingLeft: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="input-row">
                                <div className="input-column">
                                    <InputText
                                        label="Margin"
                                        value={containerSettings.margin}
                                        onChange={(e) => setContainerSettings({...containerSettings, margin: e.target.value})}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Pre-Header Text"
                                        value={containerSettings.preHeader}
                                        onChange={(e) => setContainerSettings({...containerSettings, preHeader: e.target.value})}
                                        placeholder="Text displayed in email clients preview"
                                    />
                                </div>
                            </div>
                            
                            <div className="dropdown-section">
                                <div className="setting-label">Default Font</div>
                                <Dropdown
                                    options={fontOptions}
                                    selectedValue={fontOptions.find(option => option.value === containerSettings.font)}
                                    onOptionSelect={(option) => setContainerSettings({...containerSettings, font: option.value})}
                                >
                                    {containerSettings.font || 'Select Font'}
                                </Dropdown>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Sender Information */}
                    <Card className="settings-card">
                        <h3 className="section-title">Sender Information</h3>
                        
                        <div className="settings-section">
                            <div className="input-section">
                                <InputText
                                    label="From Name"
                                    value={senderInfo.fromName}
                                    onChange={(e) => setSenderInfo({...senderInfo, fromName: e.target.value})}
                                    placeholder="Your Name or Company Name"
                                />
                            </div>
                            
                            <div className="input-section">
                                <InputText
                                    label="From Email"
                                    value={senderInfo.fromEmail}
                                    onChange={(e) => setSenderInfo({...senderInfo, fromEmail: e.target.value})}
                                    placeholder="email@yourdomain.com"
                                />
                            </div>
                            
                            <div className="input-section">
                                <InputText
                                    label="Reply-To Email"
                                    value={senderInfo.replyToEmail}
                                    onChange={(e) => setSenderInfo({...senderInfo, replyToEmail: e.target.value})}
                                    placeholder="Leave empty to use from email"
                                />
                            </div>
                        </div>
                    </Card>
                    
                    {/* Subject Line Templates */}
                    <Card className="settings-card">
                        <h3 className="section-title">Subject Line Templates</h3>
                        
                        <div className="settings-section subject-templates">
                            {subjectTemplates.map(template => (
                                <div key={template.id} className="subject-template-item">
                                    <div className="template-input">
                                        <InputText
                                            value={template.text}
                                            onChange={(e) => {
                                                setSubjectTemplates(subjectTemplates.map(t => 
                                                    t.id === template.id ? {...t, text: e.target.value} : t
                                                ));
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="template-actions">
                                        <div className="default-radio">
                                            <Checkbox
                                                checked={template.isDefault}
                                                onChange={() => handleSetDefaultSubject(template.id)}
                                            />
                                            <span className="default-label">Default</span>
                                        </div>
                                        
                                        <button 
                                            className="action-button" 
                                            onClick={() => handleRemoveSubjectTemplate(template.id)}
                                        >
                                            <Icon name="Trash" size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="add-template-button">
                                <Button type="secondary" onClick={handleAddSubjectTemplate}>
                                    <Icon name="Plus" size={14} /> Add Subject Template
                                </Button>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Social Links */}
                    <Card className="settings-card">
                        <h3 className="section-title">Social Links</h3>
                        
                        <div className="settings-section social-links">
                            {socialLinks.map(link => (
                                <div key={link.id} className="social-link-item">
                                    <div className="link-input-group">
                                        <div className="platform-input">
                                            <InputText
                                                label="Platform"
                                                value={link.platform}
                                                onChange={(e) => {
                                                    setSocialLinks(socialLinks.map(l => 
                                                        l.id === link.id ? {...l, platform: e.target.value} : l
                                                    ));
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="url-input">
                                            <InputText
                                                label="URL"
                                                value={link.url}
                                                onChange={(e) => {
                                                    setSocialLinks(socialLinks.map(l => 
                                                        l.id === link.id ? {...l, url: e.target.value} : l
                                                    ));
                                                }}
                                            />
                                        </div>
                                        
                                        <button 
                                            className="action-button remove-link" 
                                            onClick={() => handleRemoveSocialLink(link.id)}
                                        >
                                            <Icon name="Trash" size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="add-link-button">
                                <Button type="secondary" onClick={handleAddSocialLink}>
                                    <Icon name="Plus" size={14} /> Add Social Link
                                </Button>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Footer Settings */}
                    <Card className="settings-card">
                        <h3 className="section-title">Footer Settings</h3>
                        
                        <div className="settings-section">
                            <div className="switch-section">
                                <Switch
                                    checked={footerSettings.includeUnsubscribe}
                                    onChange={(checked) => setFooterSettings({...footerSettings, includeUnsubscribe: checked})}
                                    label="Include Unsubscribe Link"
                                />
                            </div>
                            
                            {footerSettings.includeUnsubscribe && (
                                <div className="input-section">
                                    <InputText
                                        label="Unsubscribe Text"
                                        value={footerSettings.unsubscribeText}
                                        onChange={(e) => setFooterSettings({...footerSettings, unsubscribeText: e.target.value})}
                                    />
                                </div>
                            )}
                            
                            <div className="input-section">
                                <InputText
                                    label="Company Address"
                                    value={footerSettings.companyAddress}
                                    onChange={(e) => setFooterSettings({...footerSettings, companyAddress: e.target.value})}
                                />
                            </div>
                            
                            <div className="input-section">
                                <InputText
                                    label="Legal Text"
                                    value={footerSettings.legalText}
                                    onChange={(e) => setFooterSettings({...footerSettings, legalText: e.target.value})}
                                />
                            </div>
                        </div>
                    </Card>
                    
                    {/* Button Settings */}
                    <Card className="settings-card">
                        <h3 className="section-title">Button Defaults</h3>
                        
                        <div className="settings-section">
                            <div className="section-subheading">Button Styling</div>
                            
                            <div className="input-row">
                                <div className="input-column">
                                    <div className="setting-label">Button Color</div>
                                    <div className="color-picker-container">
                                        <ColorPicker
                                            initColorHex="#FF635D"
                                            initColorAlpha={1}
                                            onChange={(color) => {
                                                // Handle button color change
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="input-column">
                                    <div className="setting-label">Text Color</div>
                                    <div className="color-picker-container">
                                        <ColorPicker
                                            initColorHex="#FFFFFF"
                                            initColorAlpha={1}
                                            onChange={(color) => {
                                                // Handle button text color change
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="input-row">
                                <div className="input-column">
                                    <InputText
                                        label="Button Padding"
                                        value="10px 20px"
                                        onChange={(e) => {
                                            // Handle button padding change
                                        }}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Border Radius"
                                        value="8px"
                                        onChange={(e) => {
                                            // Handle border radius change
                                        }}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <InputText
                                        label="Font Size"
                                        value="16px"
                                        onChange={(e) => {
                                            // Handle font size change
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div className="input-section">
                                <InputText
                                    label="Default Button Text"
                                    value="Read More"
                                    onChange={(e) => {
                                        // Handle default button text change
                                    }}
                                />
                            </div>
                            
                            <div className="button-preview">
                                <div className="setting-label">Button Preview</div>
                                <div className="preview-container">
                                    <button className="button-sample">Read More</button>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Schedule Defaults */}
                    <Card className="settings-card">
                        <h3 className="section-title">Schedule Defaults</h3>
                        
                        <div className="settings-section">
                            <div className="setting-label">Preferred Send Days</div>
                            <div className="days-selector">
                                {Object.entries(scheduleDefaults.preferredDays).map(([day, isSelected]) => (
                                    <div 
                                        key={day} 
                                        className={`day-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setScheduleDefaults({
                                            ...scheduleDefaults,
                                            preferredDays: {
                                                ...scheduleDefaults.preferredDays,
                                                [day]: !isSelected
                                            }
                                        })}
                                    >
                                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="time-settings">
                                <div className="input-section time-input">
                                    <InputText
                                        label="Preferred Time"
                                        value={scheduleDefaults.preferredTime}
                                        onChange={(e) => setScheduleDefaults({...scheduleDefaults, preferredTime: e.target.value})}
                                        placeholder="HH:MM"
                                    />
                                </div>
                                
                                <div className="dropdown-section timezone-dropdown">
                                    <div className="setting-label">Time Zone</div>
                                    <Dropdown
                                        options={timezoneOptions}
                                        selectedValue={scheduleDefaults.timeZone}
                                        onOptionSelect={(option) => setScheduleDefaults({...scheduleDefaults, timeZone: option})}
                                    >
                                        {scheduleDefaults.timeZone?.label || 'Select Time Zone'}
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    {/* Save Button */}
                    <div className="save-preset-button">
                        <Button type="primary" onClick={handleSavePreset} loading={isLoading}>
                            Save Preset
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CampaignPresets;