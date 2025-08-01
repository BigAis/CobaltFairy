import React, { useState, forwardRef, useImperativeHandle } from 'react'
import Cards from 'react-credit-cards-2'
import 'react-credit-cards-2/dist/lib/styles.scss'
import './CreditCardPicker.scss'
import Button from './Button'
import InputText from './InputText/InputText'
import Icon from './Icon/Icon'
import { loadStripe } from '@stripe/stripe-js'
import { 
	Elements, 
	CardNumberElement, 
	CardExpiryElement, 
	CardCvcElement,
	useStripe, 
	useElements 
} from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RqbKVFGeMjqZeKodvqKXvFiUOd0TzuZvj9PqIUV6GWNFvCBxdfI29BezKh5zjnvrV2R7AurMuItbBKWMHvrwJua00S7oZgqrh')

// Stripe Elements styling to match your InputText exactly
const elementOptions = {
  style: {
    base: {
      fontSize: '14px',
      fontWeight: '500',
      color: 'rgba(16, 15, 28, 1)',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#999',
      },
    },
    invalid: {
      color: 'rgba(255, 166, 0, 1)',
      iconColor: 'rgba(255, 166, 0, 1)',
    },
    complete: {
      color: 'rgba(16, 15, 28, 1)',
    },
  },
}

// Card number patterns for preview
const getCardPattern = (brand) => {
  const patterns = {
    visa: '4••• •••• •••• ••••',
    mastercard: '5••• •••• •••• ••••',
    amex: '3••• •••••• •••••',
    discover: '6••• •••• •••• ••••',
    diners: '3••• •••••• ••••',
    jcb: '3••• •••• •••• ••••',
    unknown: '•••• •••• •••• ••••'
  }
  return patterns[brand] || patterns.unknown
}

