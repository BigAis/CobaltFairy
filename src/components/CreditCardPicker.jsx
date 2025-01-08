import React, { useState } from 'react'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/lib/styles.scss'
import './CreditCardPicker.scss'
import Button from './Button'
import InputText from './InputText/InputText'

function CardInput() {
	const [number, setNumber] = useState('')
	const [name, setName] = useState('')
	const [expiry, setExpiry] = useState('')
	const [cvc, setCvc] = useState('')
	const [focus, setFocus] = useState('')
	const [cardType, setCardType] = useState('mastercard')
	const [last4, setLast4] = useState('1234')
	const [isCardVerified, setIsCardVerified] = useState(true)

	const handleInputFocus = (e) => {
		setFocus(e.target.name)
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		switch (name) {
			case 'number':
				setNumber(value)
				break
			case 'name':
				setName(value)
				break
			case 'expiry':
				setExpiry(value)
				break
			case 'cvc':
				setCvc(value)
				break
			default:
				break
		}
	}

	const verifyCard = () => {
		setIsCardVerified(true)
		setLast4(number.slice(-4))
	}

	return (
		<div id="PaymentForm">
			{!isCardVerified ? (
				<>
					<Cards number={number} name={name} expiry={expiry} cvc={cvc} focused={focus} preview="false" />
					<form
						onSubmit={() => {
							verifyCard()
							return false
						}}
					>
						<InputText
							type="tel"
							maxLength="16"
							name="number"
							placeholder="Card Number"
							label="Card Number"
							value={number}
							onChange={handleInputChange}
							onFocus={handleInputFocus}
							hasError={false}
							errorMessage="The card number must be 16 numbers."
						/>
						<div className="d-flex expiry-cvc" style={{ display: 'flex', justifyContent: 'space-between' }}>
							<InputText type="text" name="expiry" label="Valid Thru" value={expiry} onChange={handleInputChange} onFocus={handleInputFocus} hasError={false} />
							<InputText type="tel" className="cvc" name="cvc" label="CVC" value={cvc} onChange={handleInputChange} onFocus={handleInputFocus} hasError={false} />
						</div>

						<InputText
							type="text"
							name="name"
							label="Card Holder Name"
							value={name}
							onChange={handleInputChange}
							onFocus={handleInputFocus}
							hasError={false}
							errorMessage="Plase check the card holder name."
						/>

						<div style={{ width: '100%', textAlign: 'left' }}>
							<Button
								type={'secondary'}
								onClick={() => {
									verifyCard()
								}}
							>
								Verify card
							</Button>
						</div>
					</form>
				</>
			) : (
				<div
					className="card-verified"
					onClick={() => {
						if (isCardVerified) {
							setIsCardVerified(false)
						}
					}}
				>
					<div className={`rccs__card rccs__card--${cardType}`}>
						<div className="rccs__issuer"></div>
					</div>
					<div className="card-text">
						<span>Card</span>
						<span>**** {last4}</span>
					</div>
				</div>
			)}
		</div>
	)
}

export default CardInput
