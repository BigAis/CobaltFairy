import React, { useState } from 'react'
import './billing.scss'
import '../../fullpage.scss'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import Card from '../../components/Card'
import Button from '../../components/Button'
import InputText from '../../components/InputText/InputText'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useAccount } from '../../context/AccountContext'
import ButtonGroup from '../../components/ButtonGroup'
import Dropdown from '../../components/Dropdown'
import Switch from '../../components/Switch'
import PopupText from '../../components/PopupText/PopupText'

const Billing = () => {
    const { user, account } = useAccount()
    const [activeTab, setActiveTab] = useState('overview')
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)

    // Mock data for billing page
    const mockBillingData = {
        currentPlan: {
            name: 'Standard',
            subscribers: 500,
            emails: 15000,
            usageSubscribers: 200,
            usageEmails: 800,
            price: 254,
            dueDate: '1/1/2024'
        },
        invoices: [
            { date: '15/04/2024', amount: '254$' },
            { date: '15/04/2024', amount: '254$' }
        ],
        paymentMethod: {
            type: 'Card',
            lastFour: '5414'
        }
    }

    const calculatePercentage = (used, total) => {
        return (used / total) * 100;
    }

    const subscriberPercentage = calculatePercentage(mockBillingData.currentPlan.usageSubscribers, mockBillingData.currentPlan.subscribers);
    const emailPercentage = calculatePercentage(mockBillingData.currentPlan.usageEmails, mockBillingData.currentPlan.emails);

    const handleAddPaymentMethod = () => {
        setShowAddPaymentModal(true);
    }

    const handleCloseModal = () => {
        setShowAddPaymentModal(false);
    }

    const handleSavePaymentMethod = () => {
        // Logic to save payment method would go here
        setShowAddPaymentModal(false);
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
                            value="" 
                            onChange={() => {}}
                        />
                        <div className="input-row">
                            <InputText 
                                label="Date" 
                                placeholder="MM/YY" 
                                value="" 
                                onChange={() => {}}
                            />
                            <InputText 
                                label="CVV" 
                                placeholder="CVV" 
                                value="" 
                                onChange={() => {}}
                            />
                        </div>
                        <InputText 
                            label="Name on card" 
                            placeholder="Enter name on card" 
                            value="" 
                            onChange={() => {}}
                        />
                        <div className="checkbox-row">
                            <Switch 
                                checked={false} 
                                onChange={() => {}}
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
        <div className="billing-wrapper">
            <Sidemenu />
            <div className="billing-container">
                <PageHeader />
                <div className="page-name-container">
                    <div className="page-name">Billing</div>
                </div>
                
                {/* Tabs Navigation */}
                <div className="billing-tabs">
                    <ButtonGroup
                        value={activeTab}
                        options={[
                            { value: 'overview', label: 'Overview' },
                            { value: 'invoiceDetails', label: 'Invoice Details' },
                            { value: 'paymentMethods', label: 'Payment Methods' }
                        ]}
                        onChange={(value) => setActiveTab(value)}
                    />
                </div>
                
                {/* Main Content Section - Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="billing-overview">
                        <div className="billing-cards-row">
                            {/* Current Plan Card */}
                            <Card className="current-plan-card">
                                <h3>Current Plan</h3>
                                <div className="plan-details">
                                    <h2>{mockBillingData.currentPlan.name}</h2>
                                    <p>{mockBillingData.currentPlan.subscribers} Maximum subscribers</p>
                                    <p>{mockBillingData.currentPlan.emails} emails/month</p>
                                </div>
                                <Button onClick={() => console.log('Upgrade clicked')}>Upgrade</Button>
                            </Card>
                            
                            {/* Usage Card */}
                            <Card className="usage-card">
                                <h3>Usage</h3>
                                <div className="usage-metrics">
                                    <div className="usage-metric">
                                        <div className="usage-chart">
                                            <svg width="120" height="120" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="#DAD1C5" strokeWidth="12" />
                                                <circle 
                                                    cx="60" 
                                                    cy="60" 
                                                    r="54" 
                                                    fill="none" 
                                                    stroke="#FF635D" 
                                                    strokeWidth="12" 
                                                    strokeDasharray="339.292"
                                                    strokeDashoffset={339.292 * (1 - subscriberPercentage / 100)}
                                                    transform="rotate(-90 60 60)"
                                                />
                                                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold">
                                                    <tspan x="60" y="55">200</tspan>
                                                    <tspan x="60" y="75" fontSize="14" fontWeight="normal">/500</tspan>
                                                </text>
                                            </svg>
                                            <p>Subscribers</p>
                                        </div>
                                    </div>
                                    <div className="usage-metric">
                                        <div className="usage-chart">
                                            <svg width="120" height="120" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="54" fill="none" stroke="#DAD1C5" strokeWidth="12" />
                                                <circle 
                                                    cx="60" 
                                                    cy="60" 
                                                    r="54" 
                                                    fill="none" 
                                                    stroke="#FF635D" 
                                                    strokeWidth="12" 
                                                    strokeDasharray="339.292"
                                                    strokeDashoffset={339.292 * (1 - emailPercentage / 100)}
                                                    transform="rotate(-90 60 60)"
                                                />
                                                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold">
                                                    <tspan x="60" y="55">800</tspan>
                                                    <tspan x="60" y="75" fontSize="14" fontWeight="normal">/1,500</tspan>
                                                </text>
                                            </svg>
                                            <p>Emails sent</p>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={() => console.log('Add More clicked')}>Add More</Button>
                            </Card>
                            
                            {/* Payment Due Card */}
                            <Card className="payment-due-card">
                                <h3>Payment Due</h3>
                                <div className="payment-amount">
                                    <h2>${mockBillingData.currentPlan.price}</h2>
                                    <p>{mockBillingData.currentPlan.dueDate}</p>
                                </div>
                                <Button onClick={() => setActiveTab('paymentMethods')}>Payment Methods</Button>
                            </Card>
                        </div>
                        
                        {/* Invoices Section */}
                        <Card className="invoices-card">
                            <h3>Invoices</h3>
                            <table className="invoices-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockBillingData.invoices.map((invoice, index) => (
                                        <tr key={index}>
                                            <td>{invoice.date}</td>
                                            <td>{invoice.amount}</td>
                                            <td>
                                                <Button type="secondary" onClick={() => console.log('Download PDF clicked')}>
                                                    Download PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="pagination">
                                <span className="page-active">1</span>
                                <span>2</span>
                                <span>...</span>
                                <span>9</span>
                                <span>10</span>
                                <button className="next-page">›</button>
                            </div>
                        </Card>
                        
                        {/* Payment Method Section */}
                        <Card className="payment-method-card">
                            <h3>Payment Method</h3>
                            <div className="card-info">
                                <div className="card-icon">
                                    <img src="/visa.svg" alt="Visa" />
                                </div>
                                <div className="card-details">
                                    <p>{mockBillingData.paymentMethod.type}</p>
                                    <p>**** {mockBillingData.paymentMethod.lastFour}</p>
                                </div>
                            </div>
                            <Button type="secondary" onClick={handleAddPaymentMethod}>Add Method</Button>
                        </Card>
                    </div>
                )}
                
                {/* Invoice Details Tab */}
                {activeTab === 'invoiceDetails' && (
                    <Card className="invoice-details-card">
                        <h3>Invoice Details</h3>
                        <div className="invoice-form">
                            <div className="form-row">
                                <InputText 
                                    label="First Name" 
                                    placeholder="First Name" 
                                    value="" 
                                    onChange={() => {}}
                                />
                                <InputText 
                                    label="First Name" 
                                    placeholder="First Name" 
                                    value="" 
                                    onChange={() => {}}
                                />
                            </div>
                            
                            <div className="form-row">
                                <InputText 
                                    label="Address 1" 
                                    placeholder="Address 1" 
                                    value="" 
                                    onChange={() => {}}
                                />
                                <InputText 
                                    label="Address 2" 
                                    placeholder="Address 2" 
                                    value="" 
                                    onChange={() => {}}
                                />
                            </div>
                            
                            <div className="form-row">
                                <InputText 
                                    label="City" 
                                    placeholder="City" 
                                    value="" 
                                    onChange={() => {}}
                                />
                                <Dropdown 
                                    options={[
                                        { value: 'us', label: 'United States' },
                                        { value: 'ca', label: 'Canada' },
                                        { value: 'uk', label: 'United Kingdom' }
                                    ]}
                                    placeholder="Country"
                                />
                            </div>
                            
                            <div className="form-row">
                                <InputText 
                                    label="VAT ID" 
                                    placeholder="VAT ID" 
                                    value="" 
                                    onChange={() => {}}
                                />
                                <InputText 
                                    label="Company Name" 
                                    placeholder="Company Name" 
                                    value="" 
                                    onChange={() => {}}
                                />
                            </div>
                            
                            <InputText 
                                label="Invoice Email Receiptents" 
                                placeholder="Add email addresses..." 
                                value="" 
                                onChange={() => {}}
                            />
                            
                            <div className="form-actions">
                                <Button onClick={() => console.log('Save Changes clicked')}>Save Changes</Button>
                            </div>
                        </div>
                    </Card>
                )}
                
                {/* Payment Methods Tab */}
                {activeTab === 'paymentMethods' && (
                    <Card className="payment-methods-card">
                        <h3>Payment Methods</h3>
                        <div className="payment-method-item">
                            <div className="card-info">
                                <div className="card-logo">
                                    <div className="visa-logo">VISA</div>
                                </div>
                                <div className="card-details">
                                    <p>Card</p>
                                    <p>**** {mockBillingData.paymentMethod.lastFour}</p>
                                </div>
                            </div>
                            <div className="card-actions">
                                <Button type="secondary" onClick={() => console.log('Make Default clicked')}>Make Default</Button>
                                <Button type="secondary" onClick={() => console.log('Delete clicked')}>Delete</Button>
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
                )}
                
                {/* Add Payment Method Modal */}
                {showAddPaymentModal && <PaymentMethodModal />}
            </div>
        </div>
    )
}

export default Billing