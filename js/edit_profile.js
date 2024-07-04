$(document).ready(function () {
  // 페이지 로드 시 userData 확인
  var userData = localStorage.getItem("userData");
  // userData 를 JSON 으로 파싱
  userData = JSON.parse(userData);
  // userData 가 존재하지 않을 경우에 대한 예외 처리
  if (!userData) {
    alert("로그인을 다시 해주시길 바랍니다.");
    // window.location.href = "/login.html";
    window.location.href = "/index.html";
  }

  // 이미지 URL 링크
  var userProfileUrl = `http://3.38.152.113/api/files${userData.profileImageUrl}`;

  // 프로필 이미지, 이메일, 닉네임을 초기 설정
  $(".profile-img").attr("src", userProfileUrl);
  $("#email").text(userData.email);
  $("#nickname").val(userData.nickname);

  // img 요소를 클릭하면 input[type="file"] 요소가 열리도록 설정
  $(".profile-img").click(function () {
    $("#profile-img").click();
  });

  // 파일 입력 요소에 변경이 있을 때
  $("#profile-img").change(function (event) {
    var input = event.target;
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        $(".profile-img").attr("src", e.target.result);
      };

      reader.readAsDataURL(input.files[0]);
    }
  });

  $(".btn-check-nickname").click(function () {
    var newNickname = $("#nickname").val();

    if (newNickname == userData.nickname) {
      alert("닉네임이 변경되지 않았습니다.");
    } else {
      // 닉네임 중복 확인
      $.ajax({
        url: `http://3.38.152.113/api/users/check-nickname?nickname=${newNickname}`,
        type: "GET",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function (response) {
          alert("사용 가능한 닉네임입니다.");
        },
        error: function (xhr) {
          if (xhr.status === 409) {
            alert("이미 사용 중인 닉네임입니다.");
          } else {
            alert("닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.");
          }
        },
      });
    }
  });

  $(".btn-update").click(function () {
    var newNickname = $("#nickname").val();

    if (newNickname !== userData.nickname) {
      // 닉네임이 변경된 경우 중복 확인
      $.ajax({
        url: `http://3.38.152.113/api/users/check-nickname?nickname=${newNickname}`,
        type: "GET",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function (response) {
          updateProfile(newNickname);
        },
        error: function (xhr) {
          if (xhr.status === 409) {
            alert("이미 사용 중인 닉네임입니다.");
          } else {
            alert("닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.");
          }
        },
      });
    } else {
      updateProfile(newNickname);
    }
  });

  function updateProfile(newNickname) {
    // FormData 생성
    var formData = new FormData();
    formData.append("user", JSON.stringify({ nickname: newNickname }));

    var fileInput = $("#profile-img")[0];
    if (fileInput.files && fileInput.files[0]) {
      formData.append("profileImage", fileInput.files[0]);
    }

    // AJAX 요청
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
        alert("회원 정보가 성공적으로 수정되었습니다.");
        // 수정된 정보를 다시 저장
        userData.nickname = newNickname;
        localStorage.setItem("userData", JSON.stringify(userData));
        // window.location.href = "/index.html";
        window.location.href = "/main.html";
      },
      error: function () {
        alert("회원 정보 수정에 실패했습니다. 다시 시도해주세요.");
      },
    });
  }

  $(".btn-cancel").click(function () {
    // window.location.href = "/index.html";
    window.location.href = "/index.html";
  });

  $(".delete-account-link").click(function () {
    if (
      confirm(
        "정말로 탈퇴하시겠어요? 작성한 글과 댓글이 모두 삭제되고 복구할 수 없어요."
      )
    ) {
      $.ajax({
        url: "http://3.38.152.113/api/users/delete",
        type: "DELETE",
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        success: function () {
          alert("회원 탈퇴가 완료되었습니다.");
          localStorage.removeItem("userData");
          // window.location.href = "/login.html";
          window.location.href = "/index.html";
        },
        error: function () {
          alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
        },
      });
    }
  });
});
