const teacherList =
    document.getElementById("teacherList");

const usernameInput =
    document.getElementById("usernameInput");

const makeTeacherButton =
    document.getElementById("makeTeacherButton");

loadTeachers();

makeTeacherButton.onclick =
    makeTeacher;

async function makeTeacher() {

    const username =
        usernameInput.value.trim();

    if (username === "") {

        alert("Enter a username.");

        return;

    }

    const { data, error } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq("username", username)
            .maybeSingle();

    if (error) {

        alert(error.message);

        return;

    }

    if (!data) {

        alert("User not found.");

        return;

    }

    const { error: updateError } =
        await window.hbxSupabase
            .from("users")
            .update({

                is_teacher: true

            })
            .eq("username", username);

    if (updateError) {

        alert(updateError.message);

        return;

    }

    usernameInput.value = "";

    loadTeachers();

}

async function loadTeachers() {

    const { data, error } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq("is_teacher", true)
            .order("username");

    if (error) {

        teacherList.innerHTML =
            error.message;

        return;

    }

    teacherList.innerHTML = "";

    if (data.length === 0) {

        teacherList.innerHTML =
            "<p>No teachers yet.</p>";

        return;

    }

    for (let i = 0; i < data.length; i++) {

        const teacher =
            data[i];

        teacherList.innerHTML += `

            <div class="teacherCard">

                <div>

                    <span class="teacherBadge">

                        ✔

                    </span>

                    <span class="teacherName">

                        ${teacher.username}

                    </span>

                </div>

                <button
                    class="removeTeacherButton"
                    onclick="removeTeacher('${teacher.username}')"
                >

                    Remove

                </button>

            </div>

        `;

    }

}

async function removeTeacher(
    username
) {

    const confirmRemove =
        confirm(
            "Remove teacher permissions from " +
            username +
            "?"
        );

    if (!confirmRemove) {

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("users")
            .update({

                is_teacher: false

            })
            .eq("username", username);

    if (error) {

        alert(error.message);

        return;

    }

    loadTeachers();

}