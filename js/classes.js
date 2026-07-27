const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href = "login.html";

}

const classList =
    document.getElementById("classList");

 const createClassButton =
    document.getElementById(
        "createClassButton"
    );
initialize();

async function initialize() {

    const { data: userData } =
        await window.hbxSupabase
            .from("users")
            .select("is_teacher")
            .eq(
                "username",
                currentUser.username
            )
            .maybeSingle();

    const isTeacher =
        userData?.is_teacher ||
        currentUser.username ===
        "Thanos Johnson";

    if (isTeacher) {

        loadTeacherClasses();

    } else {

        loadStudentClasses();

    }
    if (isTeacher) {

    createClassButton.style.display =
        "block";

    createClassButton.onclick =
        function () {

            window.location.href =
                "create_class.html";

        };

}

}

async function loadTeacherClasses() {

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

        alert(error.message);

        return;

    }

    drawClasses(
        data,
        true
    );

}

async function loadStudentClasses() {

    const { data, error } =
        await window.hbxSupabase
            .from("class_members")
            .select("*")
            .eq(
                "username",
                currentUser.username
            );

    if (error) {

        alert(error.message);

        return;

    }

    if (data.length === 0) {

        classList.innerHTML = `

            <div class="noClasses">

                You are not in any classes.

            </div>

        `;

        return;

    }

    const ids = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        ids.push(
            data[i].class_id
        );

    }

    const {
        data: classes,
        error: classError
    } =
        await window.hbxSupabase
            .from("classes")
            .select("*")
            .in(
                "id",
                ids
            );

    if (classError) {

        alert(
            classError.message
        );

        return;

    }

    drawClasses(
        classes,
        false
    );

}

async function drawClasses(
    classes,
    teacher
) {

    classList.innerHTML = "";

    if (
        classes.length === 0
    ) {

        classList.innerHTML = `

            <div class="noClasses">

                No classes found.

            </div>

        `;

        return;

    }

    for (
        let i = 0;
        i < classes.length;
        i++
    ) {

        const {
            count
        } =
            await window.hbxSupabase
                .from("class_members")
                .select("*", {

                    count:
                        "exact",

                    head:
                        true

                })
                .eq(
                    "class_id",
                    classes[i].id
                );

        classList.innerHTML += `

            <div class="classCard">

                <div class="classLeft">

                    <div class="className">

                        ${classes[i].name}

                    </div>

                    <div class="classTeacher">

                        Teacher:
                        ${classes[i].teacher}

                    </div>

                    <div class="classStudents">

                        ${count || 0}
                        Students

                    </div>

                </div>

                <div class="classRight">

                    <button
                        class="openButton"
                        onclick="openClass(${classes[i].id})"
                    >

                        Open

                    </button>

                    ${
                        teacher
                        ?

                        `<button
                            class="deleteButton"
                            onclick="deleteClass(${classes[i].id})"
                        >

                            Delete

                        </button>`

                        :

                        ""

                    }

                </div>

            </div>

        `;

    }

}

function openClass(
    id
) {

    window.location.href =
        "class.html?id=" +
        id;

}

async function deleteClass(
    id
) {

    if (
        !confirm(
            "Delete this class?"
        )
    ) {

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

    initialize();

}