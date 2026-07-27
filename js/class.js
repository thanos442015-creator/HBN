const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href = "login.html";

}

const params =
    new URLSearchParams(
        window.location.search
    );

const classId =
    params.get("id");

if (!classId) {

    window.location.href =
        "create_class.html";

}

const className =
    document.getElementById("className");

const teacherName =
    document.getElementById("teacherName");

const studentSearch =
    document.getElementById("studentSearch");

const addStudentButton =
    document.getElementById(
        "addStudentButton"
    );

const studentList =
    document.getElementById(
        "studentList"
    );

const postInput =
    document.getElementById(
        "postInput"
    );

const postButton =
    document.getElementById(
        "postButton"
    );

const posts =
    document.getElementById(
        "posts"
    );

let currentClass = null;

let isTeacher = false;

initialize();

async function initialize() {

    const { data: userData, error: userError } =
        await window.hbxSupabase
            .from("users")
            .select("is_teacher")
            .eq(
                "username",
                currentUser.username
            )
            .maybeSingle();

    if (userError || !userData) {

        window.location.href =
            "index.html";

        return;

    }

    isTeacher =
        userData.is_teacher ||
        currentUser.username ===
        "Thanos Johnson";

    const { data: classData, error: classError } =
        await window.hbxSupabase
            .from("classes")
            .select("*")
            .eq(
                "id",
                classId
            )
            .maybeSingle();

    if (classError || !classData) {

        window.location.href =
            "create_class.html";

        return;

    }

    currentClass =
        classData;

    if (!isTeacher) {

        const { data: member } =
            await window.hbxSupabase
                .from("class_members")
                .select("*")
                .eq(
                    "class_id",
                    classId
                )
                .eq(
                    "username",
                    currentUser.username
                )
                .maybeSingle();

        if (!member) {

            window.location.href =
                "index.html";

            return;

        }

    }

    className.textContent =
        currentClass.name;

    teacherName.textContent =
        "Teacher: " +
        currentClass.teacher;

    if (!isTeacher) {

        studentSearch.style.display =
            "none";

        addStudentButton.style.display =
            "none";

        postInput.style.display =
            "none";

        postButton.style.display =
            "none";

    }

    addStudentButton.onclick =
        addStudent;

    postButton.onclick =
        createPost;

    loadStudents();

    loadPosts();

}

async function loadStudents() {

    const { data, error } =
        await window.hbxSupabase
            .from("class_members")
            .select("*")
            .eq(
                "class_id",
                classId
            )
            .order(
                "username"
            );

    if (error) {

        studentList.innerHTML =
            error.message;

        return;

    }

    studentList.innerHTML = "";

    if (data.length === 0) {

        studentList.innerHTML =

            "<p>No students.</p>";

        return;

    }

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        studentList.innerHTML += `

            <div class="studentCard">

                <span class="studentName">

                    ${data[i].username}

                </span>

                ${
                    isTeacher
                    ?

                    `<button
                        class="removeStudentButton"
                        onclick="removeStudent('${data[i].username}')"
                    >

                        Remove

                    </button>`

                    :

                    ""

                }

            </div>

        `;

    }

}

async function addStudent() {

    const username =
        studentSearch.value.trim();

    if (username === "") {

        alert(
            "Enter a username."
        );

        return;

    }

    const { data: user, error } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq(
                "username",
                username
            )
            .maybeSingle();

    if (error) {

        alert(error.message);

        return;

    }

    if (!user) {

        alert(
            "User not found."
        );

        return;

    }

    const { data: existing } =
        await window.hbxSupabase
            .from("class_members")
            .select("*")
            .eq(
                "class_id",
                classId
            )
            .eq(
                "username",
                username
            )
            .maybeSingle();

    if (existing) {

        alert(
            "That student is already in this class."
        );

        return;

    }

    const { error: insertError } =
        await window.hbxSupabase
            .from("class_members")
            .insert({

                class_id:
                    classId,

                username:
                    username

            });

    if (insertError) {

        alert(
            insertError.message
        );

        return;

    }

    studentSearch.value = "";

    loadStudents();

}

async function removeStudent(
    username
) {

    const answer =
        confirm(
            "Remove " +
            username +
            " from this class?"
        );

    if (!answer) {

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("class_members")
            .delete()
            .eq(
                "class_id",
                classId
            )
            .eq(
                "username",
                username
            );

    if (error) {

        alert(
            error.message
        );

        return;

    }

    loadStudents();

}

async function createPost() {

    const content =
        postInput.value.trim();

    if (content === "") {

        alert(
            "Write something first."
        );

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("posts")
            .insert({

                username:
                    currentUser.username,

                content:
                    content,

                likes: 0,

                class:
                    currentClass.name

            });

    if (error) {

        alert(error.message);

        return;

    }

    postInput.value = "";

    loadPosts();

}

async function loadPosts() {

    const { data, error } =
        await window.hbxSupabase
            .from("posts")
            .select("*")
            .eq(
                "class",
                currentClass.name
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        posts.innerHTML =
            error.message;

        return;

    }

    posts.innerHTML = "";

    if (data.length === 0) {

        posts.innerHTML = `

            <p>

                No posts yet.

            </p>

        `;

        return;

    }

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        posts.innerHTML += `

            <div class="postCard">

                <div class="postAuthor">

                    ${data[i].username}

                </div>

                <div class="postContent">

                    ${data[i].content}

                </div>

                ${
                    isTeacher
                    ?

                    `<button
                        class="deleteButton"
                        onclick="deletePost(${data[i].id})"
                    >

                        Delete

                    </button>`

                    :

                    ""

                }

            </div>

        `;

    }

}

async function deletePost(
    id
) {

    const answer =
        confirm(
            "Delete this post?"
        );

    if (!answer) {

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("posts")
            .delete()
            .eq(
                "id",
                id
            );

    if (error) {

        alert(
            error.message
        );

        return;

    }

    loadPosts();

}