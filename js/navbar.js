const navbar = document.getElementById("navbar");

navbar.innerHTML = `
    <div id="navLeft">
        <h1 id="logo" style="cursor:pointer;">HBN</h1>
    </div>

    <div id="navCenter">
        <input
            id="searchBar"
            type="search"
            placeholder="Search users..."
        >
    </div>

    <div id="navRight">
        <button class="navButton" id="homeButton">
            Home
        </button>

        <button class="navButton" id="classesButton">
            Classes
        </button>

        <button class="navButton" id="messagesButton">
            Messages
        </button>

        <button class="navButton" id="notificationsButton">
            Notifications
        </button>

        <button class="navButton" id="profileButton">
            Profile
        </button>

        <button class="navButton" id="logoutButton">
            Logout
        </button>
    </div>
`;

document.getElementById("logo").onclick = function () {

    window.location.href = "index.html";

};

document.getElementById("homeButton").onclick = function () {

    window.location.href = "index.html";

};

document.getElementById("classesButton").onclick = function () {

    window.location.href = "classes.html";

};

document.getElementById("messagesButton").onclick = function () {

    alert("Messages coming soon!");

};

document.getElementById("notificationsButton").onclick = function () {

    alert("Notifications coming soon!");

};

document.getElementById("profileButton").onclick = function () {

    window.location.href = "profile.html";

};

document.getElementById("logoutButton").onclick = function () {

    localStorage.removeItem("HBN_LoggedIn");

    localStorage.removeItem("HBN_User");

    window.location.href = "login.html";

};