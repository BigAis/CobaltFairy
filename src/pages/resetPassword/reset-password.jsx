import "./reset-password.scss"
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";
import Card from "../../components/Card";
import Logo from "../../components/Logo/Logo";
import Button from "../../components/Button";
import Icon from "../../components/Icon/Icon";
import InputText from "../../components/InputText/InputText";

const ResetPassword = () => {

    const { id } = useParams();
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [passwordError,setPasswordError] = useState('')
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const navigate = useNavigate();
    const location = useLocation(); 
    const data = location.state; 

    const handleRemoveNotification = (id) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id))
	}

    const checkValidPassword = async  () => {
       
        setIsLoading(true);
    
        if (!password1 || password1.length < 6) {
          setPasswordError('Invalid Password')
          setIsLoading(false);
          return
        }

        if (!password2 || password2.length < 6) {
            setPasswordError('Invalid Password')
            setIsLoading(false);
            return
          }

          if (password1 != password2) {
            setPasswordError('Passwords dont match')
            setIsLoading(false);
            return
          }
          console.log(password1)
          console.log(password2)

          console.log(id)
// Insert API for change pass word
          setIsLoading(false);
      }
    


    return ( <div className="reset-password-component">
       <Logo/>
       <Card>
            <Button
                className="back-button"
                onClick={() => {
                    navigate("/login");}}
                type={"link"}
                icon="Caret"
                >
            Back
            </Button>

            <h1>Reset Password</h1>
            <p>Change the account password</p>
            <p>{data?.email}</p>       
            <form onSubmit={(e) => {
                    e.preventDefault();
                  }}>

                  <div className="input-rows">
                        <div className="input-groups">       
                            <InputText
                                className="user-password"
                                placeholder="Password"
                                type={showPassword1 ? "text" : "password"}
                                label="Your new password"
                                hasError={passwordError.length>0}
                                errorMessage={passwordError}
                                style={{width:'100%'}}
                                onChange={(e) => {setPassword1(e.target.value);setPasswordError('')}}
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() =>{setShowPassword1(!showPassword1)}}
                                aria-label={
                                    showPassword1 ? "Hide password" : "Show password" }
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
                                hasError={passwordError.length>0}
                                errorMessage={passwordError}
                                style={{width:'100%'}}
                                onChange={(e) => {setPassword2(e.target.value);setPasswordError('')}}
                            />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() =>{setShowPassword2(!showPassword2)}}
                                    aria-label={
                                        showPassword2 ? "Hide password" : "Show password"
                                    }
                                >
                                    <Icon name="Eye" size={25}/>
                                </button>
                        </div>             
                    </div>

                    <Button onClick={() => {checkValidPassword()}} className="complete-button" disabled={isLoading} loading={isLoading} type="submit">
                        Continue
                    </Button>    

            </form>

       </Card>

    </div> );
}
 
export default ResetPassword;