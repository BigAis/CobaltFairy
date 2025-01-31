import "./payment-plan.scss";
import { useState, useEffect, useRef } from "react";
import { getPaymentPlans } from "../../service/api-service";
import SubscriberSlider from "../../components/SubscribersSlider/SubscribersSlider";
import Logo from "../../components/Logo/Logo";
import Card from "../../components/Card";
import ButtonGroup from "../../components/ButtonGroup";
import Button from "../../components/Button";
import Icon from "../../components/Icon/Icon";

const PaymentPlan = () => {
    const [sliderValue, setSliderValue] = useState(500);
    const [paymentPlans, setPaymentPlans] = useState([]);
    const [allowedValues, setAllowedValues] = useState([]);
    const [billingCycle, setBillingCycle] = useState("yearly");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPaymentPlans();
                const plans = response.data.map(plan => plan.attributes);
                setPaymentPlans(plans);

                const uniqueLimits = [
                    ...new Set(plans.flatMap(plan => plan.pricing.map(price => price.subs_limit)))
                ].sort((a, b) => a - b);
                setAllowedValues(uniqueLimits);

            } catch (error) {
                console.error("Error fetching payment plans:", error);
            }
        };
        fetchData();
    }, []);
    
    
    console.log("Rendering payment plans:", paymentPlans);
    
    return ( 
        <div className="payment-plan-component">
            <Logo/>
            <div className="text-slider-button">
                <h1 className="choose-plan-text">Choose your Plan</h1>
                <h2 className="subscibers-text">How many subscribers do you have?</h2>
                <SubscriberSlider 
                min={500} 
                max={20000} 
                defaultValue={sliderValue} 
                onChange={setSliderValue} 
                staticTooltip={true}
                allowedValues={allowedValues} 
/>
                <div className="button-group-container">
                    <ButtonGroup
                        value={billingCycle}
                        options={[
                            { value: 'monthly', label: 'Billed Monthly' },
                            { value: 'yearly', label: 'Billed Yearly' }
                        ]}
                        onChange={(value) => setBillingCycle(value)}                    />
                    <p className="discount-text">Save 20% by paying Yearly</p>
                </div>
                {/* className="full-width-card" */}
                <div className="card-section">
                    {paymentPlans.map((plan, index) =>(
                        <Card key={index} className={`card ${index === 0 ? "first-plan" : ""} ${index === 0 && sliderValue > 1500 ? "disabled" : ""} ${index === paymentPlans.length - 1 ? "full-width-card" : ""}`}>
                            <div className={index === 3 ? "custom-plan-card" : ""}>
                                <h2 className="plan-text">{plan.name}</h2>
                                <p className="tag-text">{plan.subtitle}</p>
                            </div>
                            {index !== 3 && (
                                <>
                                    <h1 className="price-text">$
                                        {(() => {
                                            const price = plan.pricing.find(p => p.subs_limit === sliderValue && p.change === billingCycle)?.price ?? 0;
                                            return price === 0 ? price : `${price}/${billingCycle === "yearly" ? "year" : "month"}`;
                                        })()}
                                    </h1>
                                    <Button>Sign Up for Free</Button>
                                    <p className="free-try-text">Try pro features for 30-days!</p>
                                    <div className="perk-buttons">
                                        <Button type="secondary" icon="Envelope">{plan.max_emails === -1 ? '∞' : plan.max_emails} Emails</Button> <br/>
                                        <Button type="secondary" icon="Subscribers">{plan.max_subs === -1 ? '∞' : plan.max_subs} Subscribers</Button><br/>
                                        <Button type="secondary" icon="Subscribers">{plan.max_users === -1 ? '∞' : plan.max_users} Users</Button><br/>
                                    </div>
                                    <div className="breakpoint-or"/>
                                </>
                            )}
                            <h3 className={index === 3 ? "custom-perk-card" : ""}>{plan.features_text}</h3>
                            {index === 3 ? (
                                <>
                                    {plan.features.has.reduce((resultArray, item, idx) => {
                                        const chunkIndex = Math.floor(idx / 3);
                                        if (!resultArray[chunkIndex]) {
                                            resultArray[chunkIndex] = [];
                                        }
                                        resultArray[chunkIndex].push(item);
                                        return resultArray;
                                    }, []).map((group, idx) => (
                                        <div key={idx} className="custom-perk-card">
                                            {group.map((feature, subIdx) => (
                                                <p key={subIdx}><Icon name="Check" className="check-mark"/> {feature}</p>
                                            ))}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className={`benefit-checks`}>
                                    {plan.features.has.map((feature, idx) => (
                                        <p key={idx}><Icon name="Check" className="check-mark"/> {feature}</p>
                                    ))}
                                    
                                    {plan.features.has_not.map((feature, idx) => (
                                        <p key={idx}><Icon name="Close" className="check-mark-dark"/> {feature}</p>
                                    ))}
                                </div>
                            )}
                            {index === 3 && (    
                                <div className="custom-contact-us">
                                    <h1 className="custom-text">Custom</h1>
                                     <Button className="contact-us" onClick={() =>{console.log(sliderValue)}}>Contact Us</Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>        
            </div>
        </div>);
}
 
export default PaymentPlan;