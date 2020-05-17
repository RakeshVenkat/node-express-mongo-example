/* eslint-disable */

import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// DOM elements
const loginFormEl = document.querySelector('.form__login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserFormEl = document.querySelector('.form-user-data');
const updatePasswordFormEl = document.querySelector('.form-user-password');

if (loginFormEl) {
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

if (updateUserFormEl) {
  updateUserFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;

    updateSettings('userData',{name, email});
  });
}


if(updatePasswordFormEl){
  updatePasswordFormEl.addEventListener('submit', e => {
    e.preventDefault()
    const currentPassword = e.target.passwordCurrent.value
    const newPassword = e.target.password.value
    const passwordConfirm = e.target.passwordConfirm.value

    updateSettings('password', {currentPassword, newPassword, passwordConfirm})
  })
}