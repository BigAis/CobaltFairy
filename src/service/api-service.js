import axios from 'axios';

export const checkUserExists = async (useremail) => {
  
  const BASE_URL = 'https://fairymail.cobaltfairy.com/api/check-user-exists';

  console.log("HELLO WORJD" + useremail)
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
          let serialized = encodeURIComponent(JSON.stringify(data));
          localStorage.setItem('user',serialized);

          let unserialized = JSON.parse(decodeURIComponent(localStorage.getItem('user')))
          console.log(unserialized);

          localStorage.setItem('jwtToken', data.data.jwt )
        }catch(error){
          throw new Error("Error during  request", error);
        }
    }  