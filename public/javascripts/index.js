document.getElementById('username').setCustomValidity("Please do not leave the field empty.");
document.getElementById('password').setCustomValidity("Please do not leave the field empty.");

function check() {
      if(document.getElementById('username').validity.valueMissing){
            document.getElementById('username').setCustomValidity("Please do not leave the field empty.");
      }else{
            document.getElementById('username').setCustomValidity("");
      }
      if(document.getElementById('password').validity.valueMissing){
            document.getElementById('password').setCustomValidity("Please do not leave the field empty.");
      }else{
            document.getElementById('password').setCustomValidity("");
      }
}