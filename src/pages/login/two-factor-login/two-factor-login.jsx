import React, { useState, useEffect } from "react";
import Logo from "../../../components/Logo/Logo";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { generate2FA, verify2FA } from "../../../service/two-factor-login-service";
import TwoFactorInput from "./TwoFactorAuth/TwoFactorInput";
import "./two-factor-login.scss";

const TwoFactorLogin = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // Timer for resend
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const data = location.state;
  const navigate = useNavigate();

  useEffect(() => {
    const generateCode = async () => {
      try {
        const response = await generate2FA();
        console.log("Code sent successfully.");
      } catch (error) {
        console.error("Error during generating 2FA:", error);
        alert("Something went wrong during 2FA.");
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
    generateCode();
    
  };

  const handleSubmit = async () => {
    if (code.length === 6) {
      setIsLoading(true);
      try {
        const response = await verify2FA(code);
        if (response.code !== 200) {
          throw new Error("Verification failed. Please try again.");
        }
        navigate("/dashboard");
      } catch (error) {
        console.error("Error during verification:", error);
        alert("Something went wrong during 2FA.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a 6-digit code.");
    }
  };

  return (
    <div className="two-factor-login-component">
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
        <p>{data?.email ? data?.email : "demo@cobaltfairy.com"}</p>
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
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
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
