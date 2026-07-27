const feed = document.getElementById("feed");

const currentUser = JSON.parse(
    localStorage.getItem("HBN_User")
);

let posts = [];

feed.innerHTML = `
    <div id="createPost">

        <textarea
            id="postInput"
            placeholder="Idk, type what u want"
        ></textarea>

        <div id="createButtons">

            <button id="postButton">
                Post
            </button>

            ${
                currentUser.username === "Thanos Johnson"
                ? `
                <button id="adminButton">
                    Admin Panel
                </button>
                `
                : ""
            }

        </div>

    </div>

    <div id="posts"></div>
`;

const postInput = document.getElementById(
    "postInput"
);

const postButton = document.getElementById(
    "postButton"
);

const postsDiv = document.getElementById(
    "posts"
);

const adminButton = document.getElementById(
    "adminButton"
);

if (adminButton) {

    adminButton.onclick = function () {

        window.location.href =
            "admin.html";

    };

}

loadPosts();

postButton.onclick = async function () {

    const text = postInput.value.trim();

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

                class: "HBN"

            });

    if (error) {

        alert(error.message);

        return;

    }

    postInput.value = "";

    await loadPosts();

};

async function loadPosts() {

    const { data, error } =
        await window.hbxSupabase
            .from("posts")
            .select("*")
            .eq("class", "HBN")
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

    posts = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const {
            data: comments
        } =
            await window.hbxSupabase
                .from("comments")
                .select("*")
                .eq(
                    "post_id",
                    data[i].id
                )
                .order(
                    "created_at"
                );

        posts.push({

            id: data[i].id,

            username:
                data[i].username,

            profilePicture:
                data[i].profile_picture,

            text: data[i].text,

            likes: data[i].likes,

            comments:
                comments || [],

            createdAt:
                new Date(
                    data[i].created_at
                ).getTime()

        });

    }

    drawPosts();

}

function drawPosts() {

    postsDiv.innerHTML = "";

    for (let i = 0; i < posts.length; i++) {

        let commentsHTML = "";

        if (!posts[i].comments) {

            posts[i].comments = [];

        }

        for (let j = 0; j < posts[i].comments.length; j++) {

            commentsHTML += `
                <div class="comment">

                    <strong>

                        <a
                            class="usernameLink"
                            href="profile.html?user=${encodeURIComponent(posts[i].comments[j].username)}"
                        >
                            ${posts[i].comments[j].username}
                        </a>

                    </strong>

                    ${posts[i].comments[j].text}

                </div>
            `;

        }

        let deleteButton = "";

        if (posts[i].username === currentUser.username) {

            deleteButton = `
                <button onclick="deletePost(${i})">

                    <img
                        src="images/icons/delete.png"
                        class="buttonIcon"
                        alt="Delete"
                    >

                    Delete

                </button>
            `;

        }

        postsDiv.innerHTML += `
            <div class="post">

                <div class="postHeader">

                    <img
                        class="profilePicture"
                        src="${posts[i].profilePicture}"
                    >

                    <div class="postTop">

                        <div>

                            <a
                                class="usernameLink"
                                href="profile.html?user=${encodeURIComponent(posts[i].username)}"
                            >
                                <h3>${posts[i].username}</h3>
                            </a>

                            <span class="postTime">

                                ${
                                    posts[i].createdAt
                                    ? getTimeAgo(posts[i].createdAt)
                                    : "Unknown"
                                }

                            </span>

                        </div>

                    </div>

                </div>

                <p>${posts[i].text}</p>

                <div class="postButtons">

                    <button onclick="likePost(${i})">

                        <img
                            src="images/icons/heart.png"
                            class="buttonIcon"
                            alt="Like"
                        >

                        ${posts[i].likes}

                    </button>

                    ${deleteButton}

                </div>

                <div class="comments">

                    ${commentsHTML}

                    <div class="commentCreator">

                        <input
                            class="commentInput"
                            id="commentInput${i}"
                            type="text"
                            placeholder="Write a comment..."
                        >

                        <button
                            class="commentButton"
                            onclick="commentPost(${i})"
                        >
                            Submit
                        </button>

                    </div>

                </div>

            </div>
        `;

    }

}

async function likePost(index) {

    const post =
        posts[index];

    const {
        data: existingLike,
        error: likeError
    } =
        await window.hbxSupabase
            .from("post_likes")
            .select("*")
            .eq(
                "post_id",
                post.id
            )
            .eq(
                "username",
                currentUser.username
            )
            .maybeSingle();

    if (likeError) {

        alert(
            likeError.message
        );

        return;

    }

    if (existingLike) {

        const {
            error: deleteError
        } =
            await window.hbxSupabase
                .from("post_likes")
                .delete()
                .eq(
                    "post_id",
                    post.id
                )
                .eq(
                    "username",
                    currentUser.username
                );

        if (deleteError) {

            alert(
                deleteError.message
            );

            return;

        }

        const {
            error: updateError
        } =
            await window.hbxSupabase
                .from("posts")
                .update({

                    likes:
                        Math.max(
                            0,
                            post.likes - 1
                        )

                })
                .eq(
                    "id",
                    post.id
                );

        if (updateError) {

            alert(
                updateError.message
            );

            return;

        }

    } else {

        const {
            error: insertError
        } =
            await window.hbxSupabase
                .from("post_likes")
                .insert({

                    post_id:
                        post.id,

                    username:
                        currentUser.username

                });

        if (insertError) {

            alert(
                insertError.message
            );

            return;

        }

        const {
            error: updateError
        } =
            await window.hbxSupabase
                .from("posts")
                .update({

                    likes:
                        post.likes + 1

                })
                .eq(
                    "id",
                    post.id
                );

        if (updateError) {

            alert(
                updateError.message
            );

            return;

        }

    }

    await loadPosts();

}
async function commentPost(index) {

    const input = document.getElementById(
        "commentInput" + index
    );

    const text = input.value.trim();

    if (text === "") {

        return;

    }

    const { error } = await window.hbxSupabase
        .from("comments")
        .insert({

            post_id: posts[index].id,

            username: currentUser.username,

            text: text

        });

    if (error) {

        alert(error.message);

        return;

    }

    await loadPosts();

}

async function deletePost(index) {

    const postId = posts[index].id;

    const { error: commentsError } = await window.hbxSupabase
        .from("comments")
        .delete()
        .eq("post_id", postId);

    if (commentsError) {

        alert(commentsError.message);

        return;

    }

    const { error: postError } = await window.hbxSupabase
        .from("posts")
        .delete()
        .eq("id", postId);

    if (postError) {

        alert(postError.message);

        return;

    }

    await loadPosts();

}
function getTimeAgo(time) {

    const seconds = Math.floor((Date.now() - time) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return minutes + "m" + " ago";
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return hours + "h" + " ago";
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return days + "d" + " ago";
    }

    return new Date(time).toLocaleDateString();
}

function savePosts() {

    localStorage.setItem(
        "HBN_Posts",
        JSON.stringify(posts)
    );

}