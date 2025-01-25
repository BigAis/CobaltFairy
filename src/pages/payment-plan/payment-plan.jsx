import "./payment-plan.scss";
import { useState } from "react";
import Slider from "../../components/Slider_ck/Slider";
import Logo from "../../components/Logo/Logo";
import Card from "../../components/Card";
import ButtonGroup from "../../components/ButtonGroup";
import Button from "../../components/Button";
import Icon from "../../components/Icon/Icon";
const PaymentPlan = () => {

    const [sliderValue, setSliderValue] = useState(0); // Track slider value

    return ( 
        <div className="payment-plan-component">
        <Logo/>
            <div className="text-slider-button">
                <h1 className="choose-plan-text">Choose your Plan</h1>
                <h2 className="subscibers-text">How many subscribers do you have?</h2>
                <Slider max={20000} min={500} step={100}  value={sliderValue}
                    onChange={setSliderValue}/>
                <div className="button-group-container">
                    <ButtonGroup
                        value="yearly"
                        options={[
                                { value: 'monthly', label: 'Billed Monthly' },
                                { value: 'yearly', label: 'Billed Yearly' }]}
                                onChange={(value) => {
                                    console.log(value)
                                }}
                    ></ButtonGroup>
                    <p className="discount-text">Save 20% by paying Yearly</p>
                </div>
                
                <div className="card-section">
                    <Card className={`card ${sliderValue > 1500 ? "disabled" : ""}`}>
                        <h2 className="plan-text">Free Plan </h2>
                        <p className="tag-text">Fairy Basics</p>
                        <h1 className="price-text">$0</h1>
                        <Button>Sign Up for Free</Button>
                        <p className="free-try-text">Try pro features for 30-days!</p>
                        <div className="perk-buttons">
                            <Button type="secondary"  icon="Envelope">1500 Emails</Button> <br></br>
                            <Button type="secondary"  icon="Subscribers">1000 Subscribers</Button><br></br>
                            <Button type="secondary"  icon="User">1 User</Button><br></br>
                        </div>
                        <div className="breakpoint-or"/>
                        <div className="benefit-checks">

                       <p><Icon name ="Check"  className="check-mark"/> Drag-and-drop-editor</p>
                        <p><Icon name ="Check"  className="check-mark"/> Basic templates</p>
                        <p><Icon name ="Check"  className="check-mark"/> Campaing scheduling</p>
                        <p><Icon name ="Check" className="check-mark"/> Basic analytics</p>
                        <p><Icon name ="Check" className="check-mark"/> Email support</p>
                        </div>

                    </Card>

                    <Card>
                    <h2 className="plan-text">Standard Plan </h2>
                        <p className="tag-text">Wings</p>
                        <h1 className="price-text">$6/month</h1>
                        <Button>Sign Up for Free</Button>
                        <p className="free-try-text">Try pro features for 30-days!</p>
                        <div className="perk-buttons">
                            <Button type="secondary"  icon="Envelope">∞ Emails</Button> <br></br>
                            <Button type="secondary"  icon="Subscribers">1500 Subscribers</Button><br></br>
                            <Button type="secondary"  icon="User">5 User</Button><br></br>
                        </div>    

                        <div className="breakpoint-or"/>
                        <h3>Everything in free plus:     </h3>
                        <div className="benefit-checks">
                            <p><Icon name ="Check" className="check-mark"/> Advanced templates</p>
                            <p><Icon name ="Check"  className="check-mark"/> Automation (multi-step)</p>
                            <p><Icon name ="Check"  className="check-mark"/> Basic A/B testing</p>
                            <p><Icon name ="Check" className="check-mark"/> Basic segmentation</p>
                            <p><Icon name ="Check" className="check-mark"/> Full analytics </p>
                            <p><Icon name ="Check" className="check-mark"/> Chat Support </p>
                        </div>
                    </Card>
                    
                    <Card>
                    <h2 className="plan-text">Pro Plan </h2>
                        <p className="tag-text">Silver Wings</p>
                        <h1 className="price-text">$58/month</h1>
                        <Button>Sign Up for Free</Button>
                        <p className="free-try-text">Try pro features for 30-days!</p>
                    
                        <div className="perk-buttons">
                            <Button type="secondary"  icon="Envelope">∞ Emails</Button> <br></br>
                            <Button type="secondary"  icon="Subscribers">1500 Subscribers</Button><br></br>
                            <Button type="secondary"  icon="User">∞ User</Button><br></br>
                        </div>    
                        <div className="breakpoint-or"/>
                        <h3>Everything in standard plus:</h3>
                        <div className="benefit-checks">
                            <p><Icon name ="Check" className="check-mark"/> Unlimited automations</p>
                            <p><Icon name ="Check"  className="check-mark"/> Advanced A/B testing</p>
                            <p><Icon name ="Check" className="check-mark"/> Advanced segmentation</p>
                            <p><Icon name ="Check" className="check-mark"/> Workflow migration</p>
                            <p><Icon name ="Check" className="check-mark"/> Priority Support </p>
                        </div>

                    </Card>
                    <Card className="full-width-card" >
                        <div className="custom-plan-card">
                            <h1>Custom Plan</h1>
                            <p>Fairy Tailored</p>
                        </div>
                        <div className="custom-perk-card">
                            <p><Icon name ="Check" className="check-mark"/> Custom integrations</p>
                            <p><Icon name ="Check"  className="check-mark"/> Custom analytics</p>
                            <p><Icon name ="Check"  className="check-mark"/> Dedicated manager</p>
                        </div>
                        <div className="custom-perk-card">
                            <p><Icon name ="Check" className="check-mark"/> Enchanced security</p>
                            <p><Icon name ="Check" className="check-mark"/> Tailord solutions </p>
                        </div>
                        <div className="custom-contact-us">
                            <h1 className="custom-text">Custom</h1>
                            <Button className="contact-us" onClick={() =>{console.log(sliderValue)}}>Contact Us</Button>
                        </div>
                        
                    </Card>

                </div>

        
            </div>
        </div>);
}
 
export default PaymentPlan;