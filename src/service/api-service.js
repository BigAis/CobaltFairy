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