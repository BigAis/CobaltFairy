import React, { useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import CreditCardPicker from '../../components/CreditCardPicker'
import Switch from '../../components/Switch'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'

const PaymentMethods = () => {
    const { user, account } = useAccount()
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
    const [isDefaultCard, setIsDefaultCard] = useState(false)

    // Mock data for payment methods
    const mockPaymentMethod = {
        type: 'Card',
        lastFour: '5414',
        cardType: 'mastercard' // Added for CreditCardPicker
    }

    const handleAddPaymentMethod = () => {
        setShowAddPaymentModal(true);
    }

    const handleCloseModal = () => {
        setShowAddPaymentModal(false);
        setIsDefaultCard(false); // Reset the default card state
    }

    const handleSavePaymentMethod = () => {
        // Validation would go here
        console.log('Saving payment method');
        setShowAddPaymentModal(false);
        setIsDefaultCard(false); // Reset the default card state
        
        // Show success message
        PopupText.fire({
            icon: 'success',
            text: 'Payment method added successfully',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            showCancelButton: false
        });
    }

    const handleDeleteCard = () => {
        PopupText.fire({
            icon: 'question',
            text: 'Are you sure you want to delete this payment method?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // Handle card deletion
                console.log('Card deleted');
                
                PopupText.fire({
                    icon: 'success',
                    text: 'Payment method deleted successfully',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    showCancelButton: false
                });
            }
        });
    }

    const handleMakeDefault = () => {
        PopupText.fire({
            icon: 'success',
            text: 'Payment method set as default',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            showCancelButton: false
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
                        <CreditCardPicker />
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
            <Card className="payment-methods-card">
                <h3>Payment Methods</h3>
                
                {/* Display existing payment methods */}
                <div className="payment-method-item">
                    {/* Use CreditCardPicker component in view mode */}
                    <div className="card-verified">
                        <div className={`rccs__card rccs__card--${mockPaymentMethod.cardType}`}>
                            <div className="rccs__issuer"></div>
                        </div>
                        <div className="card-text">
                            <span>Card</span>
                            <span>**** {mockPaymentMethod.lastFour}</span>
                        </div>
                    </div>
                    
                    <div className="card-actions">
                        <Button type="secondary" onClick={handleMakeDefault}>
                            Make Default
                        </Button>
                        <Button type="secondary" onClick={handleDeleteCard}>
                            Delete
                        </Button>
                    </div>
                </div>
                
                <div className="add-method-container">
                    <Button 
                        type="secondary" 
                        className="add-method-btn"
                        onClick={handleAddPaymentMethod}
                    >
                        Add new method
                    </Button>
                </div>
            </Card>
            
            {/* Add Payment Method Modal */}
            {showAddPaymentModal && <PaymentMethodModal />}
        </>
    )
}

export default PaymentMethods