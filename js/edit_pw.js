$(document).ready(function () {
  // 페이지 로드 시 userData 확인
  var userData = localStorage.getItem("userData");
  // userData 를 JSON 으로 파싱
  userData = JSON.parse(userData);

  $("#email").text(userData.email);

  // 새 비밀번호 유효성 검사
  $("#new-password").on("input", function () {
    var newPassword = $(this).val();
    var guideline = "";

    if (!/[A-Z]/.test(newPassword)) {
      guideline = "비밀번호는 대문자를 하나 이상 포함해야 합니다.";
    } else if (!/[a-z]/.test(newPassword)) {
      guideline = "비밀번호는 소문자를 하나 이상 포함해야 합니다.";
    } else if (newPassword.length < 8 || newPassword.length > 32) {
      guideline = "비밀번호는 8자 이상 32자 이하여야 합니다.";
    }
    console.log("유효성 검사");

    $(".password-guideline").text(guideline);
  });

  // 비밀번호 확인 유효성 검사
  $("#confirm-password").on("input", function () {
    var confirmPassword = $(this).val();
    var newPassword = $("#new-password").val();

    if (confirmPassword !== newPassword) {
      $(".confirm-password-guideline").text("비밀번호 확인이 틀립니다.");
    } else {
      $(".confirm-password-guideline").text("");
    }
  });

  // 비밀번호 업데이트 버튼 클릭 이벤트
  $(".btn-update").click(function () {
    var newPassword = $("#new-password").val();
    var confirmPassword = $("#confirm-password").val();

    // 유효성 검사 통과 여부 확인
    if (
      $(".password-guideline").text() === "" &&
      newPassword === confirmPassword
    ) {
      var formData = new FormData();
      formData.append("user", JSON.stringify({ password: newPassword }));

      $.ajax({
        url: "http://3.38.152.113/api/users/update",
        type: "PUT",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
          alert("비밀번호가 성공적으로 변경되었습니다.");
          localStorage.removeItem("userData");
          // window.location.href = "/login.html";
          window.location.href = "/index.html";
        },
        error: function () {
          alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
        },
      });
    } else {
      alert("비밀번호를 올바르게 입력해주세요.");
    }
  });

  // 취소 버튼 클릭 이벤트
  $(".btn-cancel").click(function () {
    window.location.href = "/main.html";
  });
});
