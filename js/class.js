const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href = "login.html";

}

const params = new URLSearchParams(
    window.location.search
);

const classId = params.get("id");

if (!classId) {

    window.location.href =
        "classes.html";

}

const className =
    document.getElementById("className");

const teacherName =
    document.getElementById("teacherName");

const manageStudentsButton =
    document.getElementById(
        "manageStudentsButton"
    );

const studentManager =
    document.getElementById(
        "studentManager"
    );

const closeStudentManager =
    document.getElementById(
        "closeStudentManager"
    );

const studentSearch =
    document.getElementById(
        "studentSearch"
    );

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

    const { data: userData } =
        await window.hbxSupabase
            .from("users")
            .select("is_teacher")
            .eq(
                "username",
                currentUser.username
            )
            .maybeSingle();

    isTeacher =
        userData?.is_teacher ||
        currentUser.username ===
        "Thanos Johnson";

    const {
        data: classData,
        error
    } =
        await window.hbxSupabase
            .from("classes")
            .select("*")
            .eq(
                "id",
                classId
            )
            .maybeSingle();

    if (error || !classData) {

        window.location.href =
            "classes.html";

        return;

    }

    currentClass =
        classData;

    if (!isTeacher) {

        const {
            data: member
        } =
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
                "classes.html";

            return;

        }

    }

    className.textContent =
        currentClass.name;

    teacherName.textContent =
        "Teacher: " +
        currentClass.teacher;

    if (isTeacher) {

        manageStudentsButton.onclick =
            function () {

                studentManager.style.display =
                    "flex";

            };

        closeStudentManager.onclick =
            function () {

                studentManager.style.display =
                    "none";

            };

        addStudentButton.onclick =
            addStudent;

        loadStudents();

    } else {

        manageStudentsButton.style.display =
            "none";

    }

    postButton.onclick =
        createPost;

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

        studentList.innerHTML = `

            <p>

                No students yet.

            </p>

        `;

        return;

    }

    for (let i = 0; i < data.length; i++) {

        studentList.innerHTML += `

            <div class="studentCard">

                <span class="studentName">

                    ${data[i].username}

                </span>

                <button
                    class="removeStudentButton"
                    onclick="removeStudent('${data[i].username}')"
                >

                    Remove

                </button>

            </div>

        `;

    }

}

async function addStudent() {

    const username =
        studentSearch.value.trim();

    if (username === "") {

        return;

    }

    const { data: user } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq(
                "username",
                username
            )
            .maybeSingle();

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
            "Already in class."
        );

        return;

    }

    await window.hbxSupabase
        .from("class_members")
        .insert({

            class_id:
                classId,

            username:
                username

        });

    studentSearch.value = "";

    loadStudents();

}

async function removeStudent(
    username
) {

    if (
        !confirm(
            "Remove " +
            username +
            "?"
        )
    ) {

        return;

    }

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

    loadStudents();

}

async function createPost() {

    const text =
        postInput.value.trim();

    if (text === "") {

        return;

    }

    const { error } =
        await window.hbxSupabase
            .from("posts")
            .insert({

                username:
                    currentUser.username,

                profile_picture:
                    currentUser.profilePicture ||
                    "images/profiles/default.png",

                text: text,

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

            <div class="post">

                No posts yet.

            </div>

        `;

        return;

    }

    for (let i = 0; i < data.length; i++) {

        const teacherPost =
            data[i].username ===
            currentClass.teacher;

        const deleteButton =
            isTeacher ||
            data[i].username ===
            currentUser.username
            ?
            `
            <button
                class="deleteButton"
                onclick="deletePost(${data[i].id})"
            >

                Delete

            </button>
            `
            :
            "";

        posts.innerHTML += `

            <div class="postCard ${teacherPost ? "teacherPost" : ""}">

                <div class="postHeader">

                    <img
                        class="profilePicture"
                        src="${data[i].profile_picture}"
                    >

                    <div>

                        <div class="postAuthor">

                            ${data[i].username}

                            ${
                                teacherPost
                                ?

                                `<span class="teacherBadge">

                                    ✔

                                </span>`

                                :

                                ""

                            }

                        </div>

                        <div class="postTime">

                            ${new Date(data[i].created_at).toLocaleString()}

                        </div>

                    </div>

                </div>

                <div class="postContent">

                    ${data[i].text}

                </div>

                <div class="postButtons">

                    <button
                        onclick="likePost(${data[i].id}, ${data[i].likes})"
                    >

                        ❤️ ${data[i].likes}

                    </button>

                    ${deleteButton}

                </div>

            </div>

        `;

    }

}

async function likePost(
    id,
    likes
) {

    await window.hbxSupabase
        .from("posts")
        .update({

            likes:
                likes + 1

        })
        .eq(
            "id",
            id
        );

    loadPosts();

}

async function deletePost(
    id
) {

    if (
        !confirm(
            "Delete this post?"
        )
    ) {

        return;

    }

    await window.hbxSupabase
        .from("posts")
        .delete()
        .eq(
            "id",
            id
        );

    loadPosts();

}