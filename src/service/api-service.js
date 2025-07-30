import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
const APP_VERSION = '0.6.2'
// const BASE_URL = 'https://fairymail.cobaltfairy.com/api'
const BASE_URL = 'http://localhost:1337/api'

export const checkUserExists = async (useremail) => {
	try {
		const response = await axios.post(`${BASE_URL}/check-user-exists`, { email: useremail, })
		return response.data.exists
	} catch (error) {
		console.error("Error checking if user exists:", error)
		return false
	}
}

export const checkUserCrendentials = async (useremail, password, reCaptchaToken) => {
	try {
		const data = await axios.post(`${BASE_URL}/auth/local`, {
			identifier: useremail,
			password: password,
			authentication: reCaptchaToken,
		})

		saveDataToLocalStorage(data)
		return true
	} catch (error) {
		console.error("Error checking user credentials:", error)
		return false
	}
}

export const registerUser = async (user, reCaptchaToken, googleSignInToken) => {
	const requestBody = {
		email: user.email,
		accountName: user.accountName,
		firstName: user.firstName,
		lastName: user.lastName,
		newsletter: user.sendNews,
		authentication: reCaptchaToken,
	}

	if (googleSignInToken != null) {
		requestBody.access_token = googleSignInToken
	} else {
		requestBody.password = user.password
	}

	try {
		const response = await axios.post(`${BASE_URL}/register-user`, requestBody)

		saveDataToLocalStorage(response)

		console.log(response)
		return true
	} catch (error) {
		console.error("Error registering user:", error)
		return false
	}
}

const saveDataToLocalStorage = (response) => {
	const dataToStore = {
		jwt: response.data.jwt,
		user: response.data.user,
	}

	const serialized = encodeURIComponent(JSON.stringify(dataToStore))
	localStorage.setItem('fairymail_session', serialized)

	console.log("Session data saved to localStorage")
}

const unserializeLocalStorage = () => {
	try {
		const serialized = localStorage.getItem('fairymail_session')
		if (!serialized) {
			console.error("No session data found in localStorage")
			return null
		}
		return JSON.parse(decodeURIComponent(serialized))
	} catch (error) {
		console.error("Error unserializing localStorage:", error)
		return null
	}
}

export const generate2FA = async () => {
	const fairymail_session = unserializeLocalStorage()
	if (!fairymail_session || !fairymail_session.jwt) {
		throw new Error("No valid session found")
	}
	
	const jtwToken = fairymail_session.jwt
	try {
		const response = await axios.post(
			`${BASE_URL}/generate-2fa`,
			{},
			{
				headers: {
					Authorization: `Bearer ${jtwToken}`,
				},
			}
		)
		return response
	} catch (error) {
		console.error("Error generating 2FA:", error)
		throw new Error('Error during 2FA generation request')
	}
}

export const verify2FA = async (code_2FA) => {
	const fairymail_session = unserializeLocalStorage();
	if (!fairymail_session || !fairymail_session.jwt) {
		throw new Error("No valid session found")
	}
	
	const jtwToken = fairymail_session.jwt;
	try {
		const response = await axios.post(
			`${BASE_URL}/verify-2fa`,
			{
				confirmationToken: code_2FA,
			},
			{
				headers: {
					Authorization: `Bearer ${jtwToken}`,
				},
			}
		);
		
		// IMPORTANT: Check if the response contains updated token data
		// If so, update the local storage with the new session data
		if (response.data && response.data.jwt) {
			const updatedSession = {
				jwt: response.data.jwt,
				user: response.data.user || fairymail_session.user
			};
			
			// Update localStorage with the new session
			localStorage.setItem('fairymail_session', encodeURIComponent(JSON.stringify(updatedSession)));
			console.log('Updated session after 2FA verification');
		}
		
		return response.data;
	} catch (error) {
		console.error('Error during 2FA verification:', error);
		throw new Error('Error during request: ' + (error.response?.data?.message || error.message));
	}
};

export const forgotPassword = async (email) => {
	try {
		const response = await axios.post(`${BASE_URL}/forgot-password`, {
			identifier: email,
		})
		return true
	} catch (error) {
		console.error("Error requesting password reset:", error)
		return false
	}
}

export const googleLogIn = async (googleAccessToken) => {
	try {
		const response = await axios.post(`${BASE_URL}/google-signin`, {
			access_token: googleAccessToken.access_token,
		})

		if (response.data.code == 200) saveDataToLocalStorage(response)

		return response
	} catch (error) {
		console.error("Error during Google sign in:", error)
		throw error
	}
}

export const getPaymentPlans = async () => {
	try {
		const response = await axios.get(`${BASE_URL}/payment-plans`)
		return response.data
	} catch (error) {
		console.error("Error fetching payment plans:", error)
		throw error
	}
}

export const isJwtTokenExpired = (jwtToken) => {
	if (!jwtToken) return true

	try {
		const decodedToken = jwtDecode(jwtToken)
		const currentTime = Date.now() / 1000
		return decodedToken.exp < currentTime
	} catch (error) {
		console.error('Error decoding token:', error)
		return true
	}
}

export const isUserLoggedIn = () => {
	const fairymail_session = localStorage.getItem('fairymail_session')

	if (!fairymail_session) {
		return false
	}

	try {
		const userData = JSON.parse(decodeURIComponent(fairymail_session))
		return userData && userData.jwt && !isJwtTokenExpired(userData.jwt)
	} catch (error) {
		console.error("Error checking if user is logged in:", error)
		return false
	}
}

// Helper function to get session data
export const getSessionData = () => {
    try {
        const fairymail_session = localStorage.getItem('fairymail_session');
        if (!fairymail_session) {
            return null;
        }
        return JSON.parse(decodeURIComponent(fairymail_session));
    } catch (error) {
        console.error("Error getting session data:", error);
        return null;
    }
}

// Add a subscriber with new endpoint
export const insertSubscriber = async (subscriberData) => {
    try {
        const userData = getSessionData();
        if (!userData || !userData.jwt) {
            throw new Error("Authentication required");
        }

        const response = await axios.post(
            `${BASE_URL}/fairymailer/insert-subscriber`,
            subscriberData,
            {
                headers: {
                    Authorization: 'Bearer ' + userData.jwt,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response;
    } catch (error) {
        console.error("Error adding subscriber:", error);
        throw error;
    }
}

// Get account setup status
export const getAccountSetupStatus = async (jwt) => {
    try {
        const response = await axios.get(`${BASE_URL}/fairymailer/account-setup-status`, {
            headers: {
                Authorization: 'Bearer ' + jwt,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error checking account setup status:", error);
        throw error;
    }
}

// Update account setup status
export const updateAccountSetupStatus = async (setupData, jwt) => {
    try {
        const response = await axios.post(`${BASE_URL}/fairymailer/update-account-setup`, setupData, {
            headers: {
                Authorization: 'Bearer ' + jwt,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating account setup status:", error);
        throw error;
    }
}

const ApiService = {
	get_external: (endpoint) => {
		const url = `${endpoint}`
		return axios.get(url)
	},
	post_external: (endpoint, data, headers = {}) => {
		const url = `${endpoint}`
		console.log(`Making external POST request to: ${url}`)
		
		return axios.post(url, data, {
		  headers: headers.headers || {},
		})
		.then(response => {
		  console.log(`Successful response from external endpoint:`, response.status)
		  return response
		})
		.catch(error => {
		  console.error(`Error in external POST request:`, error.response || error)
		  throw error
		})
	  },
	get: (endpoint, jwt) => {
		const url = `${BASE_URL}/${endpoint}`
		console.log(`Making GET request to: ${url}`)
		
		return axios.get(url, {
			headers: {
				Authorization: 'Bearer ' + jwt,
			},
		})
		.then(response => {
			console.log(`Successful response from ${endpoint}:`, response.status)
			return response
		})
		.catch(error => {
			console.error(`Error in GET request to ${endpoint}:`, error.response || error)
			
			// Check for specific error types
			if (error.response) {
				console.error(`Status: ${error.response.status}, Data:`, error.response.data)
				
				// Handle 401 Unauthorized errors (session might be invalid)
				if (error.response.status === 401) {
					console.error('Authentication error - JWT might be invalid or expired')
				}
			} else if (error.request) {
				console.error('No response received from server')
			} else {
				console.error('Error setting up the request:', error.message)
			}
			
			throw error
		})
	},
	post: (endpoint, data, jwt, headers = null) => {
		const url = `${BASE_URL}/${endpoint}`
		console.log(`Making POST request to: ${url}`)
		
		// Custom headers object handling
		const requestHeaders = headers || {
			Authorization: 'Bearer ' + jwt,
			'Content-Type': 'application/json'
		};
		
		// If we're dealing with FormData, let the browser set the content type
		if (data instanceof FormData) {
			delete requestHeaders['Content-Type'];
		}
		
		return axios.post(url, data, {
			headers: requestHeaders,
		})
		.then(response => {
			console.log(`Successful response from ${endpoint}:`, response.status)
			return response
		})
		.catch(error => {
			console.error(`Error in POST request to ${endpoint}:`, error.response || error)
			throw error
		})
	},
	put: (endpoint, data, jwt) => {
		const url = `${BASE_URL}/${endpoint}`
		console.log(`Making PUT request to: ${url}`)
		
		return axios.put(url, data, {
			headers: {
				Authorization: 'Bearer ' + jwt,
				'Content-Type': 'application/json'
			},
		})
		.then(response => {
			console.log(`Successful response from ${endpoint}:`, response.status)
			return response
		})
		.catch(error => {
			console.error(`Error in PUT request to ${endpoint}:`, error.response || error)
			throw error
		})
	},
	login: (credentials) => {
		credentials.identifier = credentials.username
		const url = `${BASE_URL}/auth/local/`
		console.log(`Making login request to: ${url}`)
		
		return axios.post(url, credentials, {
			headers: {
				'Content-Type': 'application/json',
			},
		})
	},
	delete: (endpoint, jwt) => {
		const url = `${BASE_URL}/${endpoint}`
		return axios.delete(url, {
			headers: {
				Authorization: 'Bearer ' + jwt,
			},
		})
	},

    // Helper method for new subscriber endpoint
    insertSubscriber: (subscriberData) => {
        return insertSubscriber(subscriberData);
    },
    
    // Method to get session data
    getSessionData: () => {
        return getSessionData();
    },
    
    // Account setup methods
    getAccountSetupStatus: (jwt) => {
        return getAccountSetupStatus(jwt);
    },
    
    updateAccountSetupStatus: (setupData, jwt) => {
        return updateAccountSetupStatus(setupData, jwt);
    }
}

export { ApiService, BASE_URL, APP_VERSION }