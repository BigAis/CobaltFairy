import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './register.scss';
import InputText from '../../components/InputText/InputText';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Logo from '../../components/Logo/Logo';
import Icon from '../../components/Icon/Icon';
import { registerUser } from '../../service/api-service';

const Register = () => {

 const navigate = useNavigate();

  const location = useLocation(); 
  const data = location.state; 

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError,setPasswordError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    accountName: '',
    email: '',
    password: '',
    sendNews: false
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() =>{
    console.log(formData)
    if (data?.email) {
      setFormData((prev) => ({ ...prev, email: data.email }));
    }
  },[data]) 

  const checkForm = () => {
    if (!formData.password || formData.password.length < 6) {
      setPasswordError('Invalid Password')
      setIsLoading(false);
      return false;   
    }

      return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (checkForm()) {
      navigate("/login/2FA", { state: { formData } });
    } else {
      console.error(checkForm());
    }
   
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('')
  };
  

  return (
    <div className="register-wrapper">
      <Logo/>
      <Card>

         <Button 
            className="back-button"
            onClick={() =>{ navigate('/login')}}
            type={'link'} 
            icon="Caret"
            >Back
            </Button>
        <div className="header-info">
          <header>
            <h1>Welcome</h1>
            <p>Complete the account for the email</p>
            <p>{formData.email}</p>
          </header>
        </div>

        <div className="inputs-container">
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <InputText 
                  name="firstName"
                  placeholder="First Name" 
                  onChange={handleChange} 
                  label="First Name"/>       
            </div>
            <div className="input-group">
             <InputText  
                name="lastName"  
                placeholder="Last Name" 
                onChange={handleChange} 
                label="Last Name" />       
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
             <InputText 
                name="accountName"  
                placeholder="Account Name" 
                onChange={handleChange} 
                label="Account Name"/>       
            </div>
            <div className="input-group">
            <InputText
                    className="user-password"
                    name="password"  
                    placeholder="password"
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    hasError={passwordError.length>0}
                    errorMessage={passwordError}
            
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>{setShowPassword(!showPassword)}}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon name="Eye" size={25}/>
                  </button>
            </div>
          </div>

          <div className="checkboxes">
            <div className="checkbox-group">
              <label className='checkbox-text'>
                <Checkbox checked={acceptTerms} onChange={()=> setAcceptTerms(!acceptTerms)} label="Accept privacy policy and terms and conditions"></Checkbox>
              </label>
            </div>

            <div className="checkbox-group">
              <label className='checkbox-text'>
                <Checkbox checked={formData.sendNews} onChange={() =>{setFormData((prev) => ({ ...prev, ['sendNews']: !prev['sendNews'] }))}}  label="Send me news and offers"></Checkbox>
              </label>
            </div>
          </div>
            <Button className="complete-button" disabled={!acceptTerms || isLoading }  loading={isLoading}>Complete</Button>
            </form>
        </div>
        
      </Card>
    </div>
  );
};

export default Register;
