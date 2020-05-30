// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "<<Your api here>>",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the name for the user
if (!localStorage.getItem("name")) {
  name = prompt("What is your name?");
  localStorage.setItem("name", name);
} else {
  name = localStorage.getItem("name");
}
document.querySelector("#name").innerText = name;

// Change name
document.querySelector("#change-name").addEventListener("click", () => {
  name = prompt("What is your name?");
  localStorage.setItem("name", name);
  document.querySelector("#name").innerText = name;
});

// Send a new chat message
document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  firebase
    .firestore()
    .collection("messages")
    .add({
      name: name,
      message: document.querySelector("#message-input").value,
      date: firebase.firestore.Timestamp.fromMillis(Date.now()),
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
      document.querySelector("#message-form").reset();
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
});

// Display chat stream
firebase
  .firestore()
  .collection("messages")
  .orderBy("date", "asc")
  .onSnapshot(function (snapshot) {
    document.querySelector("#messages").innerHTML = "";
    snapshot.forEach(function (doc) {
      var message = document.createElement("div");
      message.innerHTML = `
		<p class="name">${doc.data().name}</p>
		<p>${doc.data().message}</p>
		`;
      document.querySelector("#messages").prepend(message);
    });
  });

// Remove all chat messages
document.querySelector("#clear").addEventListener("click", () => {
  firebase
    .firestore()
    .collection("messages")
    .get()
    .then(function (snapshot) {
      snapshot.forEach(function (doc) {
        firebase
          .firestore()
          .collection("messages")
          .doc(doc.id)
          .delete()
          .then(function () {
            console.log("Document successfully deleted!");
          })
          .catch(function (error) {
            console.error("Error removing document: ", error);
          });
      });
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
});

const uploadButton = document.querySelector("#upload-button");
const progressBar = document.querySelector("progress");

let imageFile;

// Event listener for if upload image button is clicked and a file has been selected
uploadButton.addEventListener("change", (event) => {
  // Access the chosen file through the event
  let file = event.target.files[0];

  // Define a var just for the name of the file
  let name = event.target.files[0].name;

  // Create a storage reference to the database using the name of the chosen file
  let storageRef = firebase.storage().ref(name);

  // Attach the put method to the storageRef
  storageRef.put(file).on(
    "state_changed",
    (snapshot) => {
      let percentage = Number(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      ).toFixed(0);
      progressBar.value = percentage;
    },
    (error) => {
      console.log("error", error.message);
    },
    () => {
      // Once upload is complete make a second request to get the download URL
      storageRef
        .put(file)
        .snapshot.ref.getDownloadURL()
        .then((url) => {
          // We now have the uploaded url
          console.log(url);

          // Every time we upload a image we also need to add a reference to the database
          firebase
            .firestore()
            .collection("images")
            .add({
              url: url,
            })
            .then((success) => console.log(success))
            .catch((error) => console.log(error));

          // reset the progress bar to zero percent after one second
          setTimeout(() => {
            progressBar.removeAttribute("value");
          }, 1000);
        });
    }
  );
});

// listen to database in the images collection. Loop through returned data to create image elements
firebase
  .firestore()
  .collection("images")
  .onSnapshot((snapshot) => {
    document.querySelector("#images").innerHTML = "";
    snapshot.forEach((each) => {
      console.log(each.data().url);
      let div = document.createElement("div");
      let image = document.createElement("img");
      image.setAttribute("src", each.data().url);
      div.append(image);
      document.querySelector("#images").append(div);
    });
  });

  document.querySelector('#clear').addEventListener('click', () => {
	  firebase.firestore().collection('images')
	  .get()
	  .then(snapshot => {
		  snapshot.forEach(doc => {
			  firebase.firestore().collection('images').doc(doc.id).delete()
			  .then(() => {
				console.log("Success Delete Image")
			  })
			  .catch(err =>{
				  console.log(err.message)
			  })
		  })
	  })
	  .catch(error =>{
		  console.log(error)
	  })
  })