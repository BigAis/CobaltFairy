import axios from 'axios';

const BASE_URL = 'https://fairymail.cobaltfairy.com/api'
export const checkUserExists = async (useremail) => {
  

    try {
      const response = await axios.post(`${BASE_URL}/check-user-exists`, {
          "email": useremail
      });
      return response.data;
    } catch (error) {
      throw new Error("Error during  request", error);
    }
  };

  export const checkUserCrendentials = async (useremail, password, GoogleAuthtoken) =>{


      try{
        const data = await axios.post(`${BASE_URL}/auth/local`,{
              "identifier": useremail,
              "password": password,
              "authentication": GoogleAuthtoken
          })

          saveDataToLocalStorage(data);

        }catch(error){
          throw new Error("Error during  request", error);
        }
    }  

    
  export const registerUser = async (user, GoogleAuthtoken) =>{

    try{
      const response = await axios.post(`${BASE_URL}/register-user`,{
        "email": user.email,
        "password": user.password,
        "accountName": user.accountName,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "newsletter": user.sendNews,
        "authentication": GoogleAuthtoken
    })

      saveDataToLocalStorage(response);
      console.log(response)
      return response;
      }catch(error){
        throw new Error("Error during  request", error);
      }
  }  

  const saveDataToLocalStorage = (response) =>{

    const dataToStore = {
      jwt: response.data.jwt,
      user: response.data.user, 
    };

    const serialized = encodeURIComponent(JSON.stringify(dataToStore));
    localStorage.setItem('fairymail_session', serialized);

    const unserialized = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')));

  } 

  export const generate2FA = async () => {
    
        const fairymail_session = unserializeLocalStorage()
        const jtwToken = fairymail_session.jwt
      try {
        const response = await axios.post(`${BASE_URL}/generate-2fa`,{}, {
            headers: {
              Authorization: `Bearer ${jtwToken}`,
            },
          });
        return response;

      } catch (error) {
        throw new Error("Error during  request", error);
      }
    };

    export const verify2FA = async (code_2FA) => {
        
            const fairymail_session = unserializeLocalStorage()
            const jtwToken = fairymail_session.jwt
          try {
            const response = await axios.post(`${BASE_URL}/verify-2fa`,  {
               confirmationToken: code_2FA      
              },
              {
                headers: {
                  Authorization:  `Bearer ${jtwToken}`,
                }
              });
            return response.data;
          } catch (error) {
            throw new Error("Error during  request", error);
          }
        };


     export const forgotPassword = async (email, password) => {
        
          const fairymail_session = unserializeLocalStorage()
          const jtwToken = fairymail_session.jwt
        try {
          const response = await axios.post(`${BASE_URL}//forgot-password`,  {
            identifier: code_2FA      
            },
            {
              headers: {
                Authorization:  `Bearer ${jtwToken}`,
              }
            });
          return response.data;
        } catch (error) {
          throw new Error("Error during  request", error);
        }
      };
    
  

    const unserializeLocalStorage = () =>{
        const unserialized = JSON.parse(decodeURIComponent(localStorage.getItem('fairymail_session')));
        return unserialized;
    } 