$(document).ready(function () {
  let verifiedEmail = "";

  // 다음 섹션으로 이동
  function nextSection(current, next) {
    $("." + current).addClass("hidden");
    $("." + next).removeClass("hidden");

    // 다음 섹션으로 이동할 때 이메일을 표시
    if (next === "content-third") {
      $("#email-display").text(verifiedEmail);
    }
  }

  // 이메일 형식 검증
  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // 인증 코드 형식 검증
  function validateVerificationCode(code) {
    return code.length === 6;
  }

  // 비밀번호 유효성 검증
  function validatePassword(password) {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return re.test(password);
  }
  // 닉네임 유효성 검증
  function validateNickname(nickname) {
    return nickname.length >= 2 && nickname.length <= 20;
  }
  // 이메일 유효성 검사 결과 업데이트
  function updateEmailValidation() {
    const email = $("#email").val();
    if (!validateEmail(email)) {
      $("#email-helper-text")
        .removeClass("hidden")
        .text("유효한 이메일을 입력해주세요.");
      return false;
    } else {
      $("#email-helper-text").addClass("hidden");
      return true;
    }
  }

  // 인증 코드 유효성 검사 결과 업데이트
  function updateVerificationCodeValidation() {
    const verificationCode = $("#verification-code").val();
    if (!validateVerificationCode(verificationCode)) {
      $("#email-helper-text")
        .removeClass("hidden")
        .text("인증 코드는 6글자여야 합니다.");
      return false;
    } else {
      $("#email-helper-text").addClass("hidden");
      return true;
    }
  }

  // 비밀번호 유효성 검사 결과 업데이트
  function updatePasswordValidation() {
    const password = $(".input-password").val();
    const confirmPassword = $(".input-password-confirm").val();
    let valid = true;

    if (!validatePassword(password)) {
      $(".password-helper-text")
        .removeClass("hidden")
        .text(
          "비밀번호는 8자 이상 20자 이하이며, 소문자, 대문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다."
        );
      valid = false;
    } else if (password !== confirmPassword) {
      $(".password-helper-text")
        .removeClass("hidden")
        .text("비밀번호가 일치하지 않습니다.");
      valid = false;
    } else {
      $(".password-helper-text").addClass("hidden");
    }

    $(".third-btn-next").prop("disabled", !valid);
    return valid;
  }
  // 닉네임 유효성 검사 결과 업데이트
  function updateNicknameValidation() {
    const nickname = $(".input-nickname").val();
    if (!validateNickname(nickname)) {
      $(".helper-text")
        .removeClass("hidden")
        .text("닉네임은 최소 2글자 이상, 20자 이하여야 합니다.");
      return false;
    } else {
      $(".helper-text").addClass("hidden");
      return true;
    }
  }

  // 이메일 중복 확인 및 인증 코드 전송
  function checkEmail() {
    const email = $("#email").val();
    if (!updateEmailValidation()) {
      return;
    }

    // 이메일 중복 확인 및 인증 코드 전송 요청
    $.ajax({
      url: "http://localhost:8080/api/users/check-email",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: email }),
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
      },
      success: function (response) {
        if (response.success) {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("이메일로 인증 코드를 보냈습니다.");
          $("#verification-code-group").removeClass("hidden");
        } else {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("이메일 중복 확인에 실패하였습니다.");
        }
      },
      error: function (xhr) {
        if (xhr.status === 409) {
          const response = JSON.parse(xhr.responseText);
          $("#email-helper-text").removeClass("hidden").text(response.message);
        } else {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("서버와 통신할 수 없습니다.");
        }
      },
    });
  }

  // 인증 코드 확인
  function checkVerificationCode() {
    const email = $("#email").val();
    const verificationCode = $("#verification-code").val();

    if (!updateVerificationCodeValidation()) {
      return;
    }

    // 인증 코드 확인 요청
    $.ajax({
      url: "http://localhost:8080/api/users/verify-email",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        email: email,
        verificationCode: verificationCode,
      }),
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
      },
      success: function (response) {
        if (response.success) {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("인증이 완료되었습니다.");
          $("#email-next-btn").removeClass("hidden");
          $("#email-next-btn").prop("disabled", false);
          verifiedEmail = email; // 인증된 이메일 저장
        } else {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("인증에 오류가 발생하였습니다.");
          $("#email-next-btn").prop("disabled", true);
        }
      },
      error: function (xhr) {
        if (xhr.status === 400) {
          const response = JSON.parse(xhr.responseText);
          $("#email-helper-text").removeClass("hidden").text(response.message);
        } else {
          $("#email-helper-text")
            .removeClass("hidden")
            .text("서버와 통신할 수 없습니다.");
        }
        $("#email-next-btn").prop("disabled", true);
      },
    });
  }
  // 닉네임 중복 확인
  function checkNickname() {
    const nickname = $(".input-nickname").val();
    if (!updateNicknameValidation()) {
      return;
    }

    // 닉네임 중복 확인 요청
    $.ajax({
      url: `http://localhost:8080/api/users/check-nickname?nickname=${nickname}`,
      method: "GET",
      contentType: "application/json",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
      },
      success: function (response) {
        if (response.success && response.available) {
          $(".helper-text")
            .removeClass("hidden")
            .text("사용 가능한 닉네임입니다.");
          nicknameAvailable = true;
          $(".btn-submit").prop("disabled", false);
        } else {
          $(".helper-text")
            .removeClass("hidden")
            .text("닉네임 중복 확인에 실패하였습니다.");
          $(".btn-submit").prop("disabled", true);
        }
      },
      error: function (xhr) {
        if (xhr.status === 409) {
          const response = JSON.parse(xhr.responseText);
          $(".helper-text").removeClass("hidden").text(response.message);
          $(".btn-submit").prop("disabled", true);
        } else {
          $(".helper-text")
            .removeClass("hidden")
            .text("서버와 통신할 수 없습니다.");
          $(".btn-submit").prop("disabled", true);
        }
      },
    });
  }
  // 프로필 사진 클릭 이벤트
  $(".profile-pic").click(function () {
    $(".input-file").click();
  });

  // 프로필 사진 파일 입력 이벤트
  $(".input-file").change(function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $(".profile-pic").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      $(".helper-text")
        .removeClass("hidden")
        .text("프로필 이미지를 입력해주세요.");
    }
  });

  // 약관 동의 체크박스 상태 업데이트
  function updateAgreeButtonState() {
    const allChecked = $("#agree-all").is(":checked");
    const ageChecked = $("#agree-age").is(":checked");
    const termsChecked = $("#agree-terms").is(":checked");

    if (ageChecked && termsChecked) {
      $(".first-btn-next").prop("disabled", false);
    } else {
      $(".first-btn-next").prop("disabled", true);
    }

    if (ageChecked && termsChecked) {
      $("#agree-all").prop("checked", true);
    } else {
      $("#agree-all").prop("checked", false);
    }
  }

  // 비밀번호 보기 옵션 토글
  $(".toggle-password").click(function () {
    const input = $(this).siblings("input");
    const type = input.attr("type") === "password" ? "text" : "password";
    input.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });

  // 이벤트 핸들러 등록
  $("#agree-all").change(function () {
    const isChecked = $(this).is(":checked");
    $("#agree-age").prop("checked", isChecked);
    $("#agree-terms").prop("checked", isChecked);
    updateAgreeButtonState();
  });

  $("#agree-age, #agree-terms").change(function () {
    updateAgreeButtonState();
  });

  $("#email").on("input", function () {
    updateEmailValidation();
  });

  $("#verification-code").on("input", function () {
    updateVerificationCodeValidation();
  });

  $(".input-password, .input-password-confirm").on("input", function () {
    updatePasswordValidation();
  });

  $(".first-btn-next").click(function () {
    nextSection("content-first", "content-second");
  });

  $(".btn-check-email").click(function () {
    checkEmail();
  });

  $(".btn-check-code").click(function () {
    checkVerificationCode();
  });

  $(".second-btn-next").click(function () {
    nextSection("content-second", "content-third");
  });

  $(".third-btn-next").click(function () {
    if (!$(this).prop("disabled")) {
      nextSection("content-third", "content-fourth");
    }
  });
  $(".btn-check-nickname").click(function () {
    checkNickname();
  });
  $(".btn-submit").click(function () {
    if (nicknameAvailable) {
      const formData = new FormData();
      formData.append(
        "user",
        JSON.stringify({
          email: verifiedEmail,
          password: $(".input-password").val(),
          nickname: $(".input-nickname").val(),
        })
      );
      formData.append("profileImage", $(".input-file")[0].files[0]);

      $.ajax({
        url: "http://localhost:8080/api/users/register",
        method: "POST",
        contentType: false,
        processData: false,
        data: formData,
        success: function (response) {
          if (response.success) {
            alert("회원가입이 완료되었습니다.");
            window.location.href = "/login";
          } else {
            alert("오류가 발생하였습니다.");
            location.reload();
          }
        },
        error: function () {
          alert("오류가 발생하였습니다.");
          location.reload();
        },
      });
    }
  });

  // 초기 상태 업데이트
  updateAgreeButtonState();
  $("#email-next-btn").prop("disabled", true); // 처음에 "다음" 버튼을 비활성화
  $(".btn-submit").prop("disabled", true); // 처음에 "가입하기" 버튼을 비활성화
});
