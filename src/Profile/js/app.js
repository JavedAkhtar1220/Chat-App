var db = firebase.database();
var storage = firebase.storage();
var currentUser;

firebase.auth().onAuthStateChanged(user => {

    if (user) {
        var getData = new Promise((resolve, reject) => {
            db.ref("users").child(user.uid).once("value", snapshot => {
                currentUser = snapshot.val();
                resolve(currentUser);
            })
        })

        getData.then(data => {
            document.getElementById("username").value = data.username;
            document.getElementById("email").value = data.email;
            document.getElementById("profilePic").setAttribute("src", data.profile_Pic);
            profilePic.style.marginTop = "0%"; 
            document.getElementById("gender").value = data.gender;
        })
            .then(() => {
                document.getElementById("loading").style.display = "none";
            })
            .catch(err => {
                console.log(err);
            })
    }
    else {
        window.location = "../Login/login.html";
    }
})

// For Preview Image 

const inpFile = document.getElementById("inpFile");
var profilePic = document.getElementById("profilePic");

inpFile.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        var pattern = /image-*/;
        if (!file.type.match(pattern)) {
            alert('Invalid format');
            return false;
        }

        const reader = new FileReader();

        profilePic.style.display = "block";

        reader.addEventListener("load", function () {
            profilePic.setAttribute("src", this.result);
            profilePic.style.marginTop = "0%";

        });
        reader.readAsDataURL(file);
    }
})

function updateProfile() {

    var file = document.getElementById("inpFile").files[0];
    var pattern = /image-*/;

    if (inpFile.value == "") {
        alert("Please Select Profile Picture");
        return false;
    }

    if (!file.type.match(pattern)) {
        alert('Invalid format');
        return false;
    }
    document.getElementById("btnUpdate").disabled = true;
    document.getElementById("btnUpdate").innerText = "Updating...";
    inpFile.disabled = true;

    // Create a Storage Ref 
    var storageRef = storage.ref("Profile_Pics/" + currentUser.email);

    // Upload File 
    var task = storageRef.put(file)
        .then(() => {
            storageRef.getDownloadURL()
                .then(link => {
                    db.ref("users").child(currentUser.uid).update({
                        profile_Pic: link,
                    })
                })
                .then(() => {
                    alert("Profile Updated Successfully");
                    document.getElementById("btnUpdate").disabled = false;
                    document.getElementById("btnUpdate").innerText = "Update Profile";
                    inpFile.disabled = false;
                })
        })
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            window.location = "../Login/login.html";
        }).catch(error => {
            console.log(error);
        });
}