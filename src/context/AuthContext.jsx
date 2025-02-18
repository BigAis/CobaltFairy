import { createContext, useContext, useEffect, useState } from 'react'
import { isUserLoggedIn } from '../../service/api-service'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const checkAuth = () => {
		setIsAuthenticated(isUserLoggedIn())
	}

	useEffect(() => {
		checkAuth()
	}, [])

	return <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
