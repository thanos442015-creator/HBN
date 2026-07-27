const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href = "login.html";

}

const className =
    document.getElementById("className");

const createButton =
    document.getElementById("createButton");

const classList =
    document.getElementById("classList");

initialize();

async function initialize() {

    const { data, error } =
        await window.hbxSupabase
            .from("users")
            .select("is_teacher")
            .eq(
                "username",
                currentUser.username
            )
            .maybeSingle();

    if (error || !data) {

        window.location.href = "index.html";

        return;

    }

    if (!data.is_teacher) {

        window.location.href = "index.html";

        return;

    }

    loadClasses();

}

createButton.onclick =
    createClass;

async function createClass() {

    const name =
        className.value.trim();

    if (name === "") {

        alert(
            "Enter a class name."
        );

        return;

    }

    const { data: existing } =
        await window.hbxSupabase
            .from("classes")
            .select("*")
            .eq("name", name)
            .maybeSingle();

    if (existing) {

        alert(
            "A class with that name already exists."
        );

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("classes")
            .insert({

                name: name,

                teacher:
                    currentUser.username

            });

    if (error) {

        alert(error.message);

        return;

    }

    className.value = "";

    loadClasses();

}

async function loadClasses() {

    const { data, error } =
        await window.hbxSupabase
            .from("classes")
            .select("*")
            .eq(
                "teacher",
                currentUser.username
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        classList.innerHTML =
            error.message;

        return;

    }

    classList.innerHTML = "";

    if (data.length === 0) {

        classList.innerHTML = `

            <p>

                You have not created
                any classes yet.

            </p>

        `;

        return;

    }

    for (let i = 0; i < data.length; i++) {

        classList.innerHTML += `

            <div class="classCard">

                <div class="classInfo">

                    <h3>

                        ${data[i].name}

                    </h3>

                    <p>

                        Teacher:
                        ${data[i].teacher}

                    </p>

                </div>

                <div>

                    <button
                        class="openButton"
                        onclick="openClass(${data[i].id})"
                    >

                        Open

                    </button>

                    <button
                        class="deleteButton"
                        onclick="deleteClass(${data[i].id})"
                    >

                        Delete

                    </button>

                </div>

            </div>

        `;

    }

}

function openClass(id) {

    window.location.href =
        "class.html?id=" + id;

}

async function deleteClass(id) {

    const answer =
        confirm(
            "Delete this class?"
        );

    if (!answer) {

        return;

    }

    await window.hbxSupabase
        .from("class_members")
        .delete()
        .eq(
            "class_id",
            id
        );

    await window.hbxSupabase
        .from("classes")
        .delete()
        .eq(
            "id",
            id
        );

    loadClasses();

}