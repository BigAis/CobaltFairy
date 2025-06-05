import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon/Icon';
import './GoBackButton.scss';

const GoBackButton = ({ onClick, destination, lastTab }) => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    if (onClick) {
      // Use custom callback if provided
      onClick();
    } else if (destination) {
      // Navigate to specific destination if provided
      navigate(destination);
    } else if (lastTab) {
      // Navigate to last active tab if available
      const lastActiveTab = localStorage.getItem('fairymail_last_active_tab') || 'sent';
      navigate(`/campaigns/${lastActiveTab}`);
    } else {
      // Default behavior - go back in history
      navigate(-1);
    }
  };
  
  return (
    <div className='go-back-button' onClick={handleGoBack}>
      <Icon name="Caret" />
      Go back
    </div>
  );
};

export default GoBackButton;