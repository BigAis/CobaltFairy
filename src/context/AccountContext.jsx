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
		  
		  // 5. Add debug code to help identify API issues in the ApiService.get method
		  
		  get: (endpoint, jwt) => {
			const url = `${BASE_URL}/${endpoint}`;
			console.log(`Making GET request to: ${url}`);
			
			return axios.get(url, {
			  headers: {
				Authorization: 'Bearer ' + jwt,
			  },
			})
			.then(response => {
			  console.log(`Successful response from ${endpoint}:`, response.status);
			  return response;
			})
			.catch(error => {
			  console.error(`Error in GET request to ${endpoint}:`, error.response || error);
			  
			  // Check for specific error types
			  if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.error(`Status: ${error.response.status}, Data:`, error.response.data);
				
				// Handle 401 Unauthorized errors (session might be invalid)
				if (error.response.status === 401) {
				  console.error('Authentication error - JWT might be invalid or expired');
				}
			  } else if (error.request) {
				// The request was made but no response was received
				console.error('No response received from server');
			  } else {
				// Something happened in setting up the request that triggered an Error
				console.error('Error setting up the request:', error.message);
			  }
			  
			  throw error;
			});
		  },
		getAccount()
	}, [user, userLoading]) // Add userLoading as dependency

	return <AccountContext.Provider value={{ user, account, loading, error, dataInitialized, setAccount }}>{children}</AccountContext.Provider>
}