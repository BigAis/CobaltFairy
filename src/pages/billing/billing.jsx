import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './billing.scss'
import '../../fullpage.scss'
import Sidemenu from '../../components/Sidemenu/Sidemenu'
import PageHeader from '../../components/PageHeader/PageHeader'
import ButtonGroup from '../../components/ButtonGroup'
import BillingOverview from './BillingOverview'
import InvoiceDetails from './InvoiceDetails'
import PaymentMethods from './PaymentMethods'

const Billing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [currentContent, setCurrentContent] = useState(null);
    
    // Update active tab when location changes
    useEffect(() => {
        const path = location.pathname;
        
        if (path.includes('/billing/invoice-details')) {
            setActiveTab('invoiceDetails');
            setCurrentContent(<InvoiceDetails />);
        } else if (path.includes('/billing/payment-methods')) {
            setActiveTab('paymentMethods');
            setCurrentContent(<PaymentMethods />);
        } else {
            setActiveTab('overview');
            setCurrentContent(<BillingOverview />);
        }
    }, [location]);

    // Set initial content on first render
    useEffect(() => {
        if (!currentContent) {
            setCurrentContent(<BillingOverview />);
        }
    }, []);

    // Handle tab change
    const handleTabChange = (value) => {
        switch (value) {
            case 'overview':
                navigate('/billing/overview');
                break;
            case 'invoiceDetails':
                navigate('/billing/invoice-details');
                break;
            case 'paymentMethods':
                navigate('/billing/payment-methods');
                break;
            default:
                navigate('/billing/overview');
        }
    };

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
                        onChange={handleTabChange}
                    />
                </div>
                
                {/* Render current tab content */}
                {currentContent}
            </div>
        </div>
    )
}

export default Billing