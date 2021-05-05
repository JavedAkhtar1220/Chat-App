const db = firebase.database();
var currentUser = "";

var notification = new Audio("../../Audio/notification.mp3");

var day = new Date().getDate();
var month = new Date().getMonth();
var year = new Date().getFullYear();
let searchData = [];
var friendChatId = "";
let requestsAlreadySent = [];
var count = 0;
var currentDate = `${month + 1}/${day}/${year}`;

function getData() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {

      var getData = new Promise((resolve, reject) => {
        db.ref("users").child(user.uid).once("value", data => {
          currentUser = data.val();
          resolve(currentUser);
        });
      })


      getData.then(data => {
        db.ref("friends").child(user.uid).on("child_added", snapshot => {
          db.ref("users").child(snapshot.val().uid).once("value", info => {
            if (snapshot.val().status === "approved") {
              document.getElementById("friendList").innerHTML +=
                `
                <div class="friend" >
                  <a href="javascript:void(0)" class="px-3" onclick="messages('${snapshot.val().uid}')">
                    <div id="profilePic">
                      <img src="${info.val().profile_Pic}" alt="">
                    </div>
                    <p class="ml-3 mt-3 d-flex flex-column">
                      <span>${snapshot.val().name}</span>
                    </p>
                  </a>
                </div>
              `
            }
          })
        })
      })
        .then(() => {
          document.getElementById("loading").style.display = "none";
        })
        .catch(err => {
          console.log(err);
        })

      // friends Request Query 
      db.ref("friends").child(user.uid).on("child_added", snapshot => {
        if ((snapshot.val().status === "pending") && (snapshot.val().receiver_email === currentUser.email)) {
          count++;
          document.getElementById("requestCount").innerText = count;
          document.getElementById("requestedData").innerHTML +=
            `
            <div class="border border-dark p-3 mb-2">
              <p>
                <span class="font-weight-bold">${snapshot.val().name}</span> sent you a friend requests
                </p>
              <div>
                <button class="btn btn-primary" onclick="confirmRequest(this,'${snapshot.val().uid}')">Confirm</button>
                <button class="btn btn-danger" onclick="deleteRequest(this,'${snapshot.val().uid}')">Delete</button>
              </div>
            </div>
          `
        }
      })

      // Request Accept and delete Query 
      db.ref("friends").child(user.uid).on("child_changed", snapshot => {
        db.ref("users").child(snapshot.val().uid).once("value", info => {
          if ((snapshot.val().status === "approved")) {
            document.getElementById("friendList").innerHTML +=
             `
              <div class="friend" >
                <a href="javascript:void(0)" class="px-3" onclick="messages('${snapshot.val().uid}')">
                  <div id="profilePic">
                    <img src="${info.val().profile_Pic}" alt="">
                  </div>
                  <p class="ml-3 mt-3 d-flex flex-column">
                    <span>${snapshot.val().name}</span>
                    <span class="small">${snapshot.val().email}</span>
                  </p>
                </a>
              </div>
            `
          }
        })
      })
    }
    else {
      window.location = "../Login/login.html";
    }
  })
}

var showMessages = [];

function messages(docId) {
  document.getElementById("progressLoader").style.display = "flex";
  document.getElementById("messages").innerHTML = "";
  friendChatId = docId;

  var getMessages = new Promise((resolve, reject) => {
    db.ref("users").child(docId).once("value", friend => {
      resolve(friend.val());
    })
  })

  getMessages.then(data => {
    db.ref("chat_ID").child(currentUser.uid).child(data.chat_ID).once("value", snapshot => {
      document.getElementById("messages").innerHTML =
        `
          <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #e3f2fd;">
            <a class="navbar-brand d-flex" href="#" id="friendInfo" onclick="friendProfile('${docId}')">
              <div>
                <img class="messagePanelDp" src="${data.profile_Pic}" alt="male">
              </div>
              <div class="pl-3">
                <span class="navbar-brand mb-0 h1">${data.username}</span>
              </div>
            </a>
          </nav>          
          <ul class="mx-4 pt-3" id="messageBox">
            
          </ul>
          <div class="input-group fixed-bottom ml-auto" style="width:70%">
            <input type="text" class="form-control" placeholder="Type a message"
                aria-label="Recipient's username" aria-describedby="basic-addon2" id="message" onkeyup="showButton()">
            <div class="input-group-append">
                <button class="btn btn-primary" id="btnSendMessages" disabled onclick="sendMessage('${snapshot.val().chat_key}')">Send</button>
            </div>
          </div>
        `

      db.ref("messages").child(snapshot.val().chat_key).on("child_added", messages => {
        if (messages.val().email === currentUser.email) {
          document.getElementById("messageBox").innerHTML +=
            `
            <li class="ml-auto">
              <div class="d-flex justify-content-end">
                <span class="small blockquote-footer">${messages.val().sender_name}</span>
              </div>
              <div>
                  <p class="text-left mb-0">${messages.val().message}</p>
                  <p class="text-right mb-0 small text-muted">${messages.val().date}</p>
              </div>
            </li>
          `;
        }
        else {
          document.getElementById("messageBox").innerHTML +=
            `
            <li class="mr-auto">
              <div class="d-flex justify-content-end">
                <span class="small blockquote-footer">${messages.val().sender_name}</span>
              </div>
              <div>
                  <p class="text-left mb-0">${messages.val().message}</p>
                  <p class="text-right mb-0 small text-muted">${messages.val().date}</p>
              </div>
            </li>
          `;
          notification.play();
        }
      })
    })
  })
    .then(() => {
      document.getElementById("progressLoader").style.display = "none";
    })
    .catch(err => {
      console.log(err);
    })
}

function showButton(e) {
  var message = document.getElementById("message");

  message.addEventListener("keyup", e => {
    if (e.keyCode === 13) {
      document.getElementById("btnSendMessages").click();
    }
  })

  if (message.value.length >= 1) {
    document.getElementById("btnSendMessages").removeAttribute("disabled");
  }
  else {
    document.getElementById("btnSendMessages").disabled = true;
  }
}

function sendMessage(docId) {

  var message = document.getElementById("message").value;
  if (message.length >= 1) {
    db.ref("messages").child(docId).push({
      message,
      email: currentUser.email,
      sender_name: currentUser.username,
      date: currentDate,
    })
    document.getElementById("message").value = "";
    document.getElementById("message").focus();
    notification.play();
  }
}

function friendProfile(docId) {
  var friendInfo = document.getElementById("friendInfo");
  friendInfo.setAttribute("data-toggle", "modal");
  friendInfo.setAttribute("data-target", "#friendProfile");
  friendInfo.setAttribute("data-whatever", "@getbootstrap");

  db.ref("users").child(docId).once("value", snapshot => {
    document.getElementById("profileName").innerText = snapshot.val().username + " Profile";
    // document.getElementById("profilePicImg").src = snapshot.val().profile_Pic;
    document.getElementById("friend-Name").value = snapshot.val().username;
    document.getElementById("email").value = snapshot.val().email;
    document.getElementById("gender").value = snapshot.val().gender;
    document.getElementById("profilePicImgContainer").innerHTML =
      `
      <img src="${snapshot.val().profile_Pic}" alt="" id="profilePicImg">
      <a href="javascript:void(0)" id="fullSize" onclick="fullSizeImage('${snapshot.val().profile_Pic}')">
          <i class="fa fa-arrows-alt" aria-hidden="true"></i>
      </a>
    `
  })


}

function fullSizeImage(pic) {
  document.getElementById("fullSizeImageContainer").style.display = "block";
  document.getElementById("fullSizeProfileImage").setAttribute("src", pic);
}

function closeFullSizeImage() {
  document.getElementById("fullSizeImageContainer").style.display = "none";
}

// Complete 
function logout() {
  firebase.auth().signOut()
    .then(() => {
      window.location = "../Login/login.html";
    }).catch(error => {
      console.log(error);
    });
}


// Complete 
function searchUsers() {
  var search = document.getElementById("searchFriends").value;
  var btnSearch = document.getElementById("btnSearch");

  if (search == "") {
    alert("Enter friend email");
    return false;
  }
  else {
    // data-toggle="modal" data-target=".bd-example-modal-sm"
    btnSearch.setAttribute("data-toggle", "modal");
    btnSearch.setAttribute("data-target", ".bd-example-modal-sm");
    document.getElementById("searchFriends").value = "";

  }

  var checkUserData = new Promise((resolve, reject) => {
    db.ref("users").on("child_added", snapshot => {
      searchData.push(snapshot.val());
      resolve(searchData);
    })
  })

  checkUserData.then(data => {
    var filterUserEmail = data.filter(a => a.email === search);
    searchData = [];

    var checkIfRequestAlreadySent = new Promise((resolve, reject) => {
      db.ref("friends").once("value", snapshot => {
        if (snapshot.val() == null) {
          resolve(requestsAlreadySent);
        }
        else {
          db.ref("friends").on("child_added", snapshot => {
            requestsAlreadySent.push(snapshot.val());
            resolve(requestsAlreadySent);
          })
        }
      })
    })

    checkIfRequestAlreadySent.then(data => {

      var filterEmail = data.filter(a => (a.receiver_email === search) && (a.sender_email === currentUser.email));
      requestsAlreadySent = [];
      if (filterUserEmail.length == 0) {
        document.getElementById("searchedData").innerHTML =
          `
          <div>
              <p class="text-center">No user found</p>
          </div>
        `;
      }
      else if (filterUserEmail[0].email === currentUser.email) {
        document.getElementById("searchedData").innerHTML =
          `
            <div class="d-flex justify-content-around">
              <div>
              <img src="${filterUserEmail[0].profile_Pic}" alt="${filterUserEmail[0].username}" id="img">
              </div>
              <div>
                <p class="mb-0">${filterUserEmail[0].username}</p>
                <p class="small muted">${filterUserEmail[0].email}</p>
              </div>
            </div>
          `;
      }
      else if (filterEmail.length != 0) {
        if (filterEmail[0].receiver_email === search) {
          document.getElementById("searchedData").innerHTML =
            `
            <div class="d-flex justify-content-around">
              <div>
              <img src="${filterUserEmail[0].profile_Pic}" alt="${filterUserEmail[0].username}" id="img">
              </div>
              <div>
                <p class="mb-0">${filterEmail[0].receiver_name}</p>
                <p class="small muted">${filterEmail[0].receiver_email}</p>
              </div>
            </div>
          `;
        }
        filterEmail = [];
      }
      else {
        document.getElementById("searchedData").innerHTML =
          `
            <div class="d-flex justify-content-between">
              <div>
                <img src="${filterUserEmail[0].profile_Pic}" alt="${filterUserEmail[0].username}" id="img">
              </div>
              <div>
                <p class="mb-0">${filterUserEmail[0].username}</p>
                <p class="small muted">${filterUserEmail[0].email}</p>
              </div>
              <div>
                <a href="javascript:void(0)" onclick="sentRequest('${filterUserEmail[0].uid}')" data-dismiss="modal" aria-label="Close">
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          `;
      }
    })
  })
    .catch(err => {
      console.log(err);
    })
}


// Complete 
function sentRequest(docId) {
  var requestInfo = "";
  db.ref("users").child(docId).once("value", data => {
    requestInfo = data.val();
  })
    .then(() => {
      db.ref("friends").child(currentUser.uid).child(requestInfo.uid).set({
        name: requestInfo.username,
        email: requestInfo.email,
        uid: requestInfo.uid,
        status: "pending",
      });
    })
    .then(() => {
      db.ref("friends").child(requestInfo.uid).child(currentUser.uid).set({
        name: currentUser.username,
        receiver_email: requestInfo.email,
        email: currentUser.email,
        uid: currentUser.uid,
        status: "pending",
      });
    })

}

function confirmRequest(e, docId) {
  count = count - 1;
  document.getElementById("requestCount").innerHTML = count;

  db.ref("friends").child(currentUser.uid).child(docId).update({
    status: "approved",
  })

  db.ref("friends").child(docId).child(currentUser.uid).update({
    status: "approved",
  })

  var uniqueId = new Date().getTime();
  db.ref("users").child(docId).once("value", snapshot => {
    db.ref("chat_ID").child(currentUser.uid).child(snapshot.val().chat_ID).set({
      chat_ID: snapshot.val().chat_ID,
      chat_key: uniqueId,
    })
    db.ref("chat_ID").child(snapshot.val().uid).child(currentUser.chat_ID).set({
      chat_key: uniqueId,
      chat_ID: currentUser.chat_ID,
    })
  })
  e.parentNode.parentNode.remove();
}

function deleteRequest(e, key) {
  count = count - 1;
  document.getElementById("requestCount").innerHTML = count;
  db.ref("friends").child(currentUser.uid).child(key).remove();
  db.ref("friends").child(key).child(currentUser.uid).remove();
  e.parentNode.parentNode.remove()
}