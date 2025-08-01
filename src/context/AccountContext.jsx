import { createContext, useState, useEffect, useContext } from 'react'
import { useUser } from './UserContext'
import { ApiService } from '../service/api-service'
import User from '../service/User'

const AccountContext = createContext()

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }) => {
	const { user, userLoading } = useUser() // Get userLoading state
	const [account, setAccount] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [dataInitialized, setDataInitialized] = useState(false) // Add initialization flag

	// Enhanced notification system state and handlers
	const [notifications, setNotifications] = useState([])
	const [notificationQueue, setNotificationQueue] = useState([])
	const MAX_VISIBLE_NOTIFICATIONS = 3

	// Generate a random ID for notifications
	const generateRandomId = (length = 8) => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let result = ''
		const charactersLength = characters.length
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength))
		}
		return result
	}

	// Process the notification queue
	useEffect(() => {
		// If we have space for more notifications and there are items in the queue
		if (notifications.length < MAX_VISIBLE_NOTIFICATIONS && notificationQueue.length > 0) {
			// Move the first item from queue to active notifications
			const nextNotification = notificationQueue[0]
			setNotifications((prev) => [...prev, nextNotification])
			setNotificationQueue((prev) => prev.slice(1))
		}
	}, [notifications, notificationQueue])

	// Create a new notification
	const createNotification = (notificationData) => {
		const id = generateRandomId()
		const notification = {
			id,
			type: notificationData.type || 'default',
			message: notificationData.message,
			autoClose: notificationData.autoClose || -1,
			count: 1, // Initialize count for duplicate tracking
			timestamp: Date.now(),
		}

		// Check if we already have this message in notifications or queue
		const existingNotificationIndex = notifications.findIndex((n) => n.message === notification.message)

		const existingQueuedNotificationIndex = notificationQueue.findIndex((n) => n.message === notification.message)

		if (existingNotificationIndex !== -1) {
			// Update the count of existing notification
			setNotifications((prev) => prev.map((n, index) => (index === existingNotificationIndex ? { ...n, count: n.count + 1, timestamp: Date.now() } : n)))
			return notifications[existingNotificationIndex].id
		} else if (existingQueuedNotificationIndex !== -1) {
			// Update the count of existing queued notification
			setNotificationQueue((prev) => prev.map((n, index) => (index === existingQueuedNotificationIndex ? { ...n, count: n.count + 1, timestamp: Date.now() } : n)))
			return notificationQueue[existingQueuedNotificationIndex].id
		} else if (notifications.length < MAX_VISIBLE_NOTIFICATIONS) {
			// Add as a new notification if we have space
			setNotifications((prev) => [...prev, notification])
			return id
		} else {
			// Queue the notification if we're at max capacity
			setNotificationQueue((prev) => [...prev, notification])
			return id
		}
	}

	// Dismiss a notification by ID
	const dismissNotification = (id) => {
		setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))
	}

	// Clear all notifications
	const clearAllNotifications = () => {
		setNotifications([])
		setNotificationQueue([])
	}

	useEffect(() => {
		// Only try to load account data if user is loaded and has JWT
		if (userLoading || !user || !user.jwt) return

		const getAccount = async () => {
			setLoading(true) // Ensure loading is true while fetching

			let retries = 0
			const maxRetries = 3

			const attemptGetAccount = async () => {
				try {
					console.log(`Fetching account data... (attempt ${retries + 1}/${maxRetries})`)
					let resp = await ApiService.get(`fairymailer/getAccount`, user.jwt)

					console.log('resp from account context', resp)

					if (!resp.data || !resp.data.user) {
						throw new Error('Invalid account data response')
					}

					User.setAccounts(resp.data.user.accounts)
					const account = resp.data.user.account
					account.active_subs = resp.data.account.active_subs
					account.payment_plan = resp.data.account.payment_plan
					//TODO add avatar to user
					user.avatar = resp.data.user.avatar
					account.avatar = resp.data.user.avatar
					setAccount(account)
					setDataInitialized(true) // Mark data as initialized
					return true // Success
				} catch (error) {
					console.error(`Error fetching account data (attempt ${retries + 1}/${maxRetries}):`, error)
					retries++

					if (retries < maxRetries) {
						console.log(`Retrying in 1 second... (${retries}/${maxRetries})`)
						await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
						return await attemptGetAccount() // Recursively retry
					}

					setError(error)
					return false // Failed after max retries
				}
			}

			await attemptGetAccount()
			setLoading(false)
		}

		getAccount()
	}, [user, userLoading]) // Add userLoading as dependency

	return (
		<AccountContext.Provider
			value={{
				user,
				account,
				loading,
				error,
				dataInitialized,
				setAccount,
				// Enhanced notification system
				notifications,
				createNotification,
				dismissNotification,
				clearAllNotifications,
			}}
		>
			{children}
		</AccountContext.Provider>
	)
}
