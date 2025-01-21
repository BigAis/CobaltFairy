import "./login.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleReCaptchaProvider, GoogleReCaptcha } from "react-google-recaptcha-v3";
import { checkUserExists, checkUserCrendentials, forgotPassword, googleLogIn } from "../../service/api-service";
import { useGoogleLogin  } from '@react-oauth/google';
import Button from "../../components/Button";
import Logo from "../../components/Logo/Logo";
import InputText from "../../components/InputText/InputText";
import Checkbox from "../../components/Checkbox";
import Card from "../../components/Card";
import Icon from "../../components/Icon/Icon";
import NotificationBar from "../../components/NotificationBar/NotificationBar";

const LogIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError,setPasswordError] = useState('')
  const [password, setPassword] = useState("");
  const [emailError,setEmailError] = useState('')
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const [reCaptchaToken, setReCaptchaToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [notifications, setNotifications] = useState([])

  const navigate = useNavigate();

	const handleRemoveNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}

  const checkEmail = async () => {
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!email || !emailRegex.test(email)) {
      setEmailError('Please type a valid email address.');
      setIsLoading(false);
      return
    }

      const respone = await checkUserExists(email);
      console.log(respone)
      respone ? setIsValidUser(true) : navigate("/register", { state: { email } });

      setIsLoading(false);
    
  };

  const checkValidPassword = async  () => {
     setIsLoading(true);

      if (!password || password.length < 6) {
        setPasswordError('Invalid Password')
        setIsLoading(false);
        return
      }

      const respone = await checkUserCrendentials(email, password, reCaptchaToken );
      if(respone === true){ navigate("/login/2FA", { state: { email } });
       }else{
          console.error();
          setRefreshReCaptcha(!refreshReCaptcha);
          setNotifications([{ id: 1, message: 'Wrong Crendetials.', type: 'warning' }])
        }

      setIsLoading(false);
  };

  const resetPassword = async  () => {
    setIsLoading(true);
    
      const respone = await forgotPassword(email);
      if(respone === true){
        setNotifications([{ id: 1, message: `We've sent you an email with a password reset link, Please check your inbox and follow the instructions.`, type: 'default' }])
      }else{
        setNotifications([{ id: 1, message: `${error}`, type: 'warning' }])
        setRefreshReCaptcha(!refreshReCaptcha);
      }
    setIsLoading(false);
    
  };

  const login = useGoogleLogin({
    onSuccess: tokenResponse => googleSignIn(tokenResponse),
  });

    const googleSignIn = async (tokenResponse) => {
       setIsLoading(true);
  
        const respone = await googleLogIn(tokenResponse);
       
        if(respone.data.code == 200){
          navigate("/dashboard")
        }else if(respone.data.code == 201){
          navigate("/register", { state: { isGoogleSignIn: true, userData: respone.data.data, googleSignInToken: tokenResponse } })
        }  
        setIsLoading(false);
      
      
      
    };

  return (
    <GoogleReCaptchaProvider reCaptchaKey={"6LcZZbkqAAAAAKGBvr79Mj42sMIQf86Z7A31xdbo"}>
    <GoogleReCaptcha className="google-recaptcha-custom-class"
      onVerify={setReCaptchaToken}
      refreshReCaptcha={refreshReCaptcha}
/>
    <div className="login-wrapper">
      <div style={{position:'fixed',left:0,right:0,top:0,background:'white'}}>
        {notifications.map((notification) => (
          <NotificationBar
            key={notification.id}
            message={notification.message}
            type={notification.type} 
            onClose={() => handleRemoveNotification(notification.id)} 
          />
        ))}
      </div>
      <Logo />
      <Card className="card">
        <div className="container">
          {!isValidUser ? (
            <>
              <div className="header-info">
                <header>
                  <h1>Welcome</h1>
                  <p>Enter your email to sign in or join</p>
                </header>
              </div>
              <div className="login-options">
                <button className="google-login-btn"
                  onClick={() => login()}>
                  <img
                    className="google-logo"
                    alt="Google Logo"
                    src="/images/Googlelogo.svg"
                  />
                  Continue with Google
                </button>
                <div className="breakpoint-or">
                  <span>or</span>
                </div>
                <form
                  className="email-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkEmail(email);
                  }}
                >
                  <InputText
                    onChange={(e) => {setEmail(e.target.value);setEmailError('');setIsLoading(false);}}
                    placeholder="Enter your email"
                    label="Enter your email"
                    hasError={emailError.length>0}
                    errorMessage={emailError}
                  />
                  <Button disabled={isLoading} loading={isLoading} type="submit">
                    Continue
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Button 
                className="back-button"
                onClick={() => setIsValidUser(!isValidUser)}
                type={'link'} 
                icon="Caret"
                >Back
                </Button>

              <div className="header-info">
                <header>
                  <h1>Welcome</h1>
                  <p>Type in the password for the account</p>
                  <p>{email}</p>
                </header>
              </div>

              <form onSubmit={(e) => {
                    e.preventDefault();
                  }}>
              <div className="input-rows">
                <div className="input-groups">
              
                  <InputText
                    className="user-password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    hasError={passwordError.length>0}
                    errorMessage={passwordError}
                    style={{width:'100%'}}
                    onChange={(e) => {setPassword(e.target.value);setPasswordError('')}}
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

                  <p className="forgot-password"
                    onClick={()=>{resetPassword()}}>
                      Forgot Password
                  </p>

                </div>             
              </div>           

              <label class="remember-me">
                <Checkbox
                  className="remember-me"
                  checked={true}
                  label="Remember Me"
                ></Checkbox>
              </label>
             
              <Button onClick={() => {checkValidPassword()}} className="complete-button" disabled={isLoading} loading={isLoading} type="submit">
                    Continue
               </Button>
               </form>
            </>
          )}
        </div>
      </Card>
    </div>
    </GoogleReCaptchaProvider>
  );
};

export default LogIn;
