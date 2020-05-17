/* eslint-disable */

export const showAlert = (type, msg) => {
  hideAlert();
  const alertPopup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', alertPopup);
  setTimeout(() => {
    hideAlert()
  }, 2000);
};
 
export const hideAlert = () => {
  let alertEl = document.querySelector('.alert');
  if (alertEl) alertEl.parentElement.removeChild(alertEl);
}; 
