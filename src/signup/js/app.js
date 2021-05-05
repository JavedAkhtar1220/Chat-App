const db = firebase.database();

function pageLoad() {
    document.getElementById("loading").style.display = "none";
}

function signup() {
    var username = document.getElementById("username").value ; 
    var email = document.getElementById("email").value ;
    var password = document.getElementById("password").value ;
    var selectGender = document.getElementById("selectGender").value;
    var validate = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var profilePic = "";

    if (username == "") {
        alert("Please enter username");
        document.getElementById("username").focus();
        return false;
    }
    
    if (username.length < 5) {
        alert("username must be 4 characters long");
        document.getElementById("username").focus();
        return false
    }

    if (username.length > 20) {
        alert("username must be less than 20 charaters");
        document.getElementById("username").focus();
        return false
    } 

    if (email == "") {
        alert("Please enter email");
        document.getElementById("email").focus();
        return false;
    }
    if (!(validate.test(email))) {
        alert("Please enter valid email")
        document.getElementById("email").focus();
        return false;
    }

    if (password == "") {
        alert("Please enter password");
        document.getElementById("password").focus();
        return false;
    }

    if (password.length < 6) {
        alert("Password must be greater than or equal to 6 charaters");
        document.getElementById("password").focus();
        return false;
    }

    if (selectGender === "Select Gender") {
        alert("Please select gender");
        document.getElementById("password").focus();
        return false;
    }

    if (selectGender === "Male") {
        profilePic = "https://www.designbust.com/assets/images/user.png";
    }
    else if (selectGender === "Female"){
        profilePic = "https://avatarfiles.alphacoders.com/791/79102.png";
    }


    document.getElementById("btn").disabled = true;
    var key = db.ref("users").push().key;
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user  => {
        db.ref("users").child(user.user.uid).set({
            username,
            email,
            uid:user.user.uid,
            chat_ID: key,
            gender:selectGender,
            profile_Pic:profilePic,
        })
        .then(() => {
            window.location = "../Login/login.html"
        })
    })
    .catch(error => {
        document.getElementById("btn").disabled = false;
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
}