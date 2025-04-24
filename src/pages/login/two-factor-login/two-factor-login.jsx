import "./two-factor-login.scss";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generate2FA, verify2FA } from "../../../service/api-service";
import Logo from "../../../components/Logo/Logo";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import TwoFactorInput from "./TwoFactorAuth/TwoFactorInput";
import NotificationBar from "../../../components/NotificationBar/NotificationBar";

const TwoFactorLogin = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  
  const navigate = useNavigate();

  const data = location.state;
  const form = location.state?.formData || null; 

  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    // Check if we have the necessary state data
    if (!location.state || !location.state.email) {
      navigate("/login", { replace: true });
      return;
    }
    
    const generateCode = async () => {
      try {
        const response = await generate2FA();
        console.log("Code sent successfully.");
      } catch (error) {
        console.error("Error during generating 2FA:", error);
        setNotifications([{ id: Date.now(), message: 'Error sending verification code', type: 'warning' }]);
      }
    };

    generateCode();

    setTimeLeft(30);
    setCanResend(false);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;
        clearInterval(timerInterval);
        setCanResend(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timerInterval); 
  }, [location.state, navigate]);

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await generate2FA();
      setNotifications([{ id: Date.now(), message: 'New One-Time Code Sent Successfully.', type: 'default' }]);
      setTimeLeft(30);
      setCanResend(false);
      setCode("");

      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(timerInterval);
          setCanResend(true);
          return 0;
        });
      }, 1000);
    } catch (error) {
      console.error("Error during resend:", error);
      setNotifications([{ id: Date.now(), message: 'Failed to resend code', type: 'warning' }]);
    }
  };

  // Modified submit handler to force a page reload to ensure correct context initialization
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (code.length !== 6) {
      setNotifications([{ id: Date.now(), message: 'Please enter all 6 digits', type: 'warning' }]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verify2FA(code);
      console.log("Verification response:", response);
      
      // Check for error response
      if (response && response.code === 400) {
        throw new Error("Incorrect verification code");
      }
      
      // Force a page reload to ensure contexts are properly initialized
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("Verification error:", error);
      setNotifications([{ 
        id: Date.now(), 
        message: error.message || 'Verification failed', 
        type: 'warning' 
      }]);
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const response = await registerUser(form, GoogleAuthtoken, null);
      console.log("Registration response:", response);
      
      if (response && response.data && response.data.code === 200) {
        navigate("/dashboard", { replace: true });
      } else {
        if (response && response.data && response.data.code === 400) {
          throw new Error("A user with this email already exists");
        } else {
          throw new Error("Registration failed");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setNotifications([{ id: Date.now(), message: error.message || 'Registration failed', type: 'warning' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="two-factor-login-component">
      <div style={{position:'fixed', left:0, right:0, top:0, background:'white', zIndex: 1000}}>
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
      <Card>
      <Button
          className="back-button"
          onClick={() => {
              localStorage.removeItem('fairymail_session'); // Clear any session data to prevent redirection to dashboard
              navigate("/login");
          }}
          type={"link"}
          icon="Caret"
      >
          Back
      </Button>
        <h1>Enter One-Time Code</h1>
        <p>A one-time code has been sent to:</p>
        <p>{data?.email}</p>
        <form
          className="email-form"
          onSubmit={handleSubmit}
        >
          <TwoFactorInput 
            value={code} 
            onChange={setCode} 
            onIncompleteSubmit={() => {
              setNotifications([{ 
                id: Date.now(), 
                message: 'Please enter all 6 digits', 
                type: 'warning' 
              }]);
            }}
          />
          <Button
            className="complete-button"
            disabled={isLoading}
            loading={isLoading}
            type="submit"
          >
            Complete
          </Button>
        </form>

        <div className="action-links">
          <p
            className={`resend-code ${canResend ? "" : "disabled"}`}
            onClick={handleResend}
            style={{
              cursor: canResend ? "pointer" : "not-allowed",
              opacity: canResend ? 1 : 0.5,
            }}
          >
            {canResend ? "Resend Code" : `Resend in 0:${timeLeft.toString().padStart(2, "0")}`}
          </p>

          <p
              className="change-email"
              onClick={() => {
                  localStorage.removeItem('fairymail_session'); // Clear session data
                  navigate("/login");
              }}
          >
              Change Email
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TwoFactorLogin;