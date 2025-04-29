import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import InputText from '../../components/InputText/InputText';
import { ApiService } from '../../service/api-service';
import User from '../../service/User';
import PopupText from '../../components/PopupText/PopupText';
import './AddSubscriber.scss';

const AddSubscriber = ({ groups = [], onSubscriberAdded = () => {}, customFields = [] }) => {
  const [subscriber, setSubscriber] = useState({
    email: '',
    name: '',
    customFields: []
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // If we only have one group, auto-select it
  useEffect(() => {
    if (groups && groups.length === 1 && !selectedGroup) {
      setSelectedGroup({
        value: groups[0].udid,
        label: groups[0].name
      });
    }
  }, [groups, selectedGroup]);
  
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleInputChange = (field, value) => {
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setSubscriber(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCustomFieldChange = (fieldUuid, value) => {
    setSubscriber(prev => {
      const updatedCustomFields = [...prev.customFields];
      const existingIndex = updatedCustomFields.findIndex(field => field.uuid === fieldUuid);
      
      if (existingIndex !== -1) {
        updatedCustomFields[existingIndex] = { ...updatedCustomFields[existingIndex], value };
      } else {
        updatedCustomFields.push({ uuid: fieldUuid, value });
      }
      
      return {
        ...prev,
        customFields: updatedCustomFields
      };
    });
  };
  
  const handleGroupSelect = (option) => {
    setSelectedGroup(option);
    if (validationErrors.group) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.group;
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!subscriber.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(subscriber.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!selectedGroup) {
      errors.group = 'Please select a group';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const clearForm = () => {
    setSubscriber({
      email: '',
      name: '',
      customFields: []
    });
    setValidationErrors({});
    
    // Don't reset the group if there's only one
    if (groups.length > 1) {
      setSelectedGroup(null);
    }
  };
  
  const addSubscriber = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const userData = User.get();
      if (!userData || !userData.jwt) {
        throw new Error("Authentication required");
      }
      
      // Create subscriber
      const subscriberData = {
        email: subscriber.email,
        name: subscriber.name || '',
        active: true,
        fields: subscriber.customFields || []
      };
      
      console.log('Creating subscriber with data:', subscriberData);
      
      // Strapi uses a different data structure for POST requests
      const createResponse = await ApiService.post(
        'subscribers', 
        { 
          data: subscriberData
        },
        userData.jwt
      );
      
      console.log('Subscriber creation response:', createResponse);
      
      // Check if response has the expected format from Strapi
      let subscriberId;
      if (createResponse?.data?.data?.id) {
        // New Strapi format
        subscriberId = createResponse.data.data.id;
      } else if (createResponse?.data?.id) {
        // Old format
        subscriberId = createResponse.data.id;
      } else {
        console.error('Unexpected response format:', createResponse);
        throw new Error('Failed to extract subscriber ID from response');
      }
      
      console.log('Extracted subscriber ID:', subscriberId);
      
      // Find the selected group
      const selectedGroupObj = groups.find(g => g.udid === selectedGroup.value);
      if (!selectedGroupObj) {
        throw new Error('Selected group not found');
      }
      
      console.log('Found group:', selectedGroupObj);
      
      // Try different payload formats for the PUT request
      const formats = [
        // Format 1: Strapi connect format
        {
          data: {
            subscribers: {
              connect: [subscriberId]
            }
          }
        },
        // Format 2: Direct array format
        {
          data: {
            subscribers: [subscriberId]
          }
        },
        // Format 3: Simple array append format
        {
          subscribers: [subscriberId]
        }
      ];
      
      let success = false;
      let lastError = null;
      
      // Try each format until one works
      for (const format of formats) {
        try {
          console.log(`Trying group update with format:`, format);
          
          const updateResponse = await ApiService.put(
            'groups/' + selectedGroupObj.id, 
            format,
            userData.jwt
          );
          
          console.log('Group update successful with format:', format, updateResponse);
          success = true;
          
          PopupText.fire({
            text: 'Subscriber added successfully!',
            icon: 'success'
          });
          
          clearForm();
          onSubscriberAdded();
          break; // Exit loop on success
        } catch (error) {
          console.warn(`Group update failed with format:`, format, error);
          lastError = error;
        }
      }
      
      // If all formats failed
      if (!success) {
        console.error('All group update formats failed, last error:', lastError);
        
        // Show partial success since subscriber was created but not added to group
        PopupText.fire({
          text: 'Subscriber created, but could not be added to group. Please try again or add them to the group manually.',
          icon: 'warning'
        });
        
        clearForm();
        onSubscriberAdded();
      }
    } catch (error) {
      console.error('Error in add subscriber process:', error);
      
      let errorMessage = 'Failed to add subscriber';
      
      // Handle duplicate email error
      if (error.response?.data?.message?.includes('duplicate') || 
          error.response?.data?.error?.includes('duplicate') ||
          error.message?.includes('duplicate')) {
        errorMessage = 'This email address is already subscribed';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      PopupText.fire({
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Make sure we have valid groups
  const groupOptions = Array.isArray(groups) 
    ? groups.map(group => ({
        value: group.udid,
        label: group.name
      }))
    : [];
  
  const renderCustomFields = () => {
    if (!customFields || customFields.length === 0) return null;
    
    return (
      <div className="custom-fields-section">
        <h4>Custom Fields</h4>
        <div className="custom-fields-container">
          {customFields.map(field => {
            if (!field || !field.uuid) return null; // Skip invalid fields
            
            const fieldValue = subscriber.customFields.find(f => f.uuid === field.uuid)?.value || '';
            
            if (field.type && field.type.toLowerCase() === 'date') {
              return (
                <InputText
                  key={field.uuid}
                  label={field.name || 'Date Field'}
                  value={fieldValue}
                  placeholder="YYYY-MM-DD"
                  onChange={(e) => handleCustomFieldChange(field.uuid, e.target.value)}
                />
              );
            } else {
              return (
                <InputText
                  key={field.uuid}
                  label={field.name || 'Custom Field'}
                  value={fieldValue}
                  onChange={(e) => handleCustomFieldChange(field.uuid, e.target.value)}
                />
              );
            }
          })}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="add-subscriber-card">
      <h3>Add Subscriber</h3>
      
      <div className="add-subscriber-form">
        <InputText
          label="Email Address *"
          value={subscriber.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          hasError={!!validationErrors.email}
          errorMessage={validationErrors.email}
          isRequired={true}
          placeholder="example@email.com"
        />
        
        <InputText
          label="Name"
          value={subscriber.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Full name (optional)"
        />
        
        <div className="form-group">
          <label>Group *</label>
          <Dropdown
            options={groupOptions}
            selectedValue={selectedGroup}
            onOptionSelect={handleGroupSelect}
            hasError={!!validationErrors.group}
          >
            {groupOptions.length > 0 ? 'Select Group' : 'No groups available'}
          </Dropdown>
          {validationErrors.group && <div className="error-message">{validationErrors.group}</div>}
        </div>
        
        {renderCustomFields()}
        
        <div className="submit-container">
          <Button 
            onClick={addSubscriber} 
            disabled={isSubmitting || groupOptions.length === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Subscriber'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AddSubscriber;