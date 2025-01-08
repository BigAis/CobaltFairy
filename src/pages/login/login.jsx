import './login.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import InputText from '../../components/InputText/InputText';
import { checkUserExists } from '../../service/api-service';
import Checkbox from '../../components/Checkbox';

const LogIn = () => {
    
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidUser, setIsValidUser] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
      };

      
 const checkEmail = async () =>{
    setIsLoading(true);
    try{
        const respone = await checkUserExists(email)
        respone.exists ? setIsValidUser(true) : navigate('/register', { state: { email } })

    }catch (error){
        console.error('Error during login:', error);
          alert('Something went wrong during login.');
    }finally {
        setIsLoading(false);
      }

   console.log(email)
 } 

    return (
        <div className="login-wrapper">
            <div className="container">
                {isValidUser ? (<>
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
                    <form className="email-form" onSubmit={(e) => { e.preventDefault(); checkEmail(email);}}>
                        <InputText onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" label="Enter your email" hasError={false} errorMessage="Name must be at least 3 characters long." />
                        <Button disabled={isLoading} type="submit">
                        {isLoading ? 'Loading...' : 'Continue'}
                        </Button>                
                    </form>
                </div>
                </>):(<>
                        <button className="back-button" onClick={() => setIsValidUser(!isValidUser)}>
                          <svg width="16" height="17" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.78 4.71995C9.92045 4.86058 9.99934 5.0512 9.99934 5.24995C9.99934 5.4487 9.92045 5.63933 9.78 5.77995L7.06 8.49995L9.78 11.22C9.85368 11.2886 9.91279 11.3714 9.95378 11.4634C9.99477 11.5554 10.0168 11.6547 10.0186 11.7554C10.0204 11.8561 10.0018 11.9562 9.96412 12.0495C9.9264 12.1429 9.87025 12.2278 9.79903 12.299C9.72782 12.3702 9.64298 12.4264 9.54959 12.4641C9.45621 12.5018 9.35618 12.5203 9.25547 12.5185C9.15477 12.5168 9.05546 12.4947 8.96346 12.4537C8.87146 12.4127 8.78866 12.3536 8.72 12.28L5.47 9.02995C5.32955 8.88932 5.25066 8.6987 5.25066 8.49995C5.25066 8.3012 5.32955 8.11058 5.47 7.96995L8.72 4.71995C8.86062 4.5795 9.05125 4.50061 9.25 4.50061C9.44875 4.50061 9.63937 4.5795 9.78 4.71995Z"/>
                          </svg>
                          Back
                        </button>
                        <div className="header-info">
                          <header>
                            <h1>Welcome</h1>
                            <p>Complete the account for the email</p>
                            <p>user@email.com</p>
                          </header>
                        </div>



    <div className="input-rows">
            <div className="input-groups">
            <InputText className="user-password" placeholder="Password" type={showPassword ? "text" : "password"}  label="Password" hasError={false} errorMessage="Name must be at least 3 characters long." />       
              <button type="button" className="eye-button"  onClick={togglePassword} aria-label={showPassword ? "Hide password" : "Show password"}>
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10C8.39782 10 8.77936 9.84196 9.06066 9.56066C9.34196 9.27936 9.5 8.89782 9.5 8.5C9.5 8.10218 9.34196 7.72064 9.06066 7.43934C8.77936 7.15804 8.39782 7 8 7C7.60218 7 7.22064 7.15804 6.93934 7.43934C6.65804 7.72064 6.5 8.10218 6.5 8.5C6.5 8.89782 6.65804 9.27936 6.93934 9.56066C7.22064 9.84196 7.60218 10 8 10Z" fill="#100F1C"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.38 8.78C1.31692 8.5966 1.31692 8.39739 1.38 8.214C1.85638 6.83737 2.75019 5.64356 3.93697 4.79881C5.12375 3.95407 6.54442 3.50044 8.00114 3.5011C9.45786 3.50176 10.8781 3.95667 12.0641 4.8025C13.2501 5.64832 14.1429 6.84294 14.618 8.22C14.6811 8.40339 14.6811 8.6026 14.618 8.786C14.1418 10.163 13.2481 11.3572 12.0612 12.2022C10.8743 13.0472 9.45335 13.501 7.99636 13.5003C6.53938 13.4997 5.11888 13.0446 3.93275 12.1985C2.74661 11.3524 1.85391 10.1574 1.379 8.78H1.38ZM11 8.5C11 9.29565 10.6839 10.0587 10.1213 10.6213C9.55871 11.1839 8.79565 11.5 8 11.5C7.20435 11.5 6.44129 11.1839 5.87868 10.6213C5.31607 10.0587 5 9.29565 5 8.5C5 7.70435 5.31607 6.94129 5.87868 6.37868C6.44129 5.81607 7.20435 5.5 8 5.5C8.79565 5.5 9.55871 5.81607 10.1213 6.37868C10.6839 6.94129 11 7.70435 11 8.5Z" fill="#100F1C"/>
                </svg>
              </button>
            </div>
          </div>

         <label class="remember-me">
         <Checkbox className="remember-me" checked={true} label="Remember Me"></Checkbox>
        </label>


         <Button className="complete-button">Complete</Button>
                            
                            </>
                  ) }
            </div>
        </div>
    );
};
  

export default LogIn;

