import "./login.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Logo from "../../components/Logo/Logo";
import InputText from "../../components/InputText/InputText";
import { checkUserExists } from "../../service/api-service";
import Checkbox from "../../components/Checkbox";
import Card from "../../components/Card";
import Icon from "../../components/Icon/Icon";

const LogIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailError,setEmailError] = useState('')
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const checkEmail = async () => {
    if(!email || !email.includes('@') || !email.includes('.')) {
      setEmailError('Please type a valid email address.');
      return
    }
    setIsLoading(true);
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

    console.log(email);
  };
  return (
    <div className="login-wrapper">
      <Logo />
      <Card>
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
                    onChange={(e) => {setEmail(e.target.value);setEmailError('')}}
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
                    hasError={false}
                    errorMessage="Name must be at least 3 characters long."
                    style={{width:'100%'}}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={togglePassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Icon name="Eye" size={25}/>
                  </button>
                </div>
              </div>

              <label class="remember-me">
                <Checkbox
                  className="remember-me"
                  checked={true}
                  label="Remember Me"
                ></Checkbox>
              </label>

              <Button className="complete-button" onClick={()=>{navigate('/dashboard')}}>Complete</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LogIn;
