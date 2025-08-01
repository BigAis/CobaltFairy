import React, { useState, useRef, useEffect } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import CreditCardPicker from '../../components/CreditCardPicker'
import Switch from '../../components/Switch'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'
import {ApiService} from '../../service/api-service'
import { Skeleton } from 'primereact/skeleton'
import NotificationBar from '../../components/NotificationBar/NotificationBar'


const PaymentMethods = () => {
    const { user, account, createNotification } = useAccount()
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
    const [isDefaultCard, setIsDefaultCard] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState([])
    const[initialized, setInitialized] = useState(false)
    const creditCardRef = useRef()

    // Mock data for payment methods
    const mockPaymentMethod = {
        type: 'Card',
        lastFour: '5414',
        cardType: 'mastercard' // Added for CreditCardPicker
    }

    const fetchPaymentMethods = async () => {
        const response = await ApiService.get(`fairymailer/billing-payment-methods`, user.jwt)
        setPaymentMethods(response.data.data)
        console.log(response.data.data)
        setInitialized(true)
    }

    const makePaymentMethodDefault = async (paymentMethodId) => {
        const response = await ApiService.post(`fairymailer/billing-payment-methods-default`, { payment_method_id: paymentMethodId }, user.jwt)
        setPaymentMethods(response.data.data)
        console.log(response.data.data)
        fetchPaymentMethods()
        createNotification({
            message: `Default payment method updated successfully.`,
            type: 'default',
            autoClose: 3000
        });
    }

    useEffect(()=>{
        fetchPaymentMethods()
    }, [])

    const handleAddPaymentMethod = () => {
        setShowAddPaymentModal(true);
    }

    const handleCloseModal = () => {
        setShowAddPaymentModal(false);
        setIsDefaultCard(false); // Reset the default card state
    }

    const handleSavePaymentMethod = async () => {
        try {
            // Trigger CreditCardPicker form submission
            const paymentMethod = await creditCardRef.current?.submitForm()
            
            if (!paymentMethod) {
                return // Validation failed or user cancelled
            }

            // Set processing state
            creditCardRef.current?.setProcessing(true)

            // Call API through api-service
            let result = null
            try {
                const response = await ApiService.post(`fairymailer/billing-payment-methods`, { payment_method_id: paymentMethod.id }, user.jwt)
                result = response.data
            } catch (error) {
                console.error("Error adding payment method:", error)
                result = error
                throw error
            }

            if (result.code === 200) {
                // Handle successful card verification
                creditCardRef.current?.handleCardVerified(result.data)
                
                setShowAddPaymentModal(false)
                setIsDefaultCard(false)
                fetchPaymentMethods();
                createNotification({
                    message: `Payment method added successfully.`,
                    type: 'default',
                    autoClose: 3000
                });
                // PopupText.fire({
                //     icon: 'success',
                //     text: 'Payment method added successfully',
                //     showConfirmButton: true,
                //     confirmButtonText: 'OK',
                //     showCancelButton: false
                // })
            } else {
                throw new Error(result.message || 'Failed to save payment method')
            }

        } catch (error) {
            console.error('Error adding payment method:', error)
            
            // Show error message
            createNotification({
                message: error.message || 'Failed to add payment method',
                type: 'default',
                autoClose: 3000
            });
        } finally {
            // Reset processing state
            creditCardRef.current?.setProcessing(false)
        }
    }

    const handleDeleteCard = (paymentMethodId) => {
        PopupText.fire({
            icon: 'question',
            text: 'Are you sure you want to delete this payment method?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        }).then( async (result) => {
            if (result.isConfirmed) {
                // Handle card deletion
                const response = await ApiService.delete(`fairymailer/billing-payment-methods/${paymentMethodId}`, user.jwt)
                console.log('delete',response.data)
                setPaymentMethods(response.data.data)
                console.log(response.data.data)
                fetchPaymentMethods()
                createNotification({
                    message: `Payment method deleted successfully.`,
                    type: 'default',    
                    autoClose: 3000
                });
            }
        });
    }


    // Enhanced Payment Method Modal using CreditCardPicker
    const PaymentMethodModal = () => {
        return (
            <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Add Payment Method</h3>
                        <span className="close-icon" onClick={handleCloseModal}>×</span>
                    </div>
                    <div className="modal-body">
                        <CreditCardPicker 
                            ref={creditCardRef}
                            onCardAdded={(data) => {console.log('onCardAdded', data)}} 
                            onError={(error) => {console.log('onError', error)}}
                        />
                        <div className="checkbox-row">
                            <Switch 
                                checked={isDefaultCard} 
                                onChange={(checked) => setIsDefaultCard(checked)}
                                label="Use Default"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button type="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePaymentMethod}>
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="payment-methods-card">
              {/* Display existing payment methods */}
              {paymentMethods && paymentMethods.length>0 && paymentMethods.map((paymentMethod)=>{
                    return (
                        <div className="payment-method-item">
                            <div className="card-verified">
                                <div className={`rccs__card rccs__card--${paymentMethod.card?.brand}`}>
                                    <div className="rccs__issuer"></div>
                                </div>
                                <div className="card-text">
                                    <span>**** {paymentMethod.card?.last4}</span>
                                    <span>Exp {paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year.toString().slice(-2)}</span>
                                </div>
                            </div>
                            
                            <div className="card-actions">
                                <Button type="secondary" style={paymentMethod.card?.is_default ? {backgroundColor: '#ffa60040', borderColor: '#ffa600', color: '#000', fontSize: '12px'} : {}} disabled={paymentMethod.card?.is_default} onClick={()=>{makePaymentMethodDefault(paymentMethod.id)}}>
                                    {paymentMethod.card?.is_default ? 'Default' : 'Make Default'}
                                </Button>
                                <Button type="secondary" disabled={paymentMethod.card?.is_default} onClick={()=>{handleDeleteCard(paymentMethod.id)}}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )
                })}
                {((!paymentMethods || paymentMethods.length === 0) && !initialized) && (
                    <>
                        <div className="payment-method-item">
                            <Skeleton className="w-full h-10"/>
                        </div>
                        <div className="payment-method-item">
                            <Skeleton className="w-full h-10"/>
                        </div>
                    </>
                )}
                {(paymentMethods && paymentMethods.length === 0 || initialized) && (
                    <>
                      <p>No payment methods found</p>
                    </>
                )}
                
                
                
            </div>
                <div className="add-method-container">
                    <Button 
                        type="primary" 
                        className="add-method-btn"
                        onClick={handleAddPaymentMethod}
                    >
                        Add new method
                    </Button>
                </div>
            
            {/* Add Payment Method Modal */}
            {showAddPaymentModal && <PaymentMethodModal />}
        </>
    )
}

export default PaymentMethods