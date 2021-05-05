function pageLoad() {
    document.getElementById("loading").style.display = "none";
}

function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (email == "") {
        alert("Please enter email");
        document.getElementById("email").focus();
        return
    }

    if (password == ""){
        document.getElementById("password").focus();
        alert("Please enter password");
        return;
    }
    
    document.getElementById("btn").disabled = true;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
        window.location = "../Dashboard/dashboard.html"
    })
    .catch(function (error) {
        // Handle Errors here.
        document.getElementById("btn").disabled = false;
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorMessage === "The email address is badly formatted.") {
            document.getElementById("email").focus();
        }
        alert(errorMessage);
        // ...
    });

}