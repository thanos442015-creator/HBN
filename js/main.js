const loggedIn = localStorage.getItem("HBN_LoggedIn");

if (loggedIn !== "true") {

    window.location.href = "login.html";

}