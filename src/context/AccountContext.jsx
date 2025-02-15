import { createContext, useState, useEffect, useContext } from 'react'
import { useUser } from './UserContext'
import { ApiService } from '../service/api-service'

const AccountContext = createContext()

export const useAccount = () => useContext(AccountContext)

export const AccountProvider = ({ children }) => {
	const { user } = useUser()
	const [account, setAccount] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!user || !user.jwt) return
		const getAccount = async () => {
			try {
				const account = (await ApiService.get(`fairymailer/getAccount`, user.jwt)).data.user.account
				setAccount(account)
			} catch (error) {
				setError(error)
			} finally {
				setLoading(false)
			}
		}

		getAccount()
	}, [user])

	return <AccountContext.Provider value={{ user, account, loading, error }}>{children}</AccountContext.Provider>
}
