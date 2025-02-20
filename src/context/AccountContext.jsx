import { createContext, useState, useEffect, useContext } from 'react'
import { useUser } from './UserContext'
import { ApiService } from '../service/api-service'
import User  from '../service/User'

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
				let resp = (await ApiService.get(`fairymailer/getAccount`, user.jwt))
				console.log('respppp',resp.data)
				User.setAccounts(resp.data.user.accounts)
				const account = resp.data.user.account
				account.payment_plan = resp.data.account.payment_plan
				console.log('set account',account)
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
