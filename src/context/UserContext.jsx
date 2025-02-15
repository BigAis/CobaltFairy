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
			try {
				const user = User.get()
				// console.log('user from the context is : ', user)
				setUser(user)
			} catch (error) {
				setError(error)
			} finally {
				setLoading(false)
			}
		}

		getUser()
	}, [])

	return <UserContext.Provider value={{ user, loading, error }}>{children}</UserContext.Provider>
}
