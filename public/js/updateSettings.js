/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type = userData or password
export const updateSettings = async (type, data) => { console.log(type, data)
  try {
    const path = `${type === 'userData'?'users/updateMe':'auth/updatePassword'}`
    console.log(path)
    const res = await axios({
      url: `http://localhost:3001/api/v1/${path}`,
      data,
      method: 'PATCH',
    });
    if (res.data && res.data.status === 'Success') {
        showAlert('success', 'Updated the user details successfully');
        location.reload(true)
      }
  } catch (error) {
    if (error.response && error.response.data) {
        showAlert('error', error.response.data.message);
      }
  }
};
