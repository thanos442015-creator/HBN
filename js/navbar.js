const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

const isAdmin =
    currentUser &&
    currentUser.username ===
    "Thanos Johnson";

const navbar = document.getElementById("navbar");

navbar.innerHTML = `
    <div id="navLeft">

        <h1 id="logo">

            HBN

        </h1>

    </div>

    <button id="menuButton">

        ☰

    </button>

    <div id="navRight">

        <button class="navButton" id="homeButton">

            Home

        </button>

        <button class="navButton" id="classesButton">

            Classes

        </button>

        ${
            isAdmin
            ?
            `
            <button class="navButton" id="adminButton">

                Admin

            </button>
            `
            :
            ""
        }

        <button class="navButton" id="profileButton">

            Profile

        </button>

        <button class="navButton" id="logoutButton">

            Logout

        </button>

    </div>
`;

const logo =
    document.getElementById("logo");

const menuButton =
    document.getElementById("menuButton");

const navRight =
    document.getElementById("navRight");

logo.onclick = function () {

    window.location.href =
        "index.html";

};

document.getElementById("homeButton").onclick =
function () {

    window.location.href =
        "index.html";

};

document.getElementById("classesButton").onclick =
function () {

    window.location.href =
        "classes.html";

};

if (isAdmin) {

    document.getElementById("adminButton").onclick =
    function () {

        window.location.href =
            "admin.html";

    };

}

document.getElementById("profileButton").onclick =
function () {

    window.location.href =
        "profile.html";

};

document.getElementById("logoutButton").onclick =
function () {

    localStorage.removeItem(
        "HBN_LoggedIn"
    );

    localStorage.removeItem(
        "HBN_User"
    );

    window.location.href =
        "login.html";

};

function updateNavbar() {

    if (
        window.innerWidth <= 768
    ) {

        menuButton.style.display =
            "block";

        navRight.classList.remove(
            "desktopNavbar"
        );

        navRight.classList.add(
            "mobileNavbar"
        );

        navRight.style.display =
            "none";

        menuButton.textContent =
            "☰";

    } else {

        menuButton.style.display =
            "none";

        navRight.style.display =
            "flex";

        navRight.classList.remove(
            "mobileNavbar"
        );

        navRight.classList.add(
            "desktopNavbar"
        );

    }

}

menuButton.onclick = function () {

    if (
        navRight.style.display ===
        "flex"
    ) {

        navRight.style.display =
            "none";

        menuButton.textContent =
            "☰";

    } else {

        navRight.style.display =
            "flex";

        menuButton.textContent =
            "✕";

    }

};

window.addEventListener(
    "resize",
    updateNavbar
);

updateNavbar();