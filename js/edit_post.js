$(document).ready(function () {
  // url 파라미터로 postId 추출
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");

  // 로컬 스토리지에 있는 userData, token 추출
  var userData = localStorage.getItem("userData");
  // JSON 으로 파싱해주어야함
  userData = JSON.parse(userData);

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
          $("#title").val(post.title);
          $("#content").val(post.content);
        }
      },
    });
  }

  $(".post-form").on("submit", function (event) {
    event.preventDefault(); // 기본 폼 제출을 방지
    var formData = new FormData();
    formData.append("title", $("#title").val());
    formData.append("content", $("#content").val());

    // 이미지 파일이 선택된 경우에만 formData에 추가
    var imageFile = $("#image")[0].files[0];
    if (imageFile) {
      formData.append("photos", imageFile);
    }
    $.ajax({
      url: `http://localhost:8080/api/posts/${postId}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
      data: formData,
      processData: false, // 데이터의 기본 처리를 하지 않음
      contentType: false, // contentType을 설정하지 않음
      success: function (response) {
        if (response.message == "Post updated successfully") {
          alert("수정했습니다");
          window.location.href = `/post_detail.html?postId=${postId}`;
        } else {
          alert("수정에 오류가 발생하였습니다.");
        }
      },
      error: function (xhr, status, error) {
        alert("수정에 오류가 발생하였습니다.");
      },
    });
  });
});
