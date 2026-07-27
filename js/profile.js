const profile = document.getElementById("profile");

const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href = "login.html";

}

const params = new URLSearchParams(
    window.location.search
);

const viewingUsername =
    params.get("user") ||
    currentUser.username;

let user = null;

loadProfile();

async function loadProfile() {

    const { data, error } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq(
                "username",
                viewingUsername
            )
            .maybeSingle();

    if (error) {

        alert(error.message);

        return;

    }

    if (!data) {

        profile.innerHTML = `
            <h1>User not found.</h1>
        `;

        return;

    }

    user = {

        username:
            data.username,

        bio:
            data.bio,

        profilePicture:
            data.profile_picture

    };

    drawProfile();

}

async function drawProfile() {

    const ownProfile =
        currentUser.username === user.username;

    let humanButton = "";

    if (!ownProfile) {

        const { data } =
            await window.hbxSupabase
                .from("follows")
                .select("*")
                .eq(
                    "follower",
                    currentUser.username
                )
                .eq(
                    "following",
                    user.username
                )
                .maybeSingle();

        humanButton = `

            <button
                id="humanButton"
            >

                ${
                    data
                    ? "✓ Human"
                    : "Human"
                }

            </button>

        `;

    }

    profile.innerHTML = `

        <div id="profileCard">

            <img
                id="profilePicture"
                src="${
                    user.profilePicture ||
                    "images/profiles/default.png"
                }"
            >

            <h1>

                ${user.username}

            </h1>

            <p>

                ${user.bio}

            </p>

            <div id="profileStats">

                <div class="stat">

                    <h2 id="postsCount">
                        0
                    </h2>

                    <span>
                        Posts
                    </span>

                </div>

                <div class="stat">

                    <h2 id="humansCount">
                        0
                    </h2>

                    <span>
                        Humans
                    </span>

                </div>

                <div class="stat">

                    <h2 id="followingCount">
                        0
                    </h2>

                    <span>
                        Following
                    </span>

                </div>

            </div>

            ${
                ownProfile
                ? `
                    <button
                        id="editProfileButton"
                    >
                        Edit Profile
                    </button>
                `
                : humanButton
            }

        </div>

    `;

    if (ownProfile) {

        document
            .getElementById(
                "editProfileButton"
            )
            .onclick = showEditor;

    } else {

        document
            .getElementById(
                "humanButton"
            )
            .onclick =
                toggleHuman;

    }

    await loadStats();

}

function showEditor() {

    profile.innerHTML = `
        <div id="profileCard">

            <img
                id="profilePicture"
                src="${user.profilePicture || "images/profiles/default.png"}"
            >

            <input
                id="pictureInput"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
            >

            <h2>Edit Profile</h2>

            <label>Real Name</label>

            <input
                id="usernameInput"
                class="profileInput"
                value="${user.username}"
            >

            <label>Bio</label>

            <textarea
                id="bioInput"
                class="profileTextarea"
            >${user.bio}</textarea>

            <button id="saveProfileButton">
                Save Changes
            </button>

        </div>
    `;

    document.getElementById("saveProfileButton").onclick = saveProfile;

}

async function saveProfile() {

    const pictureInput = document.getElementById("pictureInput");

    const newUsername = document
        .getElementById("usernameInput")
        .value
        .trim();

    const newBio = document
        .getElementById("bioInput")
        .value
        .trim();

    if (newUsername === "") {

        alert("Username cannot be empty.");

        return;

    }

    const { error } = await window.hbxSupabase
        .from("users")
        .update({

            username: newUsername,

            bio: newBio

        })
        .eq("username", user.username);

    if (error) {

        alert(error.message);

        return;

    }

    user.username = newUsername;

    user.bio = newBio;

    if (pictureInput.files.length > 0) {

        const reader = new FileReader();

        reader.onload = function () {

            user.profilePicture = reader.result;

            localStorage.setItem(
                "HBN_User",
                JSON.stringify(user)
            );

            drawProfile();

        };

        reader.readAsDataURL(
            pictureInput.files[0]
        );

        return;

    }

    localStorage.setItem(
        "HBN_User",
        JSON.stringify(user)
    );

    drawProfile();

}

async function loadStats() {

    const { count: posts } = await window.hbxSupabase
        .from("posts")
        .select("*", {

            count: "exact",

            head: true

        })
        .eq("username", user.username);

    const { count: humans } = await window.hbxSupabase
        .from("follows")
        .select("*", {

            count: "exact",

            head: true

        })
        .eq("following", user.username);

    const { count: following } = await window.hbxSupabase
        .from("follows")
        .select("*", {

            count: "exact",

            head: true

        })
        .eq("follower", user.username);

    document.getElementById("postsCount").textContent =
        posts || 0;

    document.getElementById("humansCount").textContent =
        humans || 0;

    document.getElementById("followingCount").textContent =
        following || 0;

}

async function toggleHuman() {

    const { data } = await window.hbxSupabase
        .from("follows")
        .select("*")
        .eq("follower", currentUser.username)
        .eq("following", user.username)
        .maybeSingle();

    if (data) {

        const { error } = await window.hbxSupabase
            .from("follows")
            .delete()
            .eq("id", data.id);

        if (error) {

            alert(error.message);

            return;

        }

    } else {

        const { error } = await window.hbxSupabase
            .from("follows")
            .insert({

                follower: currentUser.username,

                following: user.username

            });

        if (error) {

            alert(error.message);

            return;

        }

    }

    await drawProfile();

}

async function loadStats() {

    const { count: posts } = await window.hbxSupabase
        .from("posts")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("username", user.username);

    const { count: humans } = await window.hbxSupabase
        .from("follows")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("following", user.username);

    const { count: following } = await window.hbxSupabase
        .from("follows")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("follower", user.username);

    document.getElementById("postsCount").textContent =
        posts || 0;

    document.getElementById("humansCount").textContent =
        humans || 0;

    document.getElementById("followingCount").textContent =
        following || 0;

}