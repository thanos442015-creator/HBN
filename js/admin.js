alert("Admin.js loaded!");

const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

if (!currentUser) {

    window.location.href =
        "login.html";

}

if (
    currentUser.username !==
    "Thanos Johnson"
) {

    window.location.href =
        "index.html";

}

const amountInput =
    document.getElementById(
        "amountInput"
    );

const generateButton =
    document.getElementById(
        "generateButton"
    );

const copyAllButton =
    document.getElementById(
        "copyAllButton"
    );

const clearButton =
    document.getElementById(
        "clearButton"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const unusedList =
    document.getElementById(
        "unusedList"
    );

const usedList =
    document.getElementById(
        "usedList"
    );

const teacherList =
    document.getElementById(
        "teacherList"
    );

const usernameInput =
    document.getElementById(
        "usernameInput"
    );

const makeTeacherButton =
    document.getElementById(
        "makeTeacherButton"
    );

let codes = [];

generateButton.onclick =
async function () {

    const amount =
        Number(
            amountInput.value
        );

    if (amount < 1) {

        return;

    }

    await generateCodes(
        amount
    );

};

copyAllButton.onclick =
function () {

    let text = "";

    for (
        let i = 0;
        i < codes.length;
        i++
    ) {

        text +=
            codes[i].code +
            "\n";

    }

    navigator.clipboard.writeText(
        text
    );

    alert(
        "Copied all codes!"
    );

};

clearButton.onclick =
function () {

    codes = [];

    drawCodes();

};

searchInput.oninput =
    drawCodes;

makeTeacherButton.onclick =
    makeTeacher;

loadCodes();

loadTeachers();

async function generateCodes(
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        let newCode;

        do {

            newCode =
                createCode();

        } while (
            codeExists(
                newCode
            )
        );

        const { error } =
            await window.hbxSupabase
                .from(
                    "invitation_codes"
                )
                .insert({

                    code:
                        newCode,

                    used:
                        false,

                    username:
                        null

                });

        if (error) {

            alert(
                error.message
            );

            return;

        }

        codes.push({

            code:
                newCode,

            used:
                false,

            user:
                "-"

        });

    }

    drawCodes();

}

function codeExists(
    code
) {

    for (
        let i = 0;
        i < codes.length;
        i++
    ) {

        if (
            codes[i].code ===
            code
        ) {

            return true;

        }

    }

    return false;

}

function createCode() {

    const letters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let code = "";

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        code +=
            letters[
                Math.floor(
                    Math.random() *
                    26
                )
            ];

    }

    code += "-";

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        code +=
            Math.floor(
                Math.random() *
                10
            );

    }

    return code;

}

async function loadCodes() {

    const {
        data,
        error
    } =
        await window.hbxSupabase
            .from(
                "invitation_codes"
            )
            .select("*")
            .order(
                "created_at",
                {

                    ascending:
                        false

                }
            );

    if (error) {

        alert(
            error.message
        );

        return;

    }

    codes = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        codes.push({

            code:
                data[i].code,

            used:
                data[i].used,

            user:
                data[i].username ||
                "-"

        });

    }

    drawCodes();

}

function drawCodes() {

    unusedList.innerHTML = "";

    usedList.innerHTML = "";

    const search =
        searchInput.value
            .toUpperCase();

    for (
        let i = 0;
        i < codes.length;
        i++
    ) {

        if (
            !codes[i]
                .code
                .includes(search)
        ) {

            continue;

        }

        const html = `

            <div class="codeCard">

                <span>

                    ${codes[i].code}

                </span>

                <span>

                    ${
                        codes[i].used
                        ? "Used"
                        : "Unused"
                    }

                </span>

                <span>

                    ${codes[i].user}

                </span>

                <button
                    class="copyButton"
                    onclick="copyCode(${i})"
                >

                    Copy

                </button>

            </div>

        `;

        if (
            codes[i].used
        ) {

            usedList.innerHTML +=
                html;

        } else {

            unusedList.innerHTML +=
                html;

        }

    }

}

function copyCode(
    index
) {

    navigator.clipboard.writeText(

        codes[index].code

    );

    const buttons =
        document.getElementsByClassName(
            "copyButton"
        );

    buttons[index].textContent =
        "Copied!";

    setTimeout(
        function () {

            buttons[index].textContent =
                "Copy";

        },
        1000
    );

}

async function makeTeacher() {

    const username =
        usernameInput.value.trim();

    if (
        username === ""
    ) {

        alert(
            "Enter a username."
        );

        return;

    }

    const {
        data,
        error
    } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq(
                "username",
                username
            )
            .maybeSingle();

    if (error) {

        alert(
            error.message
        );

        return;

    }

    if (!data) {

        alert(
            "User not found."
        );

        return;

    }

    const {
        error: updateError
    } =
        await window.hbxSupabase
            .from("users")
            .update({

                is_teacher: true

            })
            .eq(
                "username",
                username
            );

    if (updateError) {

        alert(
            updateError.message
        );

        return;

    }

    usernameInput.value = "";

    loadTeachers();

}

async function loadTeachers() {

    const {
        data,
        error
    } =
        await window.hbxSupabase
            .from("users")
            .select("*")
            .eq(
                "is_teacher",
                true
            )
            .order(
                "username"
            );

    if (error) {

        teacherList.innerHTML =
            error.message;

        return;

    }

    teacherList.innerHTML = "";

    if (
        data.length === 0
    ) {

        teacherList.innerHTML =

            "<p>No teachers yet.</p>";

        return;

    }

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

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

    const answer =
        confirm(

            "Remove teacher permissions from " +
            username +
            "?"

        );

    if (!answer) {

        return;

    }

    const {
        error
    } =
        await window.hbxSupabase
            .from("users")
            .update({

                is_teacher: false

            })
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

    loadTeachers();

}