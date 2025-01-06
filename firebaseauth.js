import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfqGqRDgSEwcMei3ncOo8_ksNQpVnVfqA",
  authDomain: "to-do-app-628ff.firebaseapp.com",
  projectId: "to-do-app-628ff",
  storageBucket: "to-do-app-628ff.appspot.com",
  messagingSenderId: "371517129088",
  appId: "1:371517129088:web:da785d19602ae325128165",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.email);
    if (window.location.pathname.endsWith("index.html")) {
      loadTasks();
    }
  } else {
    currentUser = null;
    console.log("No user logged in.");
    if (window.location.pathname.endsWith("index.html")) {
      alert("Please log in to access your tasks.");
      window.location.href = "login.html";
    }
  }
});

window.loginHandler = async () => {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error:", error);
    alert(`Error: ${error.message}`);
  }
};

window.signup = async () => {
  const email = document.getElementById("id-username").value;
  const password = document.getElementById("id-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await addDoc(collection(db, "users"), {
      email: email,
      createdAt: new Date(),
    });

    alert("Registration successful!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Signup error:", error);
    alert(`Error: ${error.message}`);
  }
};

window.addTask = async () => {
  const taskInput = document.getElementById("user-task");
  const task = taskInput.value.trim();

  if (!task) {
    alert("Task cannot be empty!");
    return;
  }

  try {
    await addDoc(collection(db, "tasks"), {
      task: task,
      userId: currentUser.uid,
      createdAt: new Date(),
    });

    taskInput.value = "";
    loadTasks();
  } catch (error) {
    console.error("Add task error:", error);
    alert(`Error: ${error.message}`);
  }
};

async function loadTasks() {
  try {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const taskData = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${taskData.task}</span>
        <button onclick="deleteTask('${doc.id}')">Remove Task</button>
      `;
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.marginBottom = "10px";
      li.style.padding = "8px";
      li.style.borderBottom = "1px solid #ccc";
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error("Load tasks error:", error);
    alert(`Error: ${error.message}`);
  }
}

window.deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    loadTasks();
  } catch (error) {
    console.error("Delete task error:", error);
    alert(`Error: ${error.message}`);
  }
};
