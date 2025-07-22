import "./reset-password.scss"
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { isUserLoggedIn, ApiService } from "../../service/api-service";
import Card from "../../components/Card";
import Logo from "../../components/Logo/Logo";
import Button from "../../components/Button";
import Icon from "../../components/Icon/Icon";
import InputText from "../../components/InputText/InputText";
import { useAccount } from "../../context/AccountContext";

const ResetPassword = () => {
    const { createNotification } = useAccount();
    const { id } = useParams();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation(); 
    const data = location.state; 

    useEffect(() => {
        if(isUserLoggedIn()) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const checkValidPassword = async () => {
        setIsLoading(true);
        setPasswordError('');
    
        // Validate passwords
        if (!password1 || password1.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        if (!password2 || password2.length < 6) {
            setPasswordError('Confirmation password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        if (password1 !== password2) {
            setPasswordError('Passwords don\'t match');
            setIsLoading(false);
            return;
        }
        
        // Make the API request to change the password
        try {
            const response = await fetch(`${ApiService.BASE_URL}/fairymailer/do-change-user-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: id,
                    password: password1,
                    password2: password2
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.code === 200) {
                // Password changed successfully
                createNotification({
                    message: 'Password has been reset successfully. You can now log in with your new password.',
                    type: 'default'
                });
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // Handle error
                const errorMessage = data.message || 'Failed to reset password. Please try again.';
                setPasswordError(errorMessage);
                createNotification({
                    message: errorMessage,
                    type: 'warning'
                });
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setPasswordError('Network error. Please try again.');
            createNotification({
                message: 'Network error. Please try again.',
                type: 'warning'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-component">
            <Logo/>
            <Card>
                <Button
                    className="back-button"
                    onClick={() => {
                        navigate("/login");
                    }}
                    type={"link"}
                    icon="Caret"
                >
                    Back
                </Button>

                <h1>Reset Password</h1>
                <p>Change the account password</p>
                {data?.email && <p>{data.email}</p>}
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    checkValidPassword();
                }}>
                    <div className="input-rows">
                        <div className="input-groups">       
                            <InputText
                                className="user-password"
                                placeholder="Password"
                                type={showPassword1 ? "text" : "password"}
                                label="Your new password"
                                hasError={passwordError.length > 0}
                                errorMessage={passwordError}
                                style={{width:'100%'}}
                                onChange={(e) => {
                                    setPassword1(e.target.value);
                                    setPasswordError('');
                                }}
                                value={password1}
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() => {
                                    setShowPassword1(!showPassword1);
                                }}
                                aria-label={
                                    showPassword1 ? "Hide password" : "Show password"
                                }
                            >
                                <Icon name="Eye" size={25}/>
                            </button>
                        </div>             
                    </div>

                    <div className="input-rows">
                        <div className="input-groups">         
                            <InputText
                                className="user-password"
                                placeholder="Password"
                                type={showPassword2 ? "text" : "password"}
                                label="Repeat the new password"
                                hasError={passwordError.length > 0}
                                errorMessage={passwordError}
                                style={{width:'100%'}}
                                onChange={(e) => {
                                    setPassword2(e.target.value);
                                    setPasswordError('');
                                }}
                                value={password2}
                            />
                            <button
                                type="button"
                                className="eye-button"
                                onClick={() => {
                                    setShowPassword2(!showPassword2);
                                }}
                                aria-label={
                                    showPassword2 ? "Hide password" : "Show password"
                                }
                            >
                                <Icon name="Eye" size={25}/>
                            </button>
                        </div>             
                    </div>

                    <Button 
                        className="complete-button" 
                        disabled={isLoading} 
                        loading={isLoading} 
                        type="submit"
                    >
                        Continue
                    </Button>    
                </form>
            </Card>
        </div>
    );
};
 
export default ResetPassword;