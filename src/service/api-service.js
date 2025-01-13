import axios from 'axios';

export const checkUserExists = async (useremail) => {
  
  const BASE_URL = 'https://fairymail.cobaltfairy.com/api/check-user-exists';

    try {
      const response = await axios.post(`${BASE_URL}`, {
          "email": useremail
      });
      return response.data;
    } catch (error) {
      throw new Error("Error during  request", error);
    }
  };

  export const checkUserCrendentials = async (useremail,password) =>{

      const BASE_URL = 'https://fairymail.cobaltfairy.com/api/auth/local';

      try{
        const data = await axios.post(`${BASE_URL}`,{
              "identifier": useremail,
              "password": password
          })

          saveDataToLocalStorage(data);

        }catch(error){
          throw new Error("Error during  request", error);
        }
    }  

    
  export const registerUser = async (user) =>{

    const BASE_URL = 'https://fairymail.cobaltfairy.com/api/register-user';

    try{
      const response = await axios.post(`${BASE_URL}`,{
        "email": user.email,
        "password": user.password,
        "accountName": user.accountName,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "newsletter": user.sendNews
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
    console.log(unserialized);

  } 