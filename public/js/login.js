/* eslint-disable */
import axios from 'axios';
import '@babel/polyfill';

import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      url: 'http://localhost:3001/api/v1/auth/login',
      method: 'POST',
      data: {
        email,
        password,
      },
    });
    if (res.data && res.data.status === 'Success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => {
        window.location.assign('/');
      }, 500);
    }
  } catch (error) {
    if (error.response) {
      console.error(error.response);
      showAlert('error', error.response.data.message);
    }
  }
};

export const logout = async (req, res, next) => {
  try {
    const res = await axios({
      url: `http://localhost:3001/api/v1/auth/logout`,
      method: 'GET',
    }); console.log('here:',location.pathname)
    if (res.data && res.data.status === 'success') {
      if (location.pathname === '/about-me') {
        location.replace('/');
      } else { console.log(location.pathname)
        location.reload(true);
      }

      // If Cookie expiry is set, you need to wait for that expiry to reload!!
    }
  } catch (error) {
    if (error.response) {
      console.error(error.response);
      showAlert('error', error.response.data.message);
    }
  }
};

// Axios error response format
/*
 {
    "status": "fail",
    "message": "User with the email or password doesnt exist!!",
    "error": {
        "statusCode": 401,
        "status": "fail",
        "isOperational": true
    },
    "stack": "Error: User with the email or password doesnt exist!!\n    at C:\\Programming\\nodejs\\node-express-mongo-example\\controllers\\authController.js:64:11\n    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
}

*/
