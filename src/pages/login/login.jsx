import "./login.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Logo from "../../components/Logo/Logo";
import InputText from "../../components/InputText/InputText";
import { checkUserExists, checkUserCrendentials } from "../../service/api-service";
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
  const navigate = useNavigate();

	const [notifications, setNotifications] = useState([])

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
    try {
      const respone = await checkUserExists(email);
      respone.exists
        ? setIsValidUser(true)
        : navigate("/register", { state: { email } });
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkValidPassword = async  () => {
    setIsLoading(true);

    if (!password || password.length < 6) {
      setPasswordError('Invalid Password')
      setIsLoading(false);

      return
    }
    try {
      const respone = await checkUserCrendentials(email,password);
      navigate("/login/2FA", { state: { email } });
    } catch (error) {
      console.error("Error during login:", error);
      setNotifications([{ id: 1, message: 'Wrong Crendetials.', type: 'warning' }])
        } finally {
      setIsLoading(false);
    }


  }



  return (
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
                <button className="google-login-btn">
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
                  <p>Complete the account for the email</p>
                  <p>{email}</p>
                </header>
              </div>

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
                  <p className="forgot-password">Forgot Password</p>
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
               
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LogIn;
