// jQuery 코드
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
  // 페이지 로드 시 userData 확인
  var userData = localStorage.getItem("userData");
  const now = new Date();

  if (!userData) {
    // userData가 없으면 리다이렉트
    window.location.href = "login.html";
    return;
  }

  // userData 를 JSON 으로 파싱
  userData = JSON.parse(userData);
  // 이미지 URL 링크
  var userProfileUrl = `http://localhost:8080/api/files${userData.profileImageUrl}`;
  $(".user-profile").attr("src", userProfileUrl);

  $(".greeting-username").text(userData.nickname + " 님 ");

  $("#logout").click(function () {
    // 로그아웃 시, 로컬 스토리지 유저데이터 제거
    localStorage.removeItem("userData");
    alert("로그아웃 되었습니다");
    // 로그인 페이지로 이동
    window.location.href = "/login.html";
  });

  $(".navbar-left").click(function () {
    // 아이콘, 홈페이지 로고 등을 누르면 현재 페이지 재로딩
    window.location.href = "/index.html";
  });

  // 오늘의 인기글 불러오기
  $.ajax({
    url: "http://localhost:8080/api/posts/popular/today",
    type: "GET",
    headers: {
      Authorization: "Bearer " + userData.token,
    },
    success: function (response) {
      if (response.success) {
        const posts = response.posts.slice(0, 5);
        const tbody = $("#today-post-table-body");
        tbody.empty(); // 기존 내용을 지우고

        // 받은 데이터를 테이블에 삽입
        posts.forEach((post, index) => {
          const tr = $("<tr></tr>");

          // 제목이 20자를 넘으면 "..."으로 표시
          let title = post.title;
          if (title.length > 15) {
            title = title.substring(0, 15) + "...";
          }

          var date = new Date(post.createdAt);
          date = formatDate(date);
          console.log(date);
          tr.append(`<td class="post-table-rank">${index + 1}</td>`);
          tr.append(`<td class="post-table-title">${title}</td>`);
          tr.append(`<td class="post-table-date">${date}</td>`);
          tr.append(`<td class="post-table-views">${post.viewCount}</td>`);
          tr.append(`<td class="post-table-likes">${post.likeCount}</td>`);
          tr.attr("data-post-id", post.id); // postId를 데이터 속성으로 추가
          tr.click(function () {
            window.location.href = `/post_detail.html?postId=${post.id}`;
          });
          tbody.append(tr);
        });
      } else {
        alert("데이터를 불러오는데 실패했습니다.");
      }
    },
    error: function (xhr, status, error) {
      console.error("오류 발생:", status, error);
      alert("데이터를 불러오는데 실패했습니다.");
    },
  });

  // 이번 주 인기글 불러오기
  $.ajax({
    url: "http://localhost:8080/api/posts/popular/week",
    type: "GET",
    headers: {
      Authorization: "Bearer " + userData.token,
    },
    success: function (response) {
      if (response.success) {
        const posts = response.posts.slice(0, 5); // 상위 5개만 가져오기
        const tbody = $("#weekly-post-table-body");
        tbody.empty(); // 기존 내용을 지우고

        // 받은 데이터를 테이블에 삽입
        posts.forEach((post, index) => {
          const tr = $("<tr></tr>");

          // 제목이 20자를 넘으면 "..."으로 표시
          let title = post.title;
          if (title.length > 20) {
            title = title.substring(0, 20) + "...";
          }

          // 날짜 형식을 "YYYY.MM.DD"로 변경
          const date = new Date(post.createdAt);
          const formattedDate = formatDate(date);

          tr.append(`<td class="post-table-rank">${index + 1}</td>`);
          tr.append(`<td class="post-table-title">${title}</td>`);
          tr.append(`<td class="post-table-date">${formattedDate}</td>`);
          tr.append(`<td class="post-table-views">${post.viewCount}</td>`);
          tr.append(`<td class="post-table-likes">${post.likeCount}</td>`);
          tr.attr("data-post-id", post.id); // postId를 데이터 속성으로 추가
          tr.click(function () {
            window.location.href = `/post_detail.html?postId=${post.id}`;
          });
          tbody.append(tr);
        });
      } else {
        alert("데이터를 불러오는데 실패했습니다.");
      }
    },
    error: function (xhr, status, error) {
      console.error("오류 발생:", status, error);
      alert("데이터를 불러오는데 실패했습니다.");
    },
  });

  // 전체 게시글 관련 코드
  let currentPage = 1;
  const limit = 10;
  let sort = "createdAt";
  let direction = "desc";
  let totalPages = 1;

  // 전체 게시글 가져오기 함수
  function fetchPosts(page, sort, direction) {
    $.ajax({
      url: `http://localhost:8080/api/posts?page=${page}&limit=${limit}&sort=${sort}&direction=${direction}`,
      type: "GET",
      headers: {
        Authorization: "Bearer " + userData.token,
      },
      success: function (response) {
        if (response.success) {
          renderPosts(response.posts);
          $("#current-page").text(response.currentPage);
          totalPages = response.totalPages;
          $("#total-pages").text(totalPages);
          togglePaginationButtons();
        } else {
          alert("데이터를 불러오는데 실패했습니다.");
        }
      },
      error: function (xhr, status, error) {
        console.error("오류 발생:", status, error);
        alert("데이터를 불러오는데 실패했습니다.");
      },
    });
  }
  // 게시글 렌더링 함수
  function renderPosts(posts) {
    const tbody = $("#post-table-body");
    tbody.empty(); // 기존 내용을 지우고

    posts.forEach((post) => {
      const tr = $("<tr></tr>");

      // 제목이 20자를 넘으면 "..."으로 표시
      let title = post.title;
      if (title.length > 20) {
        title = title.substring(0, 20) + "...";
      }

      // 날짜 형식을 "YYYY.MM.DD"로 변경
      var date = new Date(post.createdAt);
      const formattedDate = formatDate(date);

      tr.append(`<td>${post.id}</td>`);
      tr.append(`<td>일반</td>`);
      tr.append(`<td>${title}</td>`);
      tr.append(
        `<td><img class="author-profile" src="http://localhost:8080/api/files${post.user.profilePictureUrl}" alt=""/>${post.user.nickname}</td>`
      );
      tr.append(`<td>${formattedDate}</td>`);
      tr.append(`<td>${post.viewCount}</td>`);
      tr.append(`<td>${post.likeCount}</td>`);
      tr.attr("data-post-id", post.id); // postId를 데이터 속성으로 추가
      tr.click(function () {
        window.location.href = `/post_detail.html?postId=${post.id}`;
      });
      tbody.append(tr);
    });
  }

  // 페이지네이션 버튼 활성/비활성화 함수
  function togglePaginationButtons() {
    if (currentPage <= 1) {
      $("#prev-page").attr("disabled", true);
    } else {
      $("#prev-page").attr("disabled", false);
    }

    if (currentPage >= totalPages) {
      $("#next-page").attr("disabled", true);
    } else {
      $("#next-page").attr("disabled", false);
    }
  }

  // 초기 데이터 가져오기
  fetchPosts(currentPage, sort, direction);

  // 최신순 버튼 클릭 이벤트
  $("#sort-latest").on("click", function () {
    $(".filter-button").removeClass("actived-btn");
    $("#sort-latest").addClass("actived-btn");
    sort = "createdAt";
    direction = "desc";
    currentPage = 1;
    fetchPosts(currentPage, sort, direction);
  });

  // 조회수순 버튼 클릭 이벤트
  $("#sort-views").on("click", function () {
    $(".filter-button").removeClass("actived-btn");
    $("#sort-views").addClass("actived-btn");
    sort = "viewCount";
    direction = "desc";
    currentPage = 1;
    fetchPosts(currentPage, sort, direction);
  });

  // 좋아요순 버튼 클릭 이벤트
  $("#sort-likes").on("click", function () {
    $(".filter-button").removeClass("actived-btn");
    $("#sort-likes").addClass("actived-btn");
    sort = "likeCount";
    direction = "desc";
    currentPage = 1;
    fetchPosts(currentPage, sort, direction);
  });

  // 이전 페이지 버튼 클릭 이벤트
  $("#prev-page").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchPosts(currentPage, sort, direction);
    }
  });

  // 다음 페이지 버튼 클릭 이벤트
  $("#next-page").on("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      fetchPosts(currentPage, sort, direction);
    }
  });

  // 검색 버튼 클릭 이벤트
  $(".search-button").on("click", function () {
    alert("검색은 준비중 입니다.");
  });

  // 게시글 작성 버튼 클릭 이벤트
  $(".write-button").on("click", function () {
    window.location.href = `/create_post.html`;
  });
});