const CreditCardForm = forwardRef(({ doSubmitCard, onCardAdded, onError }, ref) => {
  const stripe = useStripe()
  const elements = useElements()
  
  // Form state
  const [name, setName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCardVerified, setIsCardVerified] = useState(false)
  const [savedCard, setSavedCard] = useState(null)
  const [errors, setErrors] = useState({})
  const [focus, setFocus] = useState('')
  
  // Track field states for floating labels
  const [fieldStates, setFieldStates] = useState({
    cardNumber: { focused: false, complete: false, empty: true },
    expiry: { focused: false, complete: false, empty: true },
    cvc: { focused: false, complete: false, empty: true }
  })

  // Card state for preview
  const [cardState, setCardState] = useState({
    brand: 'unknown',
    numberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
    last4: '',
    expiryDisplay: '••/••'
  })

  // Preview data for Cards component
  const [displayCard, setDisplayCard] = useState({
    number: '•••• •••• •••• ••••',
    name: 'CARDHOLDER NAME',
    expiry: '••/••',
    cvc: '•••',
    focused: ''
  })

  // Handle successful card verification
  const handleCardVerified = (cardData) => {
    setSavedCard(cardData)
    setIsCardVerified(true)
    resetForm()
    if (onCardAdded) {
      onCardAdded(cardData)
    }
  }

  // Expose submit method to parent component
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
    handleCardVerified: handleCardVerified,
    setProcessing: setIsProcessing
  }))

  // Update field state helper
  const updateFieldState = (field, updates) => {
    setFieldStates(prev => ({
      ...prev,
      [field]: { ...prev[field], ...updates }
    }))
  }

  // Handle card number changes
  const handleCardNumberChange = (event) => {
    const { brand, complete, empty, error } = event
    
    updateFieldState('cardNumber', { complete, empty: empty ?? true })
    
    setCardState(prev => ({
      ...prev,
      brand: brand || 'unknown',
      numberComplete: complete
    }))

    // Update preview with brand-specific pattern
    setDisplayCard(prev => ({
      ...prev,
      number: getCardPattern(brand || 'unknown')
    }))

    // Handle errors
    if (error) {
      setErrors(prev => ({ ...prev, cardNumber: error.message }))
    } else {
      setErrors(prev => ({ ...prev, cardNumber: '' }))
    }
  }

  // Handle expiry changes
  const handleExpiryChange = (event) => {
    const { complete, empty, error } = event
    
    updateFieldState('expiry', { complete, empty: empty ?? true })
    
    setCardState(prev => ({
      ...prev,
      expiryComplete: complete
    }))

    // Update preview when complete
    if (complete) {
      setDisplayCard(prev => ({
        ...prev,
        expiry: 'MM/YY'
      }))
    }

    if (error) {
      setErrors(prev => ({ ...prev, expiry: error.message }))
    } else {
      setErrors(prev => ({ ...prev, expiry: '' }))
    }
  }

  // Handle CVC changes
  const handleCvcChange = (event) => {
    const { complete, empty, error } = event
    
    updateFieldState('cvc', { complete, empty: empty ?? true })
    
    setCardState(prev => ({
      ...prev,
      cvcComplete: complete
    }))

    // Update preview when complete
    if (complete) {
      const cvcLength = cardState.brand === 'amex' ? 4 : 3
      setDisplayCard(prev => ({
        ...prev,
        cvc: '•'.repeat(cvcLength)
      }))
    }

    if (error) {
      setErrors(prev => ({ ...prev, cvc: error.message }))
    } else {
      setErrors(prev => ({ ...prev, cvc: '' }))
    }
  }

  // Handle name changes
  const handleNameChange = (e) => {
    const value = e.target.value
    setName(value)
    setDisplayCard(prev => ({
      ...prev,
      name: value || 'YOUR NAME HERE'
    }))
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }))
    }
  }

  // Handle focus for card preview and floating labels
  const handleFocus = (fieldName, stripeField) => {
    setFocus(fieldName)
    setDisplayCard(prev => ({
      ...prev,
      focused: fieldName
    }))
    
    if (stripeField) {
      updateFieldState(stripeField, { focused: true })
    }
  }

  const handleBlur = (stripeField) => {
    setFocus('')
    if (stripeField) {
      updateFieldState(stripeField, { focused: false })
    }
  }

  // Check if label should be floating
  const shouldFloatLabel = (field) => {
    const state = fieldStates[field]
    return state.focused || !state.empty || state.complete
  }

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (name.trim().length < 2) {
      newErrors.name = 'Please enter the cardholder name'
    }

    if (!cardState.numberComplete) {
      newErrors.cardNumber = 'Please enter a complete card number'
    }

    if (!cardState.expiryComplete) {
      newErrors.expiry = 'Please enter a valid expiry date'
    }

    if (!cardState.cvcComplete) {
      newErrors.cvc = 'Please enter a valid CVC'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!validateForm()) return null

    try {
      setIsProcessing(true)

      if (!stripe || !elements) {
        throw new Error('Stripe has not loaded yet')
      }

      // Create payment method using all elements
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: name.trim(),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // Return payment method for parent to handle API call
      return paymentMethod

    } catch (error) {
      console.error('Error creating payment method:', error)
      if (onError) {
        onError(error.message)
      }
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setName('')
    setDisplayCard({
      number: '•••• •••• •••• ••••',
      name: 'YOUR NAME HERE',
      expiry: '••/••',
      cvc: '•••',
      focused: ''
    })
    setCardState({
      brand: 'unknown',
      numberComplete: false,
      expiryComplete: false,
      cvcComplete: false,
      last4: '',
      expiryDisplay: '••/••'
    })
    setFieldStates({
      cardNumber: { focused: false, complete: false, empty: true },
      expiry: { focused: false, complete: false, empty: true },
      cvc: { focused: false, complete: false, empty: true }
    })
    setErrors({})
    setFocus('')
  }

  const allFieldsComplete = cardState.numberComplete && cardState.expiryComplete && cardState.cvcComplete && name.trim().length >= 2

  return (
    <div id="PaymentForm">
      {!isCardVerified ? (
        <>
          {/* Enhanced card preview with real-time updates */}
          <Cards 
            number={displayCard.number}
            name={displayCard.name}
            expiry={displayCard.expiry}
            cvc={displayCard.cvc}
            focused={displayCard.focused}
            preview={true}
          />
          
          <form onSubmit={handleSubmit}>
            {/* Card Number - Styled like InputText */}
            <div className="input-text-wrapper">
              <div className="input-container">
                <div className={`input-text stripe-input ${errors.cardNumber ? 'hasError' : ''} ${isProcessing ? 'disabled' : ''}`}>
                  <CardNumberElement
                    options={elementOptions}
                    onChange={handleCardNumberChange}
                    onFocus={() => handleFocus('number', 'cardNumber')}
                    onBlur={() => handleBlur('cardNumber')}
                  />
                </div>
                {/* <label className={`floating-label ${shouldFloatLabel('cardNumber') ? 'filled' : ''}`}>
                  Card Number
                </label> */}
              </div>
              {errors.cardNumber && (
                <span className="error-message d-flex gap-5">
                  <Icon name="Attention" size={16} />
                  {errors.cardNumber}
                </span>
              )}
            </div>

            {/* Expiry and CVC in a row */}
            <div className="card-row">
              <div className="input-text-wrapper">
                <div className="input-container">
                  <div className={`input-text stripe-input ${errors.expiry ? 'hasError' : ''} ${isProcessing ? 'disabled' : ''}`}>
                    <CardExpiryElement
                      options={elementOptions}
                      onChange={handleExpiryChange}
                      onFocus={() => handleFocus('expiry', 'expiry')}
                      onBlur={() => handleBlur('expiry')}
                    />
                  </div>
                  {/* <label className={`floating-label ${shouldFloatLabel('expiry') ? 'filled' : ''}`}>
                    Expiry Date
                  </label> */}
                </div>
                {errors.expiry && (
                  <span className="error-message d-flex gap-5">
                    <Icon name="Attention" size={16} />
                    {errors.expiry}
                  </span>
                )}
              </div>

              <div className="input-text-wrapper">
                <div className="input-container">
                  <div className={`input-text stripe-input ${errors.cvc ? 'hasError' : ''} ${isProcessing ? 'disabled' : ''}`}>
                    <CardCvcElement
                      options={elementOptions}
                      onChange={handleCvcChange}
                      onFocus={() => handleFocus('cvc', 'cvc')}
                      onBlur={() => handleBlur('cvc')}
                    />
                  </div>
                  {/* <label className={`floating-label ${shouldFloatLabel('cvc') ? 'filled' : ''}`}>
                    CVC
                  </label> */}
                </div>
                {errors.cvc && (
                  <span className="error-message d-flex gap-5">
                    <Icon name="Attention" size={16} />
                    {errors.cvc}
                  </span>
                )}
              </div>
            </div>

            {/* Name field - using your existing InputText component */}
            <InputText
              type="text"
              name="name"
              label="Cardholder Name"
              placeholder=""
              value={name}
              onChange={handleNameChange}
              onFocus={() => handleFocus('name')}
              onBlur={() => setFocus('')}
              hasError={!!errors.name}
              errorMessage={errors.name || "Enter the name on your card"}
              disabled={isProcessing}
            />
			

            {/* <div style={{ width: '100%', textAlign: 'left' }}>
              <Button
                type={'secondary'}
                onClick={handleSubmit}
                disabled={isProcessing || !allFieldsComplete}
              >
                {isProcessing ? 'Processing...' : 'Add Payment Method'}
              </Button>
            </div> */}
          </form>
        </>
      ) : (
        <div className="card-verified">
          <div className={`rccs__card rccs__card--${savedCard?.card?.brand || cardState.brand}`}>
            <div className="rccs__issuer"></div>
          </div>
          <div className="card-text">
            <span>{savedCard?.card?.brand?.toUpperCase() || 'Card'}</span>
            <span>**** {savedCard?.card?.last4}</span>
          </div>
          {/* <div className="card-actions">
            <Button type="link" onClick={() => { setIsCardVerified(false); resetForm(); }}>
              Add Another Card
            </Button>
          </div> */}
        </div>
      )}
    </div>
  )
})

// Add method to handle successful card addition
CreditCardForm.displayName = 'CreditCardForm'

// Main wrapper
const CreditCardPicker = forwardRef(({ onCardAdded, onError }, ref) => {
  return (
    <Elements stripe={stripePromise}>
      <CreditCardForm ref={ref} onCardAdded={onCardAdded} onError={onError} />
    </Elements>
  )
})

CreditCardPicker.displayName = 'CreditCardPicker'

export default CreditCardPicker