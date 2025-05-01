import React from 'react'
import { useAccount } from '../../context/AccountContext'
import NotificationBar from '../NotificationBar/NotificationBar'
import './NotificationContainer.scss'
import Button from '../Button'
import Icon from '../Icon/Icon'

const NotificationContainer = () => {
  const { notifications, dismissNotification, clearAllNotifications } = useAccount()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="notification-container">
      <div className="notification-controls">
        <Button 
          type="secondary" 
          className="clear-all-btn"
          onClick={clearAllNotifications}
        >
          Clear All
        </Button>
      </div>
      
      {notifications.map((notification) => (
        <NotificationBar
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => dismissNotification(notification.id)}
          autoClose={notification.autoClose}
          count={notification.count > 1 ? notification.count : null}
        />
      ))}
    </div>
  )
}

export default NotificationContainer