import React, { useState, useEffect } from "react";
import Logo from "../../../components/Logo/Logo";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import InputText from "../../../components/InputText/InputText";
import { useLocation, useNavigate } from "react-router-dom";
import { generate2FA, verify2FA } from "../../../service/two-factor-login-service";
import TwoFactorInput from "./TwoFactorAuth/TFA";
import "./two-factor-login.scss"; 

const TwoFactorLogin = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation(); 
  const data = location.state; 
  const navigate = useNavigate();

   useEffect( () => {

    const generateCode = async () => {
     try {
          const respone = await generate2FA();
          if(respone.code == 200) throw new Error("Generating2FA failed. Please try again.");
        } catch (error) {
          console.error("Error during generating2FA:", error);
          alert("Something went wrong during 2FA.");
        } 
      }
      generateCode();
   },)

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); 
    if (value.length <= 6) {
      setCode(value); 
    }
  };

  const handleSubmit = async () => {
    if (code.length === 6) {
      try {
        const respone = await verify2FA(code);
        if(respone.code == 200) throw new Error("Registration failed. Please try again.");
        navigate("/dashboard")
      } catch (error) {
        console.error("Error during generating2FA:", error);
        alert("Something went wrong during 2FA.");
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
            onClick={() =>{ navigate('/login')}}
            type={'link'} 
            icon="Caret"
            >Back
            </Button>
        <h1>Enter One-Time Code</h1>
        <p>A one-time code has been sent to:</p>
        <p>{data?.email ? data?.email : "demo@cobaltfairy.com" }</p>
        <form     className="email-form"
                  onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                  }}>
        <div className="code-input-wrapper">
          {Array(6)
            .fill("")
            .map((_, index) => (
              <div key={index} className="code-box">
                {code[index] || ""}
              </div>
            ))}
          <InputText
            className="hidden-input"
            value={code}
            onChange={handleInputChange}
          />
          
        </div>
            <Button className="complete-button" disabled={ isLoading }  loading={isLoading}>Complete</Button>

          </form>
          <p className="change-email" onClick={() =>{navigate("/login");}}>Change Email</p>
          <TwoFactorInput />
     </Card>
    </div>
  );
};

export default TwoFactorLogin;
