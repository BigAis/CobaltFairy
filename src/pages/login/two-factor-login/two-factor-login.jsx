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
  const [notifications, setNotifications] = useState([])
  
  const navigate = useNavigate();

  const data = location.state;
  const form = location.state?.formData || null; 

  const handleRemoveNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}

  useEffect(() => {
    const generateCode = async () => {
      try {
        const response = await generate2FA();
        console.log("Code sent successfully.");
      } catch (error) {
        console.error("Error during generating 2FA:", error);
        setNotifications([{ id: 1, message: 'Something went Wrong', type: 'warning' }])
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
  }, []);

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await generate2FA();
      setNotifications([{ id: 1, message: 'New One-Time Code Send Succesfully.', type: 'default' }])
      setTimeLeft(30);
      setCanResend(false);
      setCode("")

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
      setNotifications([{ id: 1, message: 'Something went Wrong', type: 'warning' }])
    }
  };

  const handleSubmit = async () => {
    if (code.length === 6) {
      setIsLoading(true);
      try {
        const response = await verify2FA(code, token);
        
        if (response.code == 400) throw new Error("Wrong Verification code. Please try again.");

        if(form != null && form.length>0 ){
            registerUser();
          }
          
      } catch (error) {
        setNotifications([{ id: 1, message: `${error}`, type: 'warning' }])
      } finally {
        setIsLoading(false);
      }
    } 
  };

  const registerUser = async () =>{
    try {
      const response = await registerUser(form, GoogleAuthtoken, null);
      console.log(response);
      if (response.data.code == 200) {
        navigate("/dashboard");
      } else {
        if (response.data.code == 400) throw new Error("A user with this email already exists.");
        else throw new Error("Registration failed. Please try again.");
      }
    }
     catch (error) {
      setRefreshReCaptcha(!refreshReCaptcha);
      console.error("Error during Registration:", error);
      setNotifications([{ id: 1, message: 'Something went Wrong', type: 'warning' }])
    } finally {
      setIsLoading(false);
    }
  }

  return (

    <div className="two-factor-login-component">
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
        <h1>Enter One-Time Code</h1>
        <p>A one-time code has been sent to:</p>
        <p>{data?.email}</p>
        <form
          className="email-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <TwoFactorInput value={code} onChange={setCode} />
          <Button
            className="complete-button"
            disabled={isLoading}
            loading={isLoading}
            onIncompleteSubmit={() => {
              console.log("Code is incomplete!");
            }}
          >
            Complete
          </Button>
        </form>

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
            navigate("/login");
          }}
        >
          Change Email
        </p>
      </Card>
    </div>

  );
};

export default TwoFactorLogin;
