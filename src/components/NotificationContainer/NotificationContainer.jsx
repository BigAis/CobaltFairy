import React from 'react'
import { useAccount } from '../../context/AccountContext'
import NotificationBar from '../NotificationBar/NotificationBar'
import './NotificationContainer.scss'

const NotificationContainer = () => {
  const { notifications, dismissNotification } = useAccount()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationBar
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => dismissNotification(notification.id)}
          autoClose={notification.autoClose}
        />
      ))}
    </div>
  )
}

export default NotificationContainer