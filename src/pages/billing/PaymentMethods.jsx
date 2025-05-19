import React, { useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import Switch from '../../components/Switch'
import { useAccount } from '../../context/AccountContext'
import PopupText from '../../components/PopupText/PopupText'

const PaymentMethods = () => {
    const { user, account } = useAccount()
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: '',
        isDefault: false
    });

    // Mock data for payment methods
    const mockPaymentMethod = {
        type: 'Card',
        lastFour: '5414'
    }

    const handleInputChange = (field, value) => {
        setCardData({
            ...cardData,
            [field]: value
        });
    };

    const handleAddPaymentMethod = () => {
        setShowAddPaymentModal(true);
    }

    const handleCloseModal = () => {
        setShowAddPaymentModal(false);
    }

    const handleSavePaymentMethod = () => {
        // Validation would go here
        console.log('Saving payment method:', cardData);
        setShowAddPaymentModal(false);
        
        // Show success message
        PopupText.fire({
            icon: 'success',
            text: 'Payment method added successfully',
            showConfirmButton: true,
            confirmButtonText: 'OK',
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
                });
            }
        });
    }

    // Payment Method Modal
    const PaymentMethodModal = () => {
        return (
            <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Add Payment Method</h3>
                        <span className="close-icon" onClick={handleCloseModal}>×</span>
                    </div>
                    <div className="modal-body">
                        <InputText 
                            label="Card Number" 
                            placeholder="Enter card number" 
                            value={cardData.cardNumber} 
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        />
                        <div className="input-row">
                            <InputText 
                                label="Date" 
                                placeholder="MM/YY" 
                                value={cardData.expiryDate} 
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            />
                            <InputText 
                                label="CVV" 
                                placeholder="CVV" 
                                value={cardData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value)}
                            />
                        </div>
                        <InputText 
                            label="Name on card" 
                            placeholder="Enter name on card" 
                            value={cardData.nameOnCard}
                            onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                        />
                        <div className="checkbox-row">
                            <Switch 
                                checked={cardData.isDefault} 
                                onChange={(checked) => handleInputChange('isDefault', checked)}
                                label="Use Default"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button type="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSavePaymentMethod}>Add</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Card className="payment-methods-card">
                <h3>Payment Methods</h3>
                <div className="payment-method-item">
                    <div className="card-info">
                        <div className="card-logo">
                            <div className="visa-logo">VISA</div>
                        </div>
                        <div className="card-details">
                            <p>{mockPaymentMethod.type}</p>
                            <p>**** {mockPaymentMethod.lastFour}</p>
                        </div>
                    </div>
                    <div className="card-actions">
                        <Button type="secondary" onClick={() => console.log('Make Default clicked')}>Make Default</Button>
                        <Button type="secondary" onClick={handleDeleteCard}>Delete</Button>
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