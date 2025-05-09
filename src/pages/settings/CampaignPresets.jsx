import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';
import ColorPicker from '../../components/ColorPicker';
import Dropdown from '../../components/Dropdown';
import Switch from '../../components/Switch';
import Icon from '../../components/Icon/Icon';
import { useAccount } from '../../context/AccountContext';
import Checkbox from '../../components/Checkbox';
import Slider from '../../components/Slider_ck/Slider';
import { useNavigate, useLocation } from 'react-router-dom';
import './CampaignPresets.scss';
import { ApiService } from '../../service/api-service';
import User from '../../service/User';

const CampaignPresets = () => {
    const { user, account, setAccount, createNotification } = useAccount();
    const [isLoading, setIsLoading] = useState(false);
    
    // Use renderKey to force re-render of the component
    const [renderKey, setRenderKey] = useState(Date.now());
    
    // Initialize state with null to indicate data not loaded yet
    const [containerSettings, setContainerSettings] = useState(null);
    const [buttonSettings, setButtonSettings] = useState(null);
    const [socialLinks, setSocialLinks] = useState(null);
    const [footerSettings, setFooterSettings] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Used to track if data has been initialized
    const initialized = useRef(false);
    
    // Helper for better debug logging
    const logDebug = (message, data) => {
        console.log(`[CampaignPresets] ${message}`, data || '');
    };
    
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
    
    // Debounce function for color picker
    const debounce = (func, delay) => {
        let debounceTimer;
        return function(...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };
    
    // Handlers for color picker changes with debounce
    const handleBackgroundColorChange = useCallback(
        debounce((color) => {
            if (!containerSettings) return;
            
            logDebug(`Updating background color to ${color.hex}`);
            setContainerSettings(prev => ({
                ...prev,
                backgroundColor: color.hex,
                opacity: Math.round(color.alpha * 100).toString(),
            }));
        }, 100),
        [containerSettings]
    );

    const handleTextColorChange = useCallback(
        debounce((color) => {
            if (!containerSettings) return;
            
            logDebug(`Updating text color to ${color.hex}`);
            setContainerSettings(prev => ({
                ...prev,
                textColor: color.hex,
            }));
        }, 100),
        [containerSettings]
    );

    const handleLinksColorChange = useCallback(
        debounce((color) => {
            if (!containerSettings) return;
            
            logDebug(`Updating links color to ${color.hex}`);
            setContainerSettings(prev => ({
                ...prev,
                linksColor: color.hex,
            }));
        }, 100),
        [containerSettings]
    );

    const handleButtonBgColorChange = useCallback(
        debounce((color) => {
            if (!buttonSettings) return;
            
            logDebug(`Updating button bg color to ${color.hex}`);
            setButtonSettings(prev => ({
                ...prev,
                backgroundColor: color.hex
            }));
        }, 100),
        [buttonSettings]
    );

    const handleButtonTextColorChange = useCallback(
        debounce((color) => {
            if (!buttonSettings) return;
            
            logDebug(`Updating button text color to ${color.hex}`);
            setButtonSettings(prev => ({
                ...prev,
                textColor: color.hex
            }));
        }, 100),
        [buttonSettings]
    );
    
    // Handle adding a new social link
    const handleAddSocialLink = () => {
        if (!socialLinks) return;
        
        const newLink = {
            id: Date.now(),
            platform: 'LinkedIn',
            url: 'https://linkedin.com/'
        };
        
        setSocialLinks([...socialLinks, newLink]);
    };
    
    // Handle removing a social link
    const handleRemoveSocialLink = (linkId) => {
        if (!socialLinks) return;
        setSocialLinks(socialLinks.filter(link => link.id !== linkId));
    };
    
    // Handle platform selection for social links
    const handlePlatformSelect = (option, linkId) => {
        if (!socialLinks) return;
        setSocialLinks(socialLinks.map(link => 
            link.id === linkId ? {...link, platform: option.value} : link
        ));
    };
    
    // This effect runs when account data changes to initialize component state
    useEffect(() => {
        // Skip if already initialized with non-null values
        if (containerSettings && buttonSettings && footerSettings && socialLinks) {
            logDebug("State already initialized with non-null values");
            return;
        }
        
        logDebug("Initializing component state from account", account);
        
        // Check if we have presets in the account
        const hasPresets = account && account.custom_component && account.custom_component.presets;
        
        // Get presets or empty object if none exist
        const presets = hasPresets ? account.custom_component.presets : {};
        
        // Initialize container settings - always set values even if no presets exist
        const styles = hasPresets && presets.styles ? presets.styles : null;
        setContainerSettings({
            backgroundColor: styles ? styles.backgroundColor || '#FFA600' : '#FFA600',
            opacity: '100',
            width: hasPresets && presets.contentWidth ? presets.contentWidth.replace('px', '') : '600',
            paddingTop: '20',
            paddingRight: '20',
            paddingBottom: '20',
            paddingLeft: '20',
            fontSize: '16',
            lineHeight: '1.5',
            font: styles ? styles.fontFamily || 'Inter' : 'Inter',
            textColor: styles ? styles.color || '#000000' : '#000000',
            linksColor: styles ? styles.linkColor || '#FF635D' : '#FF635D',
            backgroundImage: styles && styles.backgroundImage ? 
                styles.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1') : '',
        });
        
        // Initialize button settings - always set values even if no presets exist
        const buttonDefaults = hasPresets && presets.buttonDefaults ? presets.buttonDefaults : null;
        const padding = buttonDefaults && buttonDefaults.padding ? 
            buttonDefaults.padding.match(/(\d+)px\s+(\d+)px\s+(\d+)px\s+(\d+)px/) : null;
            
        setButtonSettings({
            backgroundColor: buttonDefaults ? buttonDefaults.backgroundColor || '#FF635D' : '#FF635D',
            textColor: buttonDefaults ? buttonDefaults.textColor || '#FFFFFF' : '#FFFFFF',
            paddingTop: padding ? padding[1] : '10',
            paddingRight: padding ? padding[2] : '20',
            paddingBottom: padding ? padding[3] : '10',
            paddingLeft: padding ? padding[4] : '20',
            borderRadius: buttonDefaults && buttonDefaults.borderRadius ? 
                buttonDefaults.borderRadius.replace('px', '') : '8',
            fontSize: buttonDefaults && buttonDefaults.fontSize ? 
                buttonDefaults.fontSize.replace('px', '') : '16',
            buttonText: buttonDefaults ? buttonDefaults.text || 'Read More' : 'Read More',
            isAutoWidth: buttonDefaults ? buttonDefaults.width === 'auto' : true,
            width: buttonDefaults && buttonDefaults.width && buttonDefaults.width !== 'auto' ? 
                buttonDefaults.width.replace('px', '') : '150'
        });
        
        // Initialize footer settings - always set values even if no presets exist
        const footerDefaults = hasPresets && presets.footerSettings ? presets.footerSettings : null;
        setFooterSettings({
            includeUnsubscribe: true,
            unsubscribeText: footerDefaults ? footerDefaults.unsubscribeText || 'Click here to unsubscribe' : 'Click here to unsubscribe',
            companyAddress: footerDefaults ? footerDefaults.companyAddress || '' : '',
            legalText: footerDefaults ? footerDefaults.legalText || '' : ''
        });
        
        // Initialize social links - always set values even if no presets exist
        if (hasPresets && presets.socialLinks && presets.socialLinks.length > 0) {
            logDebug("Setting social links from account presets", presets.socialLinks);
            setSocialLinks(presets.socialLinks.map((link, index) => ({
                id: Date.now() + index,
                platform: link.platform,
                url: link.url
            })));
        } else {
            // Default social links if none in presets
            setSocialLinks([
                { id: Date.now(), platform: 'Facebook', url: 'https://facebook.com/' },
                { id: Date.now() + 1, platform: 'Twitter', url: 'https://twitter.com/' },
                { id: Date.now() + 2, platform: 'Instagram', url: 'https://instagram.com/' }
            ]);
        }
        
        // Mark as initialized
        initialized.current = true;
        
        // Force a re-render to ensure UI updates
        setRenderKey(Date.now());
    }, [account, containerSettings, buttonSettings, footerSettings, socialLinks]);
    
    // Monitor for navigation events and force re-initialization
    useEffect(() => {
        if (location.pathname.includes('/settings/presets')) {
            logDebug("Navigation to presets page detected, refreshing state");
            initialized.current = false; // Reset initialization flag
            setRenderKey(Date.now());
        }
    }, [location.pathname]);
    
    // Handle saving settings
    const handleSaveSettings = async () => {
        // Ensure all required state is initialized
        if (!containerSettings || !buttonSettings || !footerSettings || !socialLinks) {
            logDebug("Cannot save - some state is not initialized");
            createNotification({
                message: 'Cannot save settings - data not fully loaded. Please try again.',
                type: 'warning',
                autoClose: 3000
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Create a minimal data structure with just the presets
            const presets = {
                styles: {
                    color: containerSettings.textColor || '#000000',
                    backgroundColor: containerSettings.backgroundColor || '#FFF8EF',
                    linkColor: containerSettings.linksColor || '#FF635D',
                    fontFamily: containerSettings.font || 'Inter',
                    backgroundImage: containerSettings.backgroundImage ? `url('${containerSettings.backgroundImage}')` : '',
                },
                contentWidth: `${containerSettings.width || 600}px`,
                preHeader: '',
                buttonDefaults: {
                    backgroundColor: buttonSettings.backgroundColor || '#FF635D',
                    textColor: buttonSettings.textColor || '#FFFFFF',
                    padding: `${buttonSettings.paddingTop}px ${buttonSettings.paddingRight}px ${buttonSettings.paddingBottom}px ${buttonSettings.paddingLeft}px`,
                    borderRadius: `${buttonSettings.borderRadius}px`,
                    fontSize: `${buttonSettings.fontSize}px`,
                    text: buttonSettings.buttonText || 'Read More',
                    width: buttonSettings.isAutoWidth ? 'auto' : `${buttonSettings.width}px`
                },
                footerSettings: {
                    unsubscribeText: footerSettings.unsubscribeText || 'Click here to unsubscribe',
                    companyAddress: footerSettings.companyAddress || '',
                    legalText: footerSettings.legalText || ''
                },
                socialLinks: socialLinks.map(link => ({
                    platform: link.platform,
                    url: link.url
                }))
            };
            
            logDebug("Saving presets data to server", presets);
            
            // API call to save presets
            const response = await ApiService.post(
                'fairymailer/updateAccountPresets', 
                { presets }, 
                user.jwt
            );
            
            logDebug("Server response", response.data);
            
            if (response.data) {
                // Update the account in context with the new presets
                if (account) {
                    logDebug("Updating account context");
                    
                    // Create updated account with new presets
                    const updatedAccount = { 
                        ...account,
                        custom_component: {
                            ...(account.custom_component || {}),
                            presets: presets
                        }
                    };
                    
                    // Update the context
                    setAccount(updatedAccount);
                    
                    // Also save to localStorage for persistence
                    try {
                        // Get current account data
                        const currentAccountData = User.getSelectedAccount() || {};
                        
                        // Update with new presets
                        const updatedLocalAccount = {
                            ...currentAccountData,
                            custom_component: {
                                ...(currentAccountData.custom_component || {}),
                                presets: presets
                            }
                        };
                        
                        // Save back to localStorage
                        User.setSelectedAccount(updatedLocalAccount);
                        logDebug("Updated account in localStorage");
                    } catch (err) {
                        logDebug("Failed to update localStorage", err);
                    }
                }
                
                // Force refresh of component state
                initialized.current = false; // Reset initialization to force reload
                setRenderKey(Date.now());
                
                createNotification({
                    message: 'Campaign presets saved successfully! Changes will be visible immediately.',
                    type: 'default',
                    autoClose: 3000
                });
            } else {
                logDebug("Save failed - unexpected response", response);
                createNotification({
                    message: 'Failed to save campaign presets. Please try again.',
                    type: 'warning',
                    autoClose: 5000
                });
            }
        } catch (error) {
            logDebug("Error saving presets", error);
            createNotification({
                message: 'Error saving campaign presets. Please try again.',
                type: 'warning',
                autoClose: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        // Use renderKey to force re-render when data changes
        <div className="campaign-presets-minimal" key={renderKey}>
            {/* Loading indicator */}
            {(!containerSettings || !buttonSettings || !footerSettings || !socialLinks) ? (
                <div className="loading-state">
                    <p>Loading presets data...</p>
                </div>
            ) : (
                <>
                    {/* Container Settings */}
                    <div className="settings-section">
                        <h3 className="section-title">Container Settings</h3>
                        
                        <div className="section-subheading">Colors</div>
                        <div className="color-picker-row">
                            <div className="color-picker-column">
                                <div className="setting-label">Background Color (Theme)</div>
                                <ColorPicker
                                    initColorHex={containerSettings.backgroundColor}
                                    initColorAlpha={parseInt(containerSettings.opacity) / 100}
                                    onChange={handleBackgroundColorChange}
                                />
                            </div>
                            
                            <div className="color-picker-column">
                                <div className="setting-label">Text Color</div>
                                <ColorPicker
                                    initColorHex={containerSettings.textColor}
                                    initColorAlpha={1}
                                    onChange={handleTextColorChange}
                                />
                            </div>
                            
                            <div className="color-picker-column">
                                <div className="setting-label">Links Color</div>
                                <ColorPicker
                                    initColorHex={containerSettings.linksColor}
                                    initColorAlpha={1}
                                    onChange={handleLinksColorChange}
                                />
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
                                    <ColorPicker
                                        initColorHex={buttonSettings.backgroundColor}
                                        initColorAlpha={1}
                                        onChange={handleButtonBgColorChange}
                                    />
                                </div>
                                
                                <div className="input-column">
                                    <div className="setting-label">Text Color</div>
                                    <ColorPicker
                                        initColorHex={buttonSettings.textColor}
                                        initColorAlpha={1}
                                        onChange={handleButtonTextColorChange}
                                    />
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
                </>
            )}
        </div>
    );
};

export default CampaignPresets;