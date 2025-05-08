import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';
import ColorPicker from '../../components/ColorPicker';
import Dropdown from '../../components/Dropdown';
import Switch from '../../components/Switch';
import Icon from '../../components/Icon/Icon';
import { useAccount } from '../../context/AccountContext';
import Checkbox from '../../components/Checkbox';
import Slider from '../../components/Slider_ck/Slider';
import './CampaignPresets.scss';
import { ApiService } from '../../service/api-service';

const CampaignPresets = () => {
    const { user, account, createNotification } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    
    // Container settings
    const [containerSettings, setContainerSettings] = useState({
        backgroundColor: '#FFA600',
        opacity: '100',
        width: '600',
        paddingTop: '20',
        paddingRight: '20',
        paddingBottom: '20',
        paddingLeft: '20',
        fontSize: '16',
        lineHeight: '1.5',
        font: 'Inter',
        textColor: '#000000',
        linksColor: '#FF635D',
        backgroundImage: ''
    });
    
    // Button settings
    const [buttonSettings, setButtonSettings] = useState({
        backgroundColor: '#FF635D',
        textColor: '#FFFFFF',
        paddingTop: '10',
        paddingRight: '20',
        paddingBottom: '10',
        paddingLeft: '20',
        borderRadius: '8',
        fontSize: '16',
        buttonText: 'Read More',
        isAutoWidth: true,
        width: '150'
    });
    
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
    
    // Font options for dropdown
    const fontOptions = [
        { value: 'Inter', label: 'Inter' },
        { value: 'Bitter', label: 'Bitter' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Georgia', label: 'Georgia' },
    ];
    
    // Social platform options
    const platformOptions = [
        { value: 'Facebook', label: 'Facebook' },
        { value: 'Twitter', label: 'Twitter' },
        { value: 'Instagram', label: 'Instagram' },
        { value: 'LinkedIn', label: 'LinkedIn' },
        { value: 'YouTube', label: 'YouTube' },
        { value: 'Pinterest', label: 'Pinterest' },
        { value: 'TikTok', label: 'TikTok' },
    ];
    
    // Load presets from account when component mounts
    useEffect(() => {
        const loadPresets = async () => {
            try {
                if (account && account.custom_component && account.custom_component.presets) {
                    const presets = account.custom_component.presets;
                    
                    // Update containerSettings
                    if (presets.styles) {
                        setContainerSettings({
                            ...containerSettings,
                            backgroundColor: presets.styles.backgroundColor || '#FFA600',
                            textColor: presets.styles.color || '#000000',
                            linksColor: presets.styles.linkColor || '#FF635D',
                            font: presets.styles.fontFamily || 'Inter',
                            backgroundImage: presets.styles.backgroundImage || '',
                            width: presets.contentWidth ? parseInt(presets.contentWidth) : 600,
                            // Keep other properties
                        });
                    }
                    
                    // Update button settings
                    if (presets.buttonDefaults) {
                        const buttonDefaults = presets.buttonDefaults;
                        // Parse padding values from string like "10px 20px 10px 20px"
                        const padding = buttonDefaults.padding ? buttonDefaults.padding.split(' ').map(p => parseInt(p)) : [10, 20, 10, 20];
                        
                        setButtonSettings({
                            ...buttonSettings,
                            backgroundColor: buttonDefaults.backgroundColor || '#FF635D',
                            textColor: buttonDefaults.textColor || '#FFFFFF',
                            paddingTop: padding[0] ? parseInt(padding[0]) : 10,
                            paddingRight: padding[1] ? parseInt(padding[1]) : 20,
                            paddingBottom: padding[2] ? parseInt(padding[2]) : 10,
                            paddingLeft: padding[3] ? parseInt(padding[3]) : 20,
                            borderRadius: buttonDefaults.borderRadius ? parseInt(buttonDefaults.borderRadius) : 8,
                            fontSize: buttonDefaults.fontSize ? parseInt(buttonDefaults.fontSize) : 16,
                            buttonText: buttonDefaults.text || 'Read More',
                        });
                    }
                    
                    // Update footer settings
                    if (presets.footerSettings) {
                        setFooterSettings({
                            ...footerSettings,
                            unsubscribeText: presets.footerSettings.unsubscribeText || 'Click here to unsubscribe',
                            companyAddress: presets.footerSettings.companyAddress || '',
                            legalText: presets.footerSettings.legalText || ''
                        });
                    }
                    
                    // Update social links
                    if (presets.socialLinks && presets.socialLinks.length > 0) {
                        setSocialLinks(presets.socialLinks.map((link, index) => ({
                            id: index + 1,
                            platform: link.platform,
                            url: link.url
                        })));
                    }
                }
            } catch (error) {
                console.error("Error loading presets:", error);
            }
        };
        
        loadPresets();
    }, [account]);
    
    const handleSaveSettings = async () => {
        setIsLoading(true);
        
        try {
            // Format the presets data 
            const presetData = {
                styles: {
                    color: containerSettings.textColor || '#000000',
                    backgroundColor: containerSettings.backgroundColor || '#FFF8EF',
                    linkColor: containerSettings.linksColor || '#FF635D',
                    fontFamily: containerSettings.font || 'Inter',
                    backgroundImage: containerSettings.backgroundImage ? `url('${containerSettings.backgroundImage}')` : '',
                },
                contentWidth: `${containerSettings.width || 600}px`,
                preHeader: '',
                // Button defaults
                buttonDefaults: {
                    backgroundColor: buttonSettings.backgroundColor || '#FF635D',
                    textColor: buttonSettings.textColor || '#FFFFFF',
                    padding: `${buttonSettings.paddingTop}px ${buttonSettings.paddingRight}px ${buttonSettings.paddingBottom}px ${buttonSettings.paddingLeft}px`,
                    borderRadius: `${buttonSettings.borderRadius}px`,
                    fontSize: `${buttonSettings.fontSize}px`,
                    text: buttonSettings.buttonText || 'Read More',
                    width: buttonSettings.isAutoWidth ? 'auto' : `${buttonSettings.width}px`
                },
                // Footer settings
                footerSettings: {
                    unsubscribeText: footerSettings.unsubscribeText || 'Click here to unsubscribe',
                    companyAddress: footerSettings.companyAddress || '',
                    legalText: footerSettings.legalText || ''
                },
                // Social links
                socialLinks: socialLinks.map(link => ({
                    platform: link.platform,
                    url: link.url
                }))
            };
            
            // This is the key change - following the pattern from successful API calls in DomainIdentity.jsx
            const requestData = {
                accountPresets: presetData
            };
            
            console.log("Sending presets data:", requestData);
            
            // Make the API request with the correct format
            const response = await ApiService.post(
                'fairymailer/updateAccountPresets', 
                requestData,
                user.jwt
            );
            
            console.log("Response from server:", response);
            
            createNotification({
                message: 'Campaign presets saved successfully',
                type: 'default',
                autoClose: 3000
            });
        } catch (error) {
            console.error("Error saving presets:", error);
            
            // Detailed error logging
            if (error.response) {
                console.error("Server error details:", error.response.data);
                console.error("Status code:", error.response.status);
            }
            
            createNotification({
                message: 'Failed to save campaign presets. Please try again.',
                type: 'warning',
                autoClose: 5000
            });
        } finally {
            setIsLoading(false);
        }
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
    
    // Handle platform selection for social links
    const handlePlatformSelect = (option, linkId) => {
        setSocialLinks(socialLinks.map(link => 
            link.id === linkId ? {...link, platform: option.value} : link
        ));
    };

    return (
        <div className="campaign-presets-minimal">
            {/* Container Settings */}
            <div className="settings-section">
                <h3 className="section-title">Container Settings</h3>
                
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
                            type="number"
                        />
                    </div>
                    
                    <div className="input-column">
                        <InputText
                            label="Font Size"
                            value={containerSettings.fontSize}
                            onChange={(e) => setContainerSettings({...containerSettings, fontSize: e.target.value})}
                            type="number"
                        />
                    </div>
                    
                    <div className="input-column">
                        <InputText
                            label="Line Height"
                            value={containerSettings.lineHeight}
                            onChange={(e) => setContainerSettings({...containerSettings, lineHeight: e.target.value})}
                            type="number"
                            step="0.1"
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
                            type="number"
                        />
                    </div>
                    
                    <div className="input-column">
                        <InputText
                            label="Right"
                            value={containerSettings.paddingRight}
                            onChange={(e) => setContainerSettings({...containerSettings, paddingRight: e.target.value})}
                            type="number"
                        />
                    </div>
                    
                    <div className="input-column">
                        <InputText
                            label="Bottom"
                            value={containerSettings.paddingBottom}
                            onChange={(e) => setContainerSettings({...containerSettings, paddingBottom: e.target.value})}
                            type="number"
                        />
                    </div>
                    
                    <div className="input-column">
                        <InputText
                            label="Left"
                            value={containerSettings.paddingLeft}
                            onChange={(e) => setContainerSettings({...containerSettings, paddingLeft: e.target.value})}
                            type="number"
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
            
            {/* Social Links */}
            <div className="settings-section">
                <h3 className="section-title">Social Links</h3>
                
                <div className="social-links">
                    {socialLinks.map(link => (
                        <div key={link.id} className="social-link-item">
                            <div className="link-input-group">
                                <div className="platform-dropdown">
                                    <div className="setting-label">Platform</div>
                                    <Dropdown
                                        options={platformOptions}
                                        selectedValue={platformOptions.find(option => option.value === link.platform)}
                                        onOptionSelect={(option) => handlePlatformSelect(option, link.id)}
                                    >
                                        {link.platform || 'Select Platform'}
                                    </Dropdown>
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
            </div>
            
            {/* Footer Settings */}
            <div className="settings-section">
                <h3 className="section-title">Footer Settings</h3>
                
                <div className="switch-section">
                    <Switch
                        checked={true}
                        onChange={() => {}} // No-op function since this should be disabled
                        label="Include Unsubscribe Link"
                        disabled={true}
                    />
                </div>
                
                <div className="input-section">
                    <InputText
                        label="Unsubscribe Text"
                        value={footerSettings.unsubscribeText}
                        onChange={(e) => setFooterSettings({...footerSettings, unsubscribeText: e.target.value})}
                    />
                </div>
                
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
            
            {/* Button Settings */}
            <div className="settings-section">
                <h3 className="section-title">Button Defaults</h3>
                
                <div className="button-settings-group">
                    <div className="section-subheading">Button Styling</div>
                    
                    <div className="input-row">
                        <div className="input-column">
                            <div className="setting-label">Button Color</div>
                            <div className="color-picker-container">
                                <ColorPicker
                                    initColorHex={buttonSettings.backgroundColor}
                                    initColorAlpha={1}
                                    onChange={(color) => {
                                        setButtonSettings({
                                            ...buttonSettings,
                                            backgroundColor: color.hex
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="input-column">
                            <div className="setting-label">Text Color</div>
                            <div className="color-picker-container">
                                <ColorPicker
                                    initColorHex={buttonSettings.textColor}
                                    initColorAlpha={1}
                                    onChange={(color) => {
                                        setButtonSettings({
                                            ...buttonSettings,
                                            textColor: color.hex
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="auto-width-section">
                        <Checkbox
                            checked={buttonSettings.isAutoWidth}
                            onChange={(checked) => setButtonSettings({...buttonSettings, isAutoWidth: checked})}
                            label="Auto Width"
                        />
                    </div>
                    
                    {!buttonSettings.isAutoWidth && (
                        <div className="slider-section">
                            <div className="setting-label">Button Width</div>
                            <Slider 
                                min={50} 
                                max={300} 
                                defaultValue={buttonSettings.width || 150} 
                                step={1}
                                onChange={(value) => setButtonSettings({...buttonSettings, width: value})}
                            />
                        </div>
                    )}
                    
                    <div className="section-subheading">Button Padding</div>
                    <div className="input-row">
                        <div className="input-column">
                            <InputText
                                label="Top"
                                value={buttonSettings.paddingTop}
                                onChange={(e) => setButtonSettings({...buttonSettings, paddingTop: e.target.value})}
                                type="number"
                            />
                        </div>
                        
                        <div className="input-column">
                            <InputText
                                label="Right"
                                value={buttonSettings.paddingRight}
                                onChange={(e) => setButtonSettings({...buttonSettings, paddingRight: e.target.value})}
                                type="number"
                            />
                        </div>
                        
                        <div className="input-column">
                            <InputText
                                label="Bottom"
                                value={buttonSettings.paddingBottom}
                                onChange={(e) => setButtonSettings({...buttonSettings, paddingBottom: e.target.value})}
                                type="number"
                            />
                        </div>
                        
                        <div className="input-column">
                            <InputText
                                label="Left"
                                value={buttonSettings.paddingLeft}
                                onChange={(e) => setButtonSettings({...buttonSettings, paddingLeft: e.target.value})}
                                type="number"
                            />
                        </div>
                    </div>
                    
                    <div className="input-row">
                        <div className="input-column">
                            <InputText
                                label="Border Radius"
                                value={buttonSettings.borderRadius}
                                onChange={(e) => setButtonSettings({...buttonSettings, borderRadius: e.target.value})}
                                type="number"
                            />
                        </div>
                        
                        <div className="input-column">
                            <InputText
                                label="Font Size"
                                value={buttonSettings.fontSize}
                                onChange={(e) => setButtonSettings({...buttonSettings, fontSize: e.target.value})}
                                type="number"
                            />
                        </div>
                    </div>
                    
                    <div className="input-section">
                        <InputText
                            label="Default Button Text"
                            value={buttonSettings.buttonText}
                            onChange={(e) => setButtonSettings({...buttonSettings, buttonText: e.target.value})}
                        />
                    </div>
                    
                    <div className="button-preview-row">
                        <div className="tiny-button-preview">
                            <button 
                                className="button-sample" 
                                style={{
                                    backgroundColor: buttonSettings.backgroundColor,
                                    color: buttonSettings.textColor,
                                    padding: `${buttonSettings.paddingTop}px ${buttonSettings.paddingRight}px ${buttonSettings.paddingBottom}px ${buttonSettings.paddingLeft}px`,
                                    borderRadius: `${buttonSettings.borderRadius}px`,
                                    fontSize: `${buttonSettings.fontSize}px`,
                                    width: buttonSettings.isAutoWidth ? 'auto' : `${buttonSettings.width}px`
                                }}
                            >
                                {buttonSettings.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Save Button */}
            <div className="save-settings-button">
                <Button type="primary" onClick={handleSaveSettings} loading={isLoading}>
                    Save Settings
                </Button>
            </div>
        </div>
    );
};

export default CampaignPresets;