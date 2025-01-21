import './register.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleReCaptchaProvider, GoogleReCaptcha } from "react-google-recaptcha-v3";
import { registerUser } from '../../service/api-service';
import InputText from '../../components/InputText/InputText';
import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Logo from '../../components/Logo/Logo';
import Icon from '../../components/Icon/Icon';

const Register = () => {

  const [reCaptchaToken, setReCaptchaToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError,setPasswordError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    accountName: '',
    email: '',
    password: '',
    sendNews: false
  });

  const navigate = useNavigate();
  const location = useLocation(); 
  const data = location.state; 

  useEffect(() =>{

    console.log(data)

    if( data?.isGoogleSignIn){
      console.log("pass")

      setIsGoogleSignIn(true);
      setFormData((prev) => ({ ...prev, email: data.userData.email }));
      setFormData((prev) => ({ ...prev, lastName: data.userData.last_name }));
      setFormData((prev) => ({ ...prev, firstName: data.userData.first_name }));
    }

    if (data?.email) {
      setFormData((prev) => ({ ...prev, email: data.email }));
    }

    console.log(formData)
  },[data]) 

  const checkForm = () => {
    if(isGoogleSignIn) return true

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

      if(isGoogleSignIn){
          const response = await registerUser(form, GoogleAuthtoken, data.googleSignInToken);

          if (response) {
            navigate("/dashboard");
          } else {
             setRefreshReCaptcha(!refreshReCaptcha);
             console.error("Error during Registration:", error);
             setNotifications([{ id: 1, message: 'Something went Wrong', type: 'warning' }]);
          }

      }else if(checkForm()){
          navigate("/login/2FA", { state: { email: data.email } });
      }else setNotifications([{ id: 1, message: 'Something went Wrong', type: 'warning' }]);
   
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('')
  };
  

  return (
    <GoogleReCaptchaProvider reCaptchaKey={"6LcZZbkqAAAAAKGBvr79Mj42sMIQf86Z7A31xdbo"}>
    <GoogleReCaptcha className="google-recaptcha-custom-class"
      onVerify={setReCaptchaToken}
      refreshReCaptcha={refreshReCaptcha}
/>
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
                  value={formData.firstName}
                  placeholder="First Name" 
                  onChange={handleChange} 
                  label="First Name"/>       
            </div>
            <div className="input-group">
             <InputText  
                name="lastName"  
                value={formData.lastName}
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
            {!isGoogleSignIn &&
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
            }
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
    </GoogleReCaptchaProvider>

  );
};

export default Register;
