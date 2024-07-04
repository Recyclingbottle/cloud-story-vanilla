$(document).ready(function () {
  // 날짜 계산 함수
  function formatDate(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return "방금 전";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    }
  }
  // url 파라미터로 postId 추출
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  // 로컬 스토리지에 있는 userData, token 추출
  var userData = localStorage.getItem("userData");
  // JSON 으로 파싱해주어야함
  userData = JSON.parse(userData);

  // 목록 버튼 누르면
  $(".list-button").on("click", function () {
    // window.location.href = "/index.html";
    window.location.href = "/main.html";
  });
  $(".post-edit").on("click", function () {
    window.location.href = `/edit_post.html?postId=${postId}`;
  });
  $(".post-delete").on("click", function () {
    const postDeleteConfirmed = confirm("해당 게시글을 삭제하시겠습니까?");
    if (postDeleteConfirmed) {
      $.ajax({
        url: `http://localhost:8080/api/posts/${postId}`,
        type: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function (response) {
          alert("게시글이 삭제되었습니다.");
          // window.location.href = "/index.html";
          window.location.href = "/main.html";
        },
        error: function (xhr, status, error) {
          alert(
            `게시글 삭제에 오류가 발생하였습니다. : ${
              xhr.responseText || error
            }`
          );
          // window.location.href = "/index.html";
          window.location.href = "/main.html";
        },
      });
    }
  });

  // 게시글 id 추출이 성공했다면
  if (postId) {
    // GET 으로 게시글 데이터 불러오기
    $.ajax({
      url: `http://localhost:8080/api/posts/${postId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
      success: function (response) {
        // 성공하면,
        if (response.success) {
          const post = response.post;
          const date = new Date(post.createdAt);

          $(".post-title").text(post.title);
          $(".post-date").text(formatDate(date));
          $(".author-profile").attr(
            "src",
            `http://localhost:8080/api/files${post.user.profilePictureUrl}`
          );
          $(".post-author").text(post.user.nickname);
          $(".post-views").text(`조회수 ${post.viewCount}`);
          $(".post-likes").text(`좋아요 ${post.likeCount}`);
          $(".post-dislikes").text(`싫어요 ${post.dislikeCount}`);
          $(".post-comments").text(`댓글 수 ${post.commentCount}`);
          $(".post-content").text(post.content);

          if (post.photos && post.photos.length > 0) {
            post.photos.forEach((photo) => {
              if (photo.url) {
                $(".post-image-container").append(
                  `<img src="http://localhost:8080/api/files${photo.url}" alt="게시글 이미지" class="post-image" />`
                );
              }
            });
          }
        }
      },
    });

    // 좋아요 버튼을 누르면
    $(".like-button").click(function () {
      $.ajax({
        url: `http://localhost:8080/api/posts/${postId}/like`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function () {
          alert("해당 게시글에 좋아요를 추가했습니다.");
          location.reload();
        },
        error: function (xhr) {
          if (xhr.status === 409) {
            // 좋아요를 이미 눌렀으므로 취소 요청을 보냅니다.
            $.ajax({
              url: `http://localhost:8080/api/posts/${postId}/like`,
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${userData.token}`,
              },
              success: function () {
                alert("해당 게시글의 좋아요를 취소했습니다.");
                location.reload();
              },
            });
          }
        },
      });
    });

    // 싫어요 버튼을 누르면, 이미 눌렀다면 취소 아니라면 싫어요
    $(".dislike-button").click(function () {
      $.ajax({
        url: `http://localhost:8080/api/posts/${postId}/dislike`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function () {
          alert("해당 게시글에 싫어요를 추가했습니다.");
          location.reload();
        },
        error: function (xhr) {
          if (xhr.status === 409) {
            // 싫어요를 이미 눌렀으므로 취소 요청을 보냅니다.
            $.ajax({
              url: `http://localhost:8080/api/posts/${postId}/dislike`,
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${userData.token}`,
              },
              success: function () {
                alert("해당 게시글에 싫어요를 취소했습니다.");
                location.reload();
              },
            });
          }
        },
      });
    });

    $(".submit-comment").click(function () {
      const commentContent = $(".comment-textarea").val();
      $.ajax({
        url: `http://localhost:8080/api/posts/${postId}/comments`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        data: JSON.stringify({ content: commentContent }),
        contentType: "application/json",
        success: function () {
          loadComments(postId);
          $(".comment-textarea").val("");
        },
      });
    });

    function loadComments(postId, page = 1) {
      $.ajax({
        url: `http://localhost:8080/api/posts/${postId}/comments?page=${page}&limit=10&sort=createdAt&direction=asc`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function (response) {
          if (response.success) {
            $(".comment-list").empty();
            response.comments.forEach((comment) => {
              $(".comment-list").append(`
                  <div class="comment-item" data-comment-id="${comment.id}">
                    <img src="http://localhost:8080/api/files${
                      comment.user.profilePictureUrl
                    }" alt="댓글 작성자 프로필" class="comment-author-profile" />
                    <div class="comment-body">
                      <div class="comment-header">
                        <span class="comment-author">${
                          comment.user.nickname
                        }</span>
                        <span class="comment-date">${new Date(
                          comment.createdAt
                        ).toLocaleTimeString()}</span>
                        <div class="comment-actions">
                          <button class="comment-like"><i class="fas fa-thumbs-up"></i></button>
                          <button class="comment-dislike"><i class="fas fa-thumbs-down"></i></button>
                          <button class="comment-edit"><i class="fas fa-edit"></i></button>
                          <button class="comment-delete"><i class="fas fa-trash"></i></button>
                        </div>
                      </div>
                      <span class="comment-content">${comment.content}</span>
                    </div>
                  </div>
                `);
            });

            $(".pagination").empty();
            for (let i = 1; i <= response.totalPages; i++) {
              $(".pagination").append(
                `<button class="pagination-button" data-page="${i}">${i}</button>`
              );
            }

            $(".pagination-button").click(function () {
              const page = $(this).data("page");
              loadComments(postId, page);
            });

            $(".comment-like").on("click", function () {
              const commentId = $(this)
                .closest(".comment-item")
                .data("comment-id");
              //alert(`댓글 ${commentId} 좋아요 누름`);
              $.ajax({
                url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}/like`,
                method: "POST",
                headers: {
                  Authorization: `Bearer ${userData.token}`,
                },
                success: function () {
                  alert("해당 댓글에 좋아요를 추가했습니다.");
                  location.reload();
                },
                error: function (xhr) {
                  if (xhr.status === 409) {
                    // 좋아요를 이미 눌렀으므로 취소 요청을 보냅니다.
                    $.ajax({
                      url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}/like`,
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${userData.token}`,
                      },
                      success: function () {
                        alert("해당 댓글에 좋아요를 취소했습니다.");
                        location.reload();
                      },
                    });
                  }
                },
              });
            });

            $(".comment-dislike").on("click", function () {
              const commentId = $(this)
                .closest(".comment-item")
                .data("comment-id");
              //alert(`댓글 ${commentId} 싫어요 누름`);
              $.ajax({
                url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}/dislike`,
                method: "POST",
                headers: {
                  Authorization: `Bearer ${userData.token}`,
                },
                success: function () {
                  alert("해당 댓글에 싫어요를 추가했습니다.");
                  location.reload();
                },
                error: function (xhr) {
                  if (xhr.status === 409) {
                    // 싫어요를 이미 눌렀으므로 취소 요청을 보냅니다.
                    $.ajax({
                      url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}/dislike`,
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${userData.token}`,
                      },
                      success: function () {
                        alert("해당 댓글에 싫어요를 취소했습니다.");
                        location.reload();
                      },
                    });
                  }
                },
              });
            });

            $(".comment-edit").on("click", function () {
              $(".submit-comment").addClass("hidden");
              $(".edit-comment").removeClass("hidden");
              const $commentItem = $(this).closest(".comment-item");
              const commentId = $commentItem.data("comment-id");
              const commentContent = $commentItem
                .find(".comment-content")
                .text();
              const commentAuthor = $commentItem.find(".comment-author").text();
              if (userData.nickname == commentAuthor) {
                $(".comment-textarea").val(commentContent);
                $(".edit-comment").on("click", function () {
                  $.ajax({
                    url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${userData.token}`,
                    },
                    contentType: "application/json", // 보낼 데이터의 타입을 JSON으로 설정
                    data: JSON.stringify({
                      content: $(".comment-textarea").val(),
                    }),
                    success: function (response) {
                      alert("댓글 수정이 완료되습니다");
                      location.reload();
                    },
                    error: function (xhr, status, error) {
                      alert("댓글 수정에 오류가 발생하였습니다.");
                      location.reload();
                    },
                  });

                  $(".submit-comment").removeClass("hidden");
                  $(".edit-comment").addClass("hidden");
                });
              } else {
                alert("수정 권한이 없습니다.");
              }
            });

            $(".comment-delete").on("click", function () {
              const commentId = $(this)
                .closest(".comment-item")
                .data("comment-id");
              // 로컬 스토리지에 있는 이메일이랑 같은 지 확인하고 권한이 없다 표시
              const commentDeleteConfirmed =
                confirm("해당 댓글을 삭제하시겠습니까?");
              if (commentDeleteConfirmed) {
                $.ajax({
                  url: `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${userData.token}`,
                  },
                  success: function () {
                    alert("댓글을 삭제하였습니다.");
                    location.reload();
                  },
                  error: function (xhr) {
                    alert("오류가 발생하였습니다.", xhr);
                  },
                });
              }
            });
          }
        },
      });
    }

    loadComments(postId);
  }
});
