import './login.scss';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';

const LogIn = () => {

 const navigate = useNavigate();

    return (
        <div className="login-wrapper">
            <div className="container">
                <div className="header-info">
                    <header>
                        <h1>Welcome</h1>
                        <p>Enter your email to sign in or join</p>
                    </header>
                </div>
                <div className="login-options">
                    <button className="google-login-btn">
                        <img className="google-logo" alt="Google Logo" src="Googlelogo.svg"  />
                         Continue with Google
                    </button>
                    <div className="breakpoint-or">
                        <span>or</span>
                    </div> 
                    <form className="email-form">
                        <InputText placeholder="Enter your email" label="Enter your email" hasError={false} errorMessage="Name must be at least 3 characters long." />
                        <Button  onClick={() => navigate("/register")}>Continue</Button>                
                    </form>
                </div>
            </div>
        </div>
    );
};
  

export default LogIn;

