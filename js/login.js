function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

$(document).ready(function () {
  // 페이지 로드 시 저장된 아이디, 비밀번호, 체크박스 상태를 불러옴
  var savedEmail = localStorage.getItem("savedEmail");
  var savedPassword = localStorage.getItem("savedPassword");
  var isSaveIdChecked = localStorage.getItem("isSaveIdChecked") === "true";
  var isSavePasswordChecked =
    localStorage.getItem("isSavePasswordChecked") === "true";

  if (savedEmail) {
    $(".input-email").val(savedEmail);
  }
  if (savedPassword) {
    $(".input-password").val(savedPassword);
  }
  $(".save-id").prop("checked", isSaveIdChecked);
  $(".save-password").prop("checked", isSavePasswordChecked);
});

$(".input-email").on("input", function () {
  var email = $(this).val();
  if (email === "") {
    $(".email-helper-text")
      .removeClass("hidden")
      .text("이메일을 입력해주세요.");
  } else if (!validateEmail(email)) {
    $(".email-helper-text")
      .removeClass("hidden")
      .text("올바른 형태의 이메일을 입력해주세요.");
  } else {
    $(".email-helper-text").addClass("hidden");
  }
});

$(".input-password").on("input", function () {
  var password = $(this).val();
  var helperText = $(".password-helper-text");

  if (password === "") {
    helperText.removeClass("hidden").text("비밀번호를 입력해주세요.");
  } else if (password.length <= 8) {
    helperText.removeClass("hidden").text("비밀번호가 짧습니다.");
  } else {
    helperText.addClass("hidden");
  }
});

$(".login-button").click(function (event) {
  event.preventDefault(); // 폼의 기본 제출 동작을 막습니다.

  var email = $(".input-email").val();
  var password = $(".input-password").val();

  if (!validateEmail(email)) {
    $(".email-helper-text")
      .removeClass("hidden")
      .text("올바른 형태의 이메일을 입력해주세요.");
    return;
  }

  if (password === "" || password.length <= 8) {
    $(".password-helper-text")
      .removeClass("hidden")
      .text("비밀번호가 짧습니다.");
    return;
  }

  var loginData = {
    email: email,
    password: password,
  };

  fetch("http://localhost:8080/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
    mode: "cors",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        var userData = {
          userId: data.userId,
          profileImageUrl: data.profileImageUrl,
          nickname: data.nickname,
          token: data.token,
          email: data.email,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        //alert("로그인 성공");
        window.location.href = "/index.html";
      } else {
        if (data.message == "Invalid email or password")
          alert("이메일과 비밀번호가 일치하지 않습니다.");
        else alert("로그인에 실패하였습니다. " + data.message);
      }
    })
    .catch((error) => {
      //console.error("로그인 요청 중 에러 발생:", error);
      alert("서버와 통신할 수 없습니다.");
    });

  // 아이디 저장 체크 여부 저장
  if ($(".save-id").is(":checked")) {
    localStorage.setItem("savedEmail", email);
    localStorage.setItem("isSaveIdChecked", true);
  } else {
    localStorage.removeItem("savedEmail");
    localStorage.setItem("isSaveIdChecked", false);
  }

  // 비밀번호 저장 체크 여부 저장
  if ($(".save-password").is(":checked")) {
    localStorage.setItem("savedPassword", password);
    localStorage.setItem("isSavePasswordChecked", true);
  } else {
    localStorage.removeItem("savedPassword");
    localStorage.setItem("isSavePasswordChecked", false);
  }
});

// $(".signup-link").click(function () {
//   //회원가입 클릭 시 페이지 이동
//   window.location.href = "/signup.html";
// });

$(".find-account-link").click(function () {
  //계정 찾기 클릭 시 아직 페이지 안만듬..
  alert("준비중입니다.");
});
$(".find-password-link").click(function () {
  //비밀번호 찾기 아직 안만듬..
  alert("준비중입니다.");
});
