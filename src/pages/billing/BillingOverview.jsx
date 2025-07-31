import React, { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import { useAccount } from '../../context/AccountContext'
import { useNavigate, useLocation, useFetcher } from 'react-router-dom'
import { ApiService } from '../../service/api-service'
import { Skeleton } from 'primereact/skeleton'



const BillingOverview = () => {
    const { user, account, createNotification } = useAccount()
    const navigate = useNavigate();
    const [initialized, setInitialized] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [currentBillingData, setCurrentBillingData] = useState({
        currentPlan: {
            name: 'Standard',
            subscribers: 0,
            emails: 0,
            usageSubscribers: 0,
            usageEmails: 0,
            price: 0,
            dueDate: ''
        },
        invoices: [],
        paymentMethod: {}
    })
    const [currentPage, setCurrentPage] = useState(1);
    const useQuery = () => {
        const { search } = useLocation()
        return new URLSearchParams(search)
    }
    const query = useQuery()
    const success = query.get('success')
    const session_id = query.get('session_id')
    useEffect(() => {
        if (session_id) {
            if(success === 'true') {
                console.log('Payment successful')
                postBillingSessionToServer(session_id)
            } else {
                console.log('Payment failed')
            }
        }
    }, [session_id])
    useEffect(()=>{
        if(account){
            console.log('fires!')
            fetchAccountBillingData();
            fetchAccountInvoices();
        }
    },[account])
    const fetchAccountBillingData = async ()=>{
        console.log('fetching account billing data')
        const response = await ApiService.get(`fairymailer/billing-payment-methods`, user.jwt)
        let card = response.data?.data && response.data?.data[0] ? response.data?.data[0] : {}
        setCurrentBillingData({
            ...currentBillingData,
            currentPlan:{
                ...currentBillingData.currentPlan,
                name:account.payment_plan?.name,
                subscribers:account.payment_plan?.max_subs, //account.payment_plan?.subscribers==-1? '∞':,
                emails:account.payment_plan?.max_emails,
                price:account.payment_plan?.price,
                dueDate:account.payment_plan?.due_date
            },
            paymentMethod:card,
            invoices:[]
        })
        setInitialized(true)
    }
    const postBillingSessionToServer = async (session_id)=>{
        let resp = await ApiService.post(`fairymailer/billing-checkout-success`,{session_id},user.jwt)
        if(resp.data.code==200) {
            createNotification({
                type: 'warning',
                message: 'Payment plan updated successfully',
                autoClose: 3000
            })
            createNotification({
                type: 'info',
                message: 'The page will automatically refresh in 5 seconds',
                autoClose: 5000
            })
            setTimeout(()=>{
                window.location.href='/billing'
            },5000)
        } else {
            console.log('Payment failed')
            createNotification({
                type: 'error',
                message: 'FAILED to update payment plan.',
                autoClose: 13000
            })
        }
    }
    const fetchAccountInvoices = async ()=>{
        const response = await ApiService.get(`fairymailer/billing-invoices?limit=10`, user.jwt)
        setInvoices(response.data?.data?.invoices || [])
        console.log(response.data?.data)
    }
    // Mock data for billing page

    const calculatePercentage = (used, total) => {
        return (used / total) * 100;
    }

    const subscriberPercentage = calculatePercentage(currentBillingData.currentPlan.usageSubscribers, currentBillingData.currentPlan.subscribers);
    const emailPercentage = calculatePercentage(currentBillingData.currentPlan.usageEmails, currentBillingData.currentPlan.emails);

    // Handle pagination change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        console.log(`Changed to page ${page}`);
        // Here you would typically fetch the data for the new page
    };

    return (
        <div className="billing-overview">
            {/* Top Row - Current Plan, Usage, Payment Due */}
            <div className="billing-cards-row">
                {/* Current Plan Card */}
                <Card className="current-plan-card">
                    <h3>Current Plan</h3>
                    <div className="plan-details">
                        <h2>{initialized ? currentBillingData.currentPlan.name : <Skeleton className="skeleton-plan-name" />}</h2>
                        {initialized && 
                            <>
                                <p>{currentBillingData.currentPlan.subscribers==-1? '∞':currentBillingData.currentPlan.subscribers} Maximum subscribers</p>
                                <p>{currentBillingData.currentPlan.emails==-1? '∞':currentBillingData.currentPlan.emails} emails/month</p>
                            </>
                        }
                    </div>
                    <Button onClick={() => navigate('/payment-plan')}>Upgrade</Button>
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
                                    {initialized && <>
                                        <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold">
                                            <tspan x="60" y="55">{account.active_subs}</tspan>
                                            <tspan x="60" y="75" fontSize="14" fontWeight="normal">/{account.subscriber_limit??'∞'}</tspan>
                                        </text>
                                    </>}
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
                                    {initialized && 
                                        <>
                                            <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="bold">
                                                <tspan x="60" y="55">{'0'}</tspan>
                                                <tspan x="60" y="75" fontSize="14" fontWeight="normal">/{account.payment_plan?.max_emails==-1?'∞':account.payment_plan?.max_emails}</tspan>
                                            </text>
                                        </>
                                    }
                                </svg>
                                <p>Emails sent</p>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/payment-plan')}>Add More</Button>
                </Card>
                
                {/* Payment Due Card */}
                <Card className="payment-due-card">
                    <h3>Payment Due</h3>
                    <div className="payment-amount">
                        <h2>$0.00</h2>
                        <p>{currentBillingData.currentPlan.dueDate}</p>
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
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, index) => (
                                <tr key={index} style={{textAlign:'left'}}>
                                    <td>{new Date(invoice.created*1000).toLocaleDateString()}</td>
                                    <td>${invoice.amount_paid}</td>
                                    <td>
                                        <Button type="secondary" onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}>
                                            Download PDF
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Replace the custom pagination with the Pagination component */}
                    {/* <Pagination 
                        currentPage={currentPage}
                        totalResults={100} // Replace with actual total number of invoices
                        resultsPerPage={10} // Replace with your actual results per page
                        onChange={handlePageChange}
                        siblingCount={1}
                    /> */}
                </Card>
                
                {/* Payment Method Section */}
                <Card className="payment-method-card">
                    <h3>Payment Method</h3>
                    {currentBillingData?.paymentMethod && currentBillingData?.paymentMethod?.card ? (
                        <div className="card-info">
                            <div className="card-verified" style={{border:'0',backgroundColor:'transparent'}}>
                                    <div className={`rccs__card rccs__card--${currentBillingData.paymentMethod.card?.brand}`}>
                                        <div className="rccs__issuer"></div>
                                    </div>
                                    <div className="card-text">
                                        <span>**** {currentBillingData.paymentMethod.card?.last4}</span>
                                        <span>Exp {currentBillingData.paymentMethod.card?.exp_month}/{currentBillingData.paymentMethod.card?.exp_year.toString().slice(-2)}</span>
                                    </div>
                                </div>
                        </div>
                    ) : (
                        <div className="card-info">
                            <div className="card-verified" style={{border:'0',backgroundColor:'transparent'}}>
                                <div className="card-text">
                                    <span>No payment method added</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <Button type="secondary" onClick={() => navigate('/billing/payment-methods')}>Manage Payment Methods</Button>
                </Card>
            </div>
        </div>
    )
}

export default BillingOverview