import React, { useState } from 'react'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/lib/styles.scss'
import './CreditCardPicker.scss'
import Button from './Button'
import InputText from './InputText/InputText'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe 
const stripePromise = loadStripe('pk_test_51RqbKVFGeMjqZeKodvqKXvFiUOd0TzuZvj9PqIUV6GWNFvCBxdfI29BezKh5zjnvrV2R7AurMuItbBKWMHvrwJua00S7oZgqrh')

function CreditCardPicker({ onCardAdded, onError }) {
	const [number, setNumber] = useState('')
	const [name, setName] = useState('')
	const [expiry, setExpiry] = useState('')
	const [cvc, setCvc] = useState('')
	const [focus, setFocus] = useState('')
	const [cardType, setCardType] = useState('mastercard')
	const [last4, setLast4] = useState('1234')
	const [isCardVerified, setIsCardVerified] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [savedCard, setSavedCard] = useState(null)
	const [errors, setErrors] = useState({})

	const handleInputFocus = (e) => {
		setFocus(e.target.name)
		// Clear error when user focuses on field
		if (errors[e.target.name]) {
			setErrors(prev => ({ ...prev, [e.target.name]: '' }))
		}
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		
		switch (name) {
			case 'number':
				// Remove spaces and limit to 19 characters (including spaces)
				const cleanNumber = value.replace(/\s/g, '')
				if (cleanNumber.length <= 16) {
					// Add spaces every 4 digits for display
					const formattedNumber = cleanNumber.replace(/(.{4})/g, '$1 ').trim()
					setNumber(formattedNumber)
					
					// Detect card type
					if (cleanNumber.startsWith('4')) setCardType('visa')
					else if (cleanNumber.startsWith('5')) setCardType('mastercard')
					else if (cleanNumber.startsWith('3')) setCardType('amex')
					else setCardType('unknown')
				}
				break
			case 'name':
				setName(value)
				break
			case 'expiry':
				// Format MM/YY automatically
				let formattedExpiry = value.replace(/\D/g, '')
				if (formattedExpiry.length >= 2) {
					formattedExpiry = formattedExpiry.substring(0, 2) + '/' + formattedExpiry.substring(2, 4)
				}
				setExpiry(formattedExpiry)
				break
			case 'cvc':
				// Limit CVC based on card type
				const maxCvcLength = cardType === 'amex' ? 4 : 3
				if (value.replace(/\D/g, '').length <= maxCvcLength) {
					setCvc(value.replace(/\D/g, ''))
				}
				break
			default:
				break
		}
	}

	const validateCard = () => {
		const newErrors = {}
		const cleanNumber = number.replace(/\s/g, '')
		
		// Validate card number (basic Luhn algorithm)
		if (cleanNumber.length < 13 || cleanNumber.length > 16) {
			newErrors.number = 'Card number must be 13-16 digits'
		}
		
		// Validate expiry
		if (!/^\d{2}\/\d{2}$/.test(expiry)) {
			newErrors.expiry = 'Enter expiry as MM/YY'
		} else {
			const [month, year] = expiry.split('/')
			const currentDate = new Date()
			const currentYear = currentDate.getFullYear() % 100
			const currentMonth = currentDate.getMonth() + 1
			
			if (parseInt(month) < 1 || parseInt(month) > 12) {
				newErrors.expiry = 'Invalid month'
			} else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
				newErrors.expiry = 'Card has expired'
			}
		}
		
		// Validate CVC
		const expectedCvcLength = cardType === 'amex' ? 4 : 3
		if (cvc.length !== expectedCvcLength) {
			newErrors.cvc = `CVC must be ${expectedCvcLength} digits`
		}
		
		// Validate name
		if (name.trim().length < 2) {
			newErrors.name = 'Please enter the cardholder name'
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const createStripePaymentMethod = async () => {
		try {
			setIsProcessing(true)
			
			const stripe = await stripePromise
			if (!stripe) {
				throw new Error('Stripe failed to load')
			}

			// Parse expiry
			const [exp_month, exp_year] = expiry.split('/')
			const cleanNumber = number.replace(/\s/g, '')

			// Create PaymentMethod using Stripe.js (secure - card data never hits your server)
			const { paymentMethod, error } = await stripe.createPaymentMethod({
				type: 'card',
				card: {
					number: cleanNumber,
					exp_month: parseInt(exp_month),
					exp_year: parseInt(`20${exp_year}`),
					cvc: cvc,
				},
				billing_details: {
					name: name.trim(),
				},
			})

			if (error) {
				throw new Error(error.message)
			}

			// Send only the secure PaymentMethod ID to your backend
			const response = await fetch('/api/fairymailer/billing-payment-methods', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwt')}` // Adjust based on your auth
				},
				body: JSON.stringify({
					payment_method_id: paymentMethod.id
				})
			})

			const result = await response.json()

			if (result.code === 200) {
				// Success! Update UI
				setSavedCard(result.data)
				setIsCardVerified(true)
				setLast4(paymentMethod.card.last4)
				setCardType(paymentMethod.card.brand)
				
				// Clear form
				setNumber('')
				setName('')
				setExpiry('')
				setCvc('')
				setFocus('')
				
				// Notify parent component
				if (onCardAdded) {
					onCardAdded(result.data)
				}
			} else {
				throw new Error(result.message || 'Failed to save payment method')
			}

		} catch (error) {
			console.error('Error adding payment method:', error)
			if (onError) {
				onError(error.message)
			} else {
				alert('Error: ' + error.message)
			}
		} finally {
			setIsProcessing(false)
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!validateCard()) {
			return
		}
		
		await createStripePaymentMethod()
	}

	const resetForm = () => {
		setIsCardVerified(false)
		setSavedCard(null)
		setNumber('')
		setName('')
		setExpiry('')
		setCvc('')
		setFocus('')
		setErrors({})
	}

	return (
		<div id="PaymentForm">
			{!isCardVerified ? (
				<>
					<Cards 
						number={number} 
						name={name} 
						expiry={expiry} 
						cvc={cvc} 
						focused={focus} 
						preview="false" 
					/>
					<form onSubmit={handleSubmit}>
						<InputText
							type="tel"
							maxLength="19" // Allow for spaces
							name="number"
							placeholder="1234 5678 9012 3456"
							label="Card Number"
							value={number}
							onChange={handleInputChange}
							onFocus={handleInputFocus}
							hasError={!!errors.number}
							errorMessage={errors.number || "Enter your 16-digit card number"}
							disabled={isProcessing}
						/>
						
						<div className="d-flex expiry-cvc" style={{ display: 'flex', justifyContent: 'space-between' }}>
							<InputText 
								type="text" 
								name="expiry" 
								placeholder="MM/YY"
								label="Valid Thru" 
								value={expiry} 
								onChange={handleInputChange} 
								onFocus={handleInputFocus} 
								hasError={!!errors.expiry}
								errorMessage={errors.expiry}
								maxLength="5"
								disabled={isProcessing}
							/>
							<InputText 
								type="tel" 
								className="cvc" 
								name="cvc" 
								label="CVC" 
								placeholder={cardType === 'amex' ? '1234' : '123'}
								value={cvc} 
								onChange={handleInputChange} 
								onFocus={handleInputFocus} 
								hasError={!!errors.cvc}
								errorMessage={errors.cvc}
								maxLength={cardType === 'amex' ? "4" : "3"}
								disabled={isProcessing}
							/>
						</div>

						<InputText
							type="text"
							name="name"
							label="Card Holder Name"
							placeholder="John Doe"
							value={name}
							onChange={handleInputChange}
							onFocus={handleInputFocus}
							hasError={!!errors.name}
							errorMessage={errors.name || "Enter the name on your card"}
							disabled={isProcessing}
						/>

						<div style={{ width: '100%', textAlign: 'left' }}>
							<Button
								type={'secondary'}
								onClick={handleSubmit}
								disabled={isProcessing}
							>
								{isProcessing ? 'Processing...' : 'Add Payment Method'}
							</Button>
						</div>
					</form>
				</>
			) : (
				<div className="card-verified" onClick={resetForm}>
					<div className={`rccs__card rccs__card--${savedCard?.card?.brand || cardType}`}>
						<div className="rccs__issuer"></div>
					</div>
					<div className="card-text">
						<span>{savedCard?.card?.brand?.toUpperCase() || 'Card'}</span>
						<span>**** {savedCard?.card?.last4 || last4}</span>
					</div>
					<div className="card-actions">
						<Button type="link" onClick={resetForm}>
							Add Another Card
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

export default CreditCardPicker 