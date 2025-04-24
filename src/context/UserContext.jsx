import { createContext, useState, useEffect, useContext } from 'react'
import User from '../service/User'

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const getUser = async () => {
			setLoading(true) // Ensure loading is true
			try {
				const userData = User.get()
				setUser(userData)
			} catch (error) {
				console.error('Error loading user data:', error)
				setError(error)
			} finally {
				setLoading(false)
			}
		}

		getUser()
	}, [])

	return <UserContext.Provider value={{ user, loading: loading, userLoading: loading, error }}>{children}</UserContext.Provider>
}