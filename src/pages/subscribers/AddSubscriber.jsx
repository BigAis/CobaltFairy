import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import InputText from '../../components/InputText/InputText';
import { ApiService } from '../../service/api-service';
import User from '../../service/User';
import PopupText from '../../components/PopupText/PopupText';
import './AddSubscriber.scss';

const AddSubscriber = ({ groups = [], onSubscriberAdded = () => {} }) => {
  const [subscriber, setSubscriber] = useState({
    email: '',
    name: ''
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [runAutomations, setRunAutomations] = useState(false);
  
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
      name: ''
    });
    setValidationErrors({});
    setRunAutomations(false);
    
    // Don't reset the group if there's only one
    if (groups.length > 1) {
      setSelectedGroup(null);
    }
  };
  
  const addSubscriber = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const userData = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')));
      if (!userData || !userData.jwt) {
        throw new Error("Authentication required");
      }
      
      if (!selectedGroup || !selectedGroup.value) {
        throw new Error("Group selection required");
      }
      
      // Create the request payload according to the new format
      const requestPayload = {
        name: subscriber.name || '',
        email: subscriber.email,
        group: selectedGroup.value, // Using the UDID directly
        automations: runAutomations
      };
      
      console.log('Adding subscriber with payload:', requestPayload);
      
      // Use the new endpoint
      const response = await ApiService.post(
        'fairymailer/insert-subscriber',
        requestPayload,
        userData.jwt
      );
      
      console.log('Subscriber addition response:', response);
      
      // Check for success
      if (response.data && (response.data.code === 200 || response.status === 200)) {
        PopupText.fire({
          text: 'Subscriber added successfully!',
          icon: 'success'
        });
        
        clearForm();
        onSubscriberAdded();
      } else {
        throw new Error('Unexpected response from server');
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
        
        <div className="automation-toggle">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={runAutomations}
              onChange={() => setRunAutomations(!runAutomations)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">Run automations for this subscriber</span>
        </div>
        
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