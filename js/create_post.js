$(document).ready(function () {
  const titleInput = $("#title");
  const contentTextarea = $("#content");
  const submitButton = $(".submit-button");
  const titleHelper = $("#title-helper");
  const titleMaxLength = 26;
  let titleValid = false;
  let contentValid = false;

  // 제목 입력 시 글자 수 제한
  titleInput.on("input", function () {
    const titleValue = $(this).val();
    if (titleValue.length > titleMaxLength) {
      $(this).val(titleValue.substring(0, titleMaxLength));
    }
    titleValid = titleValue.length > 0;
    validateForm();
  });

  // 내용 입력 시 유효성 검사
  contentTextarea.on("input", function () {
    contentValid = $(this).val().length > 0;
    validateForm();
  });

  // 이미지 업로드 처리
  $("#image").on("change", function (event) {
    const files = event.target.files;
    if (files.length > 20) {
      alert("이미지는 최대 20개까지 업로드할 수 있습니다.");
      $(this).val(null);
    }
  });

  // 폼 유효성 검사
  function validateForm() {
    if (titleValid && contentValid) {
      submitButton.css("background-color", "#7F6AEE");
      titleHelper.addClass("hidden");
    } else {
      submitButton.css("background-color", "#ACAOEB");
      titleHelper.text("*제목, 내용을 모두 작성해주세요");
      titleHelper.removeClass("hidden");
    }
  }

  // 폼 제출 처리
  $(".post-form").on("submit", function (event) {
    event.preventDefault();

    if (titleValid && contentValid) {
      const formData = new FormData();
      formData.append("title", titleInput.val());
      formData.append("content", contentTextarea.val());

      const fileInput = document.getElementById("image");
      const files = fileInput.files;
      if (files.length === 0) {
        formData.append("photos", new File([], "")); // 빈 파일 추가
      } else {
        for (let i = 0; i < files.length; i++) {
          formData.append("photos", files[i]);
        }
      }

      const userData = localStorage.getItem("userData");
      if (!userData) {
        alert("로그인이 필요합니다.");
        // window.location.href = "login.html";
        window.location.href = "/index.html";
        return;
      }

      const parsedUserData = JSON.parse(userData);
      $.ajax({
        url: "http://localhost:8080/api/posts",
        type: "POST",
        headers: {
          Authorization: `Bearer ${parsedUserData.token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            alert("게시글이 성공적으로 등록되었습니다.");
            // window.location.href = "index.html";
            window.location.href = "/main.html";
          } else {
            alert("게시글 등록에 실패했습니다.");
          }
        },
        error: function (xhr, status, error) {
          console.error("오류 발생:", status, error);
          alert("게시글 등록에 실패했습니다.");
        },
      });
    } else {
      titleHelper.text("*제목, 내용을 모두 작성해주세요");
      titleHelper.removeClass("hidden");
    }
  });
});
