import axios from 'axios';

export const generate2FA = async () => {
  
    const BASE_URL = 'https://fairymail.cobaltfairy.com/api/generate-2fa';
  
        const fairymail_session = unserializeLocalStorage()
        const jtwToken = fairymail_session.jwt
      try {
        const response = await axios.post(`${BASE_URL}`,{}, {
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
  
        const BASE_URL = 'https://fairymail.cobaltfairy.com/api/verify-2fa';
      
            const fairymail_session = unserializeLocalStorage()
            const jtwToken = fairymail_session.jwt
          try {
            const response = await axios.post(`${BASE_URL}`,  {
               body:{ confirmationToken: code_2FA  }       
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