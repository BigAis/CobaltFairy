import React from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAccount } from '../../context/AccountContext'
import { useNavigate } from 'react-router-dom'

const BillingOverview = () => {
    const { user, account } = useAccount()
    const navigate = useNavigate();

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
            { date: '15/04/2024', amount: '254$' },
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

    return (
        <div className="billing-overview">
            {/* Top Row - Current Plan, Usage, Payment Due */}
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
                    <Button onClick={() => navigate('/billing/payment-methods')}>Payment Methods</Button>
                </Card>
            </div>
            
            {/* Bottom Row - Invoices and Payment Method side by side */}
            <div className="invoices-payment-row">
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
                        <button className="prev-page">‹</button>
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
                            <img src="/visa.svg" alt="Visa" style={{display: 'none'}} />
                            <div className="visa-logo">VISA</div>
                        </div>
                        <div className="card-details">
                            <p>{mockBillingData.paymentMethod.type}</p>
                            <p>**** {mockBillingData.paymentMethod.lastFour}</p>
                        </div>
                    </div>
                    <Button type="secondary" onClick={() => navigate('/billing/payment-methods')}>Add Method</Button>
                </Card>
            </div>
        </div>
    )
}

export default BillingOverview