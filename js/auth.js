const username = document.getElementById("username");
const password = document.getElementById("password");
const inviteCode = document.getElementById("inviteCode");

const createButton = document.getElementById("createButton");
const loginButton = document.getElementById("loginButton");

const message = document.getElementById("message");

if (createButton) {

    createButton.onclick = async function () {

        const user = {

            username: username.value.trim(),

            password: password.value,

            inviteCode: inviteCode.value.trim().toUpperCase()

        };

        if (
            user.username === "" ||
            user.password === "" ||
            user.inviteCode === ""
        ) {

            message.textContent = "Please fill in every box.";

            return;

        }

        const { data: codeData, error: codeError } =
            await window.hbxSupabase
                .from("invitation_codes")
                .select("*")
                .eq("code", user.inviteCode)
                .single();

        if (codeError || !codeData) {

            message.textContent = "Invalid invitation code.";

            return;

        }

        if (codeData.used) {

            message.textContent = "That invitation code has already been used.";

            return;

        }

        const { data: existingUser } =
            await window.hbxSupabase
                .from("users")
                .select("*")
                .eq("username", user.username)
                .maybeSingle();

        if (existingUser) {

            message.textContent = "Username already exists.";

            return;

        }

        const { error: userError } =
            await window.hbxSupabase
                .from("users")
                .insert({

                    username: user.username,

                    password: user.password,

                    bio: "Welcome to my HBN profile!",

                    profile_picture: "images/profiles/default.png"

                });

        if (userError) {

            message.textContent = userError.message;

            return;

        }

        await window.hbxSupabase
            .from("invitation_codes")
            .update({

                used: true,

                username: user.username

            })
            .eq("code", user.inviteCode);

        localStorage.setItem(
            "HBN_User",
            JSON.stringify({

                username: user.username,

                bio: "Welcome to my HBN profile!",

                profilePicture: "images/profiles/default.png"

            })
        );

        localStorage.setItem(
            "HBN_LoggedIn",
            "true"
        );

        window.location.href = "index.html";

    };

}

if (loginButton) {

    loginButton.onclick = async function () {

        const { data: user, error } =
            await window.hbxSupabase
                .from("users")
                .select("*")
                .eq("username", username.value.trim())
                .eq("password", password.value)
                .maybeSingle();

        if (error || !user) {

            message.textContent = "Incorrect username or password.";

            return;

        }

        localStorage.setItem(
            "HBN_User",
            JSON.stringify({

                username: user.username,

                bio: user.bio,

                profilePicture: user.profile_picture

            })
        );

        localStorage.setItem(
            "HBN_LoggedIn",
            "true"
        );

        window.location.href = "index.html";

    };

}