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

	useEffect(() => {
		// Only try to load account data if user is loaded and has JWT
		if (userLoading || !user || !user.jwt) return

		const getAccount = async () => {
			setLoading(true); // Ensure loading is true while fetching
			
			let retries = 0;
			const maxRetries = 3;
			
			const attemptGetAccount = async () => {
			  try {
				console.log(`Fetching account data... (attempt ${retries + 1}/${maxRetries})`);
				let resp = await ApiService.get(`fairymailer/getAccount`, user.jwt);
				
				if (!resp.data || !resp.data.user) {
				  throw new Error('Invalid account data response');
				}
				
				User.setAccounts(resp.data.user.accounts);
				const account = resp.data.user.account;
				account.payment_plan = resp.data.account.payment_plan;
				setAccount(account);
				setDataInitialized(true); // Mark data as initialized
				return true; // Success
			  } catch (error) {
				console.error(`Error fetching account data (attempt ${retries + 1}/${maxRetries}):`, error);
				retries++;
				
				if (retries < maxRetries) {
				  console.log(`Retrying in 1 second... (${retries}/${maxRetries})`);
				  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
				  return await attemptGetAccount(); // Recursively retry
				}
				
				setError(error);
				return false; // Failed after max retries
			  }
			};
			
			await attemptGetAccount();
			setLoading(false);
		};
		
		getAccount();
	}, [user, userLoading]); // Add userLoading as dependency

	return <AccountContext.Provider value={{ user, account, loading, error, dataInitialized, setAccount }}>{children}</AccountContext.Provider>
}