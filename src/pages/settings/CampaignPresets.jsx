import React, { useState } from 'react';
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

const CampaignPresets = () => {
    const { createNotification } = useAccount();
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
        font: 'Inter'
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
        isAutoWidth: true
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
    
    const handleSaveSettings = () => {
        setIsLoading(true);
        
        // Mock API call - would save to backend in production
        setTimeout(() => {
            createNotification({
                message: 'Campaign settings saved successfully',
                type: 'default',
                autoClose: 3000
            });
            setIsLoading(false);
        }, 1000);
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