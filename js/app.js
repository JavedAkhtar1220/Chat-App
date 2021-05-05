firebase.auth().onAuthStateChanged(user => {
    if (user) {
        window.location = "src/Dashboard/dashboard.html";
    } else {
        window.location = "src/Login/login.html";
    }
  });