let emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// User Registration form

function checkFormValidation() {

    // check Radio button is selected or not

    let type = document.querySelector('input[type="radio"][name="type"]:checked');
    if (type == "" || type == null) {
        document.querySelector('small[id="typeError"]').innerHTML = "Please select your Role";
        return false;
    } else {
        document.querySelector('small[id="typeError"]').innerHTML = "";
    }

    // check firstname is valid or not

    let firstName = document.getElementById('firstNameId').value;
    if (firstName == '') {
        document.getElementById('firstName_warning').innerHTML = "This field is required";
        return false;
    } else if (firstName.match(/^\s+$/) !== null || /^[a-zA-Z]+$/.test(firstName) == false) {
        document.getElementById('firstName_warning').innerHTML = 'This field not contain any blank space or number';
        return false;
    }
    else {
        document.getElementById('firstName_warning').innerHTML = '';
    }

    // check Lastname is valid or not

    let lastName = document.getElementById('lastNameId').value;
    if (lastName == '') {
        document.getElementById('lastName_warning').innerHTML = "This field is required";
        return false;
    } else if (lastName.match(/^\s+$/) !== null || /^[a-zA-Z]+$/.test(lastName) == false) {
        document.getElementById('lastName_warning').innerHTML = 'This field not contain any blank space or number';
        return false;
    }
    else {
        document.getElementById('lastName_warning').innerHTML = '';
    }

    // Check image is valid or not

    var fileUpload = document.getElementById("file-1").value;
    console.log('fileupload', fileUpload);
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (fileUpload == '') {
        document.getElementById("imageError").innerHTML = 'Please select an image';
        return false;
    }
    else if (allowedExtensions.exec(fileUpload)) {
        document.getElementById("imageError").innerHTML = "";
    }
    else {
        document.getElementById("imageError").innerHTML = "Please upload files having extensions: .jpg  .jpeg  .png  .gif  only.";
        return false;
    }

    // check email is valid or not

    let email = document.getElementById("email").value;
    if (email == '') {
        document.getElementById('email_warning').innerHTML = "This field is required";
        return false;
    } else if (emailFormat.test(email)) {
        document.getElementById('email_warning').innerHTML = "";
    }
    else {
        document.getElementById('email_warning').innerHTML = "Please enter a valid Email";
        return false;
    }

    // Check password is strong or not

    let regex = /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).{6,16}$/;
    let password = document.getElementById('password').value;

    if (password == '') {
        document.getElementById('passwordError').innerHTML = 'This filed is required'
        return false;
    } else if (regex.test(password)) {
        document.getElementById('passwordError').innerHTML = ''
    } else {
        document.getElementById('passwordError').innerHTML = 'password must contain atleast one Uppercase Character,one Lowercase Character,at least one Digit and one Special Symbol and must be 6-16 character';
        return false;
    }

    // checkbox is checked or not

    let chekbox = isChecked.checked
    if (!chekbox) {
        document.getElementById('checkBoxError').innerHTML = 'Please accept all terms and condition';
        return false;
    } else {
        document.getElementById('checkBoxError').innerHTML = '';
    }
}

// Check mail is valid or not

function checkMailIsExist() {
    console.log('execute');
    let userSignupEmail = document.getElementById("email").value;
    if (emailFormat.test(userSignupEmail)) {
        $.ajax({
            type: 'POST',
            url: "/email_verify",
            data: { email: userSignupEmail },
            dataType: "json",
            success: function (data) {
                if (data.success) {
                    document.getElementById('email_warning').innerHTML = data.message;
                    document.getElementById("submit_id").disabled = true;
                }
                else {
                    document.getElementById('email_warning').innerHTML = '';
                    document.getElementById("submit_id").disabled = false;
                }
            }
        });
    }
}

// match password and confirm password

$('#password, #confirm_password').on('keyup', function () {
    $(".modal-otp-in").show();
    if (($('#password').val() == $('#confirm_password').val()) && $('#password').val() != '') {
        $('#message').html('Matching').css('color', 'green');
    } else
        $('#message').html('password should be match ').css('color', 'red');
});

// ************ User Login form ****************

$("#submitLoginForm").submit(function (event) {
    var loginEmail = document.getElementById("userEmail").value;
    var loginPass = document.getElementById("userPass").value;
    if (loginEmail == '') {
        document.getElementById("userEmailError").innerHTML = '';
        document.getElementById('userEmailError').innerHTML = "This field is required";
        return false;
    } else if (!emailFormat.test(loginEmail)) {
        document.getElementById("userPassError").innerHTML = '';
        document.getElementById("userEmailError").innerHTML = 'Email must be a valid email';
    }
    else {
        if (loginPass == '') {
            document.getElementById("userPassError").innerHTML = 'This field is required';
            document.getElementById('userEmailError').innerHTML = "";
            return false;
        } else {
            loginAjaxCalling(loginEmail, loginPass);
        }
    }
    event.preventDefault();
});

// Ajax for login  

function loginAjaxCalling(email, password) {
    $.ajax({
        type: 'POST',
        url: "/login",
        data: { email: email, password: password },
        dataType: "json",
        async: false,
        success: function (data) {
            console.log('data', data);
            if (data.success) { 
                location.href = 'http://localhost:3300'
            } else if (data.isEmailVerify == '0') {
                document.getElementById('userPassError').innerHTML = data.message;
            }
            else {
                console.log('error', data.message);
                document.getElementById('userPassError').innerHTML = data.message;
            }
        }
    });
    return true;
}

// Forget Password using ajax method

$('#forgetPassword').submit((e) => {
    let email = $('#forgetPassEmail').val();
    console.log('email', email);
    if (email == '') {
        document.getElementById('forgetEmailError').innerHTML = "This field is required";
        return false;
    } else {
        $.ajax({
            type: 'POST',
            url: "/forget_pasword",
            data: { email: email },
            dataType: "json",
            async: false,
            success: function (data) {
                console.log('data', data);
                if (data.success) {
                    document.getElementById('forgetEmailError').innerHTML = '';
                    document.getElementById('forgetEmailSuccess').innerHTML = data.message;
                }
                else {
                    console.log('error', data.message);
                    document.getElementById('forgetEmailError').innerHTML = data.message;
                }
            }
        });
    }
    e.preventDefault();
});

// ResendMail using ajax method

$('#resendMail').submit((e) => {
    let email = $('#resendEmail').val();
    console.log('email', email);
    if (email == '') {
        document.getElementById('resendEmailError').innerHTML = "This field is required";
        return false;
    } else {
        $.ajax({
            type: 'POST',
            url: "/resendMail",
            data: { email: email },
            dataType: "json",
            async: false,
            success: function (data) {
                console.log('data', data);
                if (data.success) {
                    document.getElementById('resendEmailError').innerHTML = '';
                    document.getElementById('resendEmailSuccess').innerHTML = data.message;
                }
                else {
                    console.log('error', data.message);
                    document.getElementById('resendEmailError').innerHTML = data.message;
                }
            }
        });
    }
    e.preventDefault();
});

// Toogle Password

const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#userPass");

togglePassword.addEventListener("click", function () {
    // toggle the type attribute
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
});

const toggleSignPassword = document.querySelector("#toggleSignPassword");
const pass = document.querySelector("#password");

toggleSignPassword.addEventListener("click", function () {
    // toggle the type attribute
    const type = pass.getAttribute("type") === "password" ? "text" : "password";
    pass.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
});

const toggleSignCPassword = document.querySelector("#toggleSignCPassword");
const cPass = document.querySelector("#confirm_password");

toggleSignCPassword.addEventListener("click", function () {
    // toggle the type attribute
    const type = cPass.getAttribute("type") === "password" ? "text" : "password";
    cPass.setAttribute("type", type);

    // toggle the icon
    this.classList.toggle("bi-eye");
});