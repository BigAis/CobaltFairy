import React, { useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Dropdown from '../../components/Dropdown'
import { useAccount } from '../../context/AccountContext'

const InvoiceDetails = () => {
    const { user, account } = useAccount()
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        country: '',
        vatId: '',
        companyName: '',
        emailRecipients: ''
    });

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSaveChanges = () => {
        console.log('Saving form data:', formData);
        // Here you would typically send this data to your API
    };

    // Country options
    const countryOptions = [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'au', label: 'Australia' },
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' }
    ];

    return (
        <Card className="invoice-details-card">
            <h3>Contact Settings</h3>
            <div className="invoice-form">
                <div className="form-row">
                    <InputText 
                        label="First Name" 
                        placeholder="First Name" 
                        value={formData.firstName} 
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                    <InputText 
                        label="Last Name" 
                        placeholder="Last Name" 
                        value={formData.lastName} 
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                </div>
                
                <div className="form-row">
                    <InputText 
                        label="Address 1" 
                        placeholder="Address 1" 
                        value={formData.address1} 
                        onChange={(e) => handleInputChange('address1', e.target.value)}
                    />
                    <InputText 
                        label="Address 2" 
                        placeholder="Address 2" 
                        value={formData.address2} 
                        onChange={(e) => handleInputChange('address2', e.target.value)}
                    />
                </div>
                
                <div className="form-row">
                    <InputText 
                        label="City" 
                        placeholder="City" 
                        value={formData.city} 
                        onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                    <div className="dropdown-field-wrapper">
                        <label>Country</label>
                        <Dropdown 
                            options={countryOptions}
                            selectedValue={formData.country ? { value: formData.country, label: countryOptions.find(c => c.value === formData.country)?.label || '' } : null}
                            onOptionSelect={(option) => handleInputChange('country', option.value)}
                            className="country-dropdown"
                        >
                            Country
                        </Dropdown>
                    </div>
                </div>
                
                <div className="form-row">
                    <InputText 
                        label="VAT ID" 
                        placeholder="VAT ID" 
                        value={formData.vatId} 
                        onChange={(e) => handleInputChange('vatId', e.target.value)}
                    />
                    <InputText 
                        label="Company Name" 
                        placeholder="Company Name" 
                        value={formData.companyName} 
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                </div>
                
                <InputText 
                    label="Invoice Email Recipients" 
                    placeholder="Add email addresses..." 
                    value={formData.emailRecipients} 
                    onChange={(e) => handleInputChange('emailRecipients', e.target.value)}
                />
                
                <div className="form-actions">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </div>
        </Card>
    )
}

export default InvoiceDetails