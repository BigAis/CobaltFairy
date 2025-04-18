import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
const APP_VERSION = '0.3.2'
const BASE_URL = 'https://fairymail.cobaltfairy.com/api'
// const BASE_URL = 'http://localhost:1337/api'
export const checkUserExists = async (useremail) => {
	try {
		const response = await axios.post(`${BASE_URL}/check-user-exists`, { email: useremail, })
		return response.data.exists
	} catch (error) {
		console.error()
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
		console.error()
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

	const unserialized = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')))
}

const unserializeLocalStorage = () => {
	const unserialized = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')))
	return unserialized
}

export const generate2FA = async () => {
	const fairymail_session = unserializeLocalStorage()
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
		throw new Error('Error during  request', error)
	}
}

export const verify2FA = async (code_2FA) => {
	const fairymail_session = unserializeLocalStorage()
	const jtwToken = fairymail_session.jwt
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
		)
		return response.data
	} catch (error) {
		throw new Error('Error during  request', error)
	}
}

export const forgotPassword = async (email) => {
	try {
		const response = await axios.post(`${BASE_URL}/forgot-password`, {
			identifier: email,
		})
		return true
	} catch (error) {
		console.error()
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
		console.error(error)
	}
}

export const getPaymentPlans = async () => {
	try {
		const response = await axios.get(`${BASE_URL}/payment-plans`)
		return response.data
	} catch (error) {
		console.error(error)
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

	if (fairymail_session) {
		const userData = JSON.parse(decodeURIComponent(fairymail_session))
		if (fairymail_session == null) return false

		console.log(fairymail_session)
		if (fairymail_session != null && fairymail_session.length > 0) {
			const userData = JSON.parse(decodeURIComponent(fairymail_session))
			if (userData.jwt && !isJwtTokenExpired(userData.jwt)) return true
		}
	}
}

const ApiService = {
	get_external: (endpoint) => {
		const url = `${endpoint}`
		return axios.get(url)
	},
	post_external: (endpoint, data) => {
		const url = `${endpoint}`
		return axios.post(url, data)
	},
	get: (endpoint, jwt) => {
		const url = `${BASE_URL}/${endpoint}`
		return axios.get(url, {
			headers: {
				Authorization: 'Bearer ' + jwt,
			},
		})
	},
	post: (endpoint, data, jwt, headers = null) => {
		const url = `${BASE_URL}/${endpoint}`
		return axios.post(url, data, {
			headers: headers
				? headers
				: {
						Authorization: 'Bearer ' + jwt,
				  },
		})
	},
	login: (credentials) => {
		credentials.identifier = credentials.username
		const url = `${BASE_URL}/auth/local/`
		console.log(url, credentials)
		return axios.post(url, credentials, {
			headers: {
				'Content-Type': 'application/json',
			},
		})
	},
	put: (endpoint, data, jwt) => {
		const url = `${BASE_URL}/${endpoint}`
		return axios.put(url, data, {
			headers: {
				Authorization: 'Bearer ' + jwt,
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
}

export { ApiService, BASE_URL, APP_VERSION }
