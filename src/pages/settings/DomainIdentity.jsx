import { useState, useEffect } from 'react'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import VerificationBadge from '../../components/VerificationBadge'
import Icon from '../../components/Icon/Icon'
import { ApiService } from '../../service/api-service'
import { useAccount } from '../../context/AccountContext'
import './DomainIdentity.scss'

const DomainIdentity = () => {
	const { user, account, createNotification } = useAccount()

	// Domain & Identity state
	const [domainSettings, setDomainSettings] = useState({
		sendingDomain: '',
		sendingEmail: '',
		domainStatus: null,
		dkimStatus: null,
		emailStatus: null,
		domainTxtName: '',
		domainTxtValue: '',
		dkimRecords: [],
		isAddingDomain: false,
		isAddingEmail: false,
		isVerifyingDkim: false,
		isVerifyingEmail: false,
		isDetachingDomain: false,
	})

	// Function to add a domain
	const handleAddDomain = async () => {
		if (!domainSettings.sendingDomain) {
			createNotification({
				message: 'Please enter a domain name',
				type: 'warning',
				autoClose: 3000,
			})
			return
		}

		if (domainSettings.isAddingDomain) return

		setDomainSettings((prevState) => ({ ...prevState, isAddingDomain: true }))

		try {
			const response = await ApiService.post('aws/add-domain', { domain_name: domainSettings.sendingDomain }, user.jwt)

			if (response.data && response.data.code === 200) {
				const verificationToken = response.data.data?.VerificationToken || ''

				setDomainSettings((prevState) => ({
					...prevState,
					domainStatus: 'PENDING',
					domainTxtName: `_amazon.${prevState.sendingDomain}`,
					domainTxtValue: verificationToken,
					isAddingDomain: false,
				}))

				setTimeout(() => {
					getDkimRecords()
				}, 500)

				createNotification({
					message: 'Domain added successfully. Please verify the DNS records.',
					type: 'default',
					autoClose: 3000,
				})
			} else {
				setDomainSettings((prevState) => ({ ...prevState, isAddingDomain: false }))
				createNotification({
					message: 'Failed to add domain. Please try again.',
					type: 'warning',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Error adding domain:', error)
			setDomainSettings((prevState) => ({ ...prevState, isAddingDomain: false }))
			createNotification({
				message: 'Error adding domain: ' + (error.response?.data?.message || error.message),
				type: 'warning',
				autoClose: 3000,
			})
		}
	}

	// Function to add an email
	const handleAddEmail = async () => {
		if (!domainSettings.sendingEmail) {
			createNotification({
				message: 'Please enter an email address',
				type: 'warning',
				autoClose: 3000,
			})
			return
		}

		const emailParts = domainSettings.sendingEmail.split('@')
		if (emailParts.length !== 2 || emailParts[1].toLowerCase() !== domainSettings.sendingDomain.toLowerCase()) {
			createNotification({
				message: `Email must use the verified domain: @${domainSettings.sendingDomain}`,
				type: 'warning',
				autoClose: 3000,
			})
			return
		}

		if (domainSettings.isAddingEmail) return

		setDomainSettings((prevState) => ({ ...prevState, isAddingEmail: true }))

		try {
			const response = await ApiService.post('aws/add-email', { email: domainSettings.sendingEmail }, user.jwt)

			if (response.data && response.data.code === 200) {
				setDomainSettings((prevState) => ({
					...prevState,
					emailStatus: 'PENDING',
					isAddingEmail: false,
				}))

				createNotification({
					message: 'Email added successfully. Verification pending.',
					type: 'default',
					autoClose: 3000,
				})
			} else {
				setDomainSettings((prevState) => ({ ...prevState, isAddingEmail: false }))
				createNotification({
					message: 'Failed to add email. Please try again.',
					type: 'warning',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Error adding email:', error)
			setDomainSettings((prevState) => ({ ...prevState, isAddingEmail: false }))
			createNotification({
				message: 'Error adding email: ' + (error.response?.data?.message || error.message),
				type: 'warning',
				autoClose: 3000,
			})
		}
	}

	// Function to verify domain DKIM
	const handleVerifyDomainDkim = async () => {
		if (domainSettings.isVerifyingDkim) return

		setDomainSettings((prevState) => ({ ...prevState, isVerifyingDkim: true }))

		try {
			const response = await ApiService.get('aws/verify-domain-dkim', user.jwt)

			if (response.data && (response.data.success || response.data.code === 200)) {
				const isVerified = response.data.verified || (response.data.data && response.data.data.verified) || false

				setDomainSettings((prevState) => ({
					...prevState,
					dkimStatus: isVerified ? 'VERIFIED' : 'PENDING',
					isVerifyingDkim: false,
				}))

				createNotification({
					message: isVerified ? 'DKIM verified successfully!' : 'DKIM verification pending. Please ensure DNS records are properly configured.',
					type: 'default',
					autoClose: 3000,
				})
			} else {
				setDomainSettings((prevState) => ({ ...prevState, isVerifyingDkim: false }))
				createNotification({
					message: 'Failed to verify DKIM. Please try again later.',
					type: 'warning',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Error verifying DKIM:', error)
			setDomainSettings((prevState) => ({ ...prevState, isVerifyingDkim: false }))
			createNotification({
				message: 'Error verifying DKIM: ' + (error.response?.data?.message || error.message),
				type: 'warning',
				autoClose: 3000,
			})
		}
	}

	// Function to verify email
	const handleVerifyEmail = async () => {
		if (domainSettings.isVerifyingEmail) return

		setDomainSettings((prevState) => ({ ...prevState, isVerifyingEmail: true }))

		try {
			const response = await ApiService.get('aws/verify-email-status', user.jwt)

			if (response.data) {
				let isVerified = false

				if (response.data.verified !== undefined) {
					isVerified = response.data.verified
				} else if (response.data.data && response.data.data.verified !== undefined) {
					isVerified = response.data.data.verified
				} else if (response.data.status === 'Verified' || response.data.data?.status === 'Verified') {
					isVerified = true
				}

				setDomainSettings((prevState) => ({
					...prevState,
					emailStatus: isVerified ? 'VERIFIED' : 'PENDING',
					isVerifyingEmail: false,
				}))

				createNotification({
					message: isVerified ? 'Email verified successfully!' : 'Email verification pending. Please check your inbox for verification email.',
					type: 'default',
					autoClose: 3000,
				})
			} else {
				setDomainSettings((prevState) => ({ ...prevState, isVerifyingEmail: false }))
				createNotification({
					message: 'Failed to verify email status. Please try again later.',
					type: 'warning',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Error checking email verification:', error)
			setDomainSettings((prevState) => ({ ...prevState, isVerifyingEmail: false }))
			createNotification({
				message: 'Error checking email verification: ' + (error.response?.data?.message || error.message),
				type: 'warning',
				autoClose: 3000,
			})
		}
	}

	// Function to check domain and DKIM status
	const checkDomainStatus = async () => {
		try {
			const response = await ApiService.get('aws/get-domain-status', user.jwt)

			if (response.data && (response.data.success || response.data.code === 200)) {
				const domainData = response.data.data || {}
				let domainName = domainData && domainData.VerificationAttributes ? Object.keys(domainData.VerificationAttributes)[0] : ''

				let isVerified = false

				if (domainData && domainData.VerificationAttributes && domainData.VerificationAttributes[domainName]) {
					if (domainData.VerificationAttributes[domainName].VerificationStatus === 'Verified') {
						isVerified = true
					} else if (response.data.verified || response.data.status === 'Verified') {
						isVerified = true
					} 
				}

				const txtRecord = domainData?.VerificationAttributes[domainName]?.VerificationToken ?? 'err'

				setDomainSettings((prev) => ({
					...prev,
					sendingDomain: domainName,
					domainStatus: isVerified ? 'VERIFIED' : 'PENDING',
					domainTxtName: `_amazon.${domainName}`,
					domainTxtValue: txtRecord || '',
				}))

				return true
			}
			return false
		} catch (error) {
			console.error('Error checking domain status:', error)
			return false
		}
	}

	// Function to get DKIM records
	const getDkimRecords = async () => {
		try {
			const response = await ApiService.get('aws/get-domain-dkim', user.jwt)

			if (response.data && (response.data.success || response.data.code === 200)) {
				const dkimData = response.data.data || response.data

				let records = []

				if (dkimData.DkimTokens && Array.isArray(dkimData.DkimTokens)) {
					records = dkimData.DkimTokens.map((token) => ({
						name: token.name || `${token}._domainkey.${domainSettings.sendingDomain}`,
						value: token.value || `${token}.dkim.amazonses.com`,
					}))
				}

				let isVerified = false

				if (dkimData.verified !== undefined) {
					isVerified = dkimData.verified
				} else if (dkimData.status === 'Verified') {
					isVerified = true
				} else if (response.data.success || response.data.code === 200) {
					isVerified = true
				}

				setDomainSettings((prev) => ({
					...prev,
					dkimRecords: records,
					dkimStatus: isVerified ? 'VERIFIED' : 'PENDING',
				}))
			}
		} catch (error) {
			console.error('Error getting DKIM records:', error)
		}
	}

	// Function to check email verification status
	const checkEmailStatus = async () => {
		try {
			const response = await ApiService.get('aws/verify-email-status', user.jwt)

			if (response.data) {
				const emailData = response.data.data || response.data

				let isVerified = false
				let emailAddress = ''

				if (emailData) {
					emailAddress = emailData.email || ''

					if (emailData.verified !== undefined) {
						isVerified = emailData.verified
					} else if (emailData.status === 'Verified') {
						isVerified = true
					}
				}

				setDomainSettings((prev) => ({
					...prev,
					sendingEmail: emailAddress || prev.sendingEmail,
					emailStatus: isVerified ? 'VERIFIED' : 'PENDING',
				}))
			}
		} catch (error) {
			console.error('Error checking email status:', error)
		}
	}

	// Force verification check function for debugging
	const forceCheckAllVerificationStatuses = async () => {
		try {
			await checkDomainStatus()
			await getDkimRecords()
			await checkEmailStatus()

			createNotification({
				message: 'Verification status refreshed',
				type: 'default',
				autoClose: 3000,
			})
		} catch (error) {
			console.error('Error refreshing verification status:', error)
		}
	}

	// Initialize sending email with account's from_email
	useEffect(() => {
		if (account?.from_email && !domainSettings.sendingEmail) {
			setDomainSettings((prev) => ({
				...prev,
				sendingEmail: account.from_email,
			}))
		}
	}, [account, domainSettings.sendingEmail])

	// Initial loading of domain & email settings
	useEffect(() => {
		let isMounted = true

		const fetchDomainData = async () => {
			if (user && user.jwt) {
				try {
					const domainExists = await checkDomainStatus()

					// Only fetch additional data if domain exists and component is still mounted
					if (isMounted && domainExists) {
						// If domain exists, check DKIM status with a slight delay to avoid race conditions
						setTimeout(() => {
							if (isMounted) getDkimRecords()
						}, 300)

						// Also check email status
						setTimeout(() => {
							if (isMounted) checkEmailStatus()
						}, 600)
					}
				} catch (error) {
					console.error('Error during initial data fetch:', error)
				}
			}
		}

		fetchDomainData()

		return () => {
			isMounted = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	return (
		<div className="domain-identity-container">
			<h3 className="section-title">Sending domain</h3>

			<div className="domain-content">
				<div className="input-section">
					<InputText
						placeholder="Sending domain"
						value={domainSettings.sendingDomain}
						onChange={(e) => setDomainSettings({ ...domainSettings, sendingDomain: e.target.value })}
						disabled={domainSettings.domainStatus !== null}
						className="centered-input"
					/>
				</div>

				<div className="verification-status">{domainSettings.domainStatus && <VerificationBadge isVerified={domainSettings.domainStatus === 'VERIFIED'} />}</div>

				{!domainSettings.domainStatus && (
					<div className="action-buttons">
						<Button type="primary" onClick={handleAddDomain} loading={domainSettings.isAddingDomain}>
							Add Domain
						</Button>
					</div>
				)}
			</div>

			{domainSettings.domainStatus === 'PENDING' && (
				<div className="verification-instructions">
					<div className="info-text">
						<p>Please add the following TXT record to your domain&apos;s DNS settings to verify ownership:</p>
					</div>

					<div className="record-group">
						<div className="record-item">
							<div className="record-label">NAME:</div>
							<div className="record-value">{domainSettings.domainTxtName}</div>
						</div>
						<div className="record-item">
							<div className="record-label">VALUE:</div>
							<div className="record-value">{domainSettings.domainTxtValue}</div>
						</div>
					</div>
				</div>
			)}

			{domainSettings.domainStatus === 'VERIFIED' && (
				<div className="refresh-button">
					<Button type="secondary" onClick={forceCheckAllVerificationStatuses} size="small">
						<Icon name="Refresh" size={14} /> Refresh Status
					</Button>
				</div>
			)}

			{domainSettings.domainStatus && (
				<>
					<h3 className="section-title">DKIM Verification for domain {domainSettings.sendingDomain}</h3>

					<div className="verification-status">
						<div className="status-label">Status:</div>
						<VerificationBadge isVerified={domainSettings.dkimStatus === 'VERIFIED'} />
					</div>

					<div className="info-text">
						<p>Add these CNAME records to your domain&apos;s DNS settings to ensure your emails are not marked as spam:</p>
					</div>

					{domainSettings.dkimRecords && domainSettings.dkimRecords.length > 0 && (
						<div className="dkim-records-container">
							{domainSettings.dkimRecords.map((record, index) => (
								<div key={index} className="record-group">
									<div className="record-heading">Record #{index + 1}:</div>
									<div className="record-item">
										<div className="record-label">NAME:</div>
										<div className="record-value">{record.name}</div>
									</div>
									<div className="record-item">
										<div className="record-label">VALUE:</div>
										<div className="record-value">{record.value}</div>
									</div>
								</div>
							))}
						</div>
					)}

					<div className="verification-buttons">
						<Button type="secondary" onClick={handleVerifyDomainDkim} loading={domainSettings.isVerifyingDkim}>
							Verify DKIM
						</Button>
					</div>

					<h3 className="section-title">Sending email</h3>

					<div className="email-content">
						<div className="input-section">
							<InputText
								label={`Enter email`}
								value={domainSettings.sendingEmail || account?.from_email || ''}
								onChange={(e) => setDomainSettings({ ...domainSettings, sendingEmail: e.target.value })}
								placeholder={account?.from_email || `example@${domainSettings.sendingDomain}`}
								className="centered-input"
							/>
						</div>

						<div className="verification-status">
							<VerificationBadge isVerified={domainSettings.emailStatus === 'VERIFIED'} />
						</div>

						<div className="verification-buttons">
							<Button type="secondary" onClick={handleAddEmail} loading={domainSettings.isAddingEmail}>
								Save Email
							</Button>
							{domainSettings.emailStatus === 'PENDING' && (
								<Button type="secondary" onClick={handleVerifyEmail} loading={domainSettings.isVerifyingEmail} className="ml-10">
									Verify Email
								</Button>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default DomainIdentity
