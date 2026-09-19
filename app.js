"use strict";

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://hfvcvxrljvbqqifgbkac.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_85chCDmVUX_rKw8f3FKfLA_zMWP5__-";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   ELEMENTS
========================================================= */

const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginError = document.getElementById("loginError");

const userEmail = document.getElementById("userEmail");

const cccdForm = document.getElementById("cccdForm");

const saveBtn = document.getElementById("saveBtn");

const formMessage = document.getElementById("formMessage");


/* =========================================================
   KIỂM TRA ĐĂNG NHẬP
========================================================= */

async function checkUser() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {

    console.error(error);

    showLogin();

    return;
  }


  const session = data.session;

  if (session && session.user) {

    showMain(session.user);

  } else {

    showLogin();

  }
}


/* =========================================================
   HIỂN THỊ LOGIN
========================================================= */

function showLogin() {

  loginSection.classList.remove("hidden");

  mainSection.classList.add("hidden");

}


/* =========================================================
   HIỂN THỊ MAIN
========================================================= */

function showMain(user) {

  loginSection.classList.add("hidden");

  mainSection.classList.remove("hidden");

  userEmail.textContent =
    user.email || "---";

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

googleLoginBtn.addEventListener(
  "click",
  async function () {

    loginError.textContent = "";

    const redirectTo =
      window.location.origin +
      window.location.pathname;


    const {
      error
    } = await supabaseClient.auth.signInWithOAuth({

      provider: "google",

      options: {
        redirectTo: redirectTo
      }

    });


    if (error) {

      console.error(error);

      loginError.textContent =
        "Không thể đăng nhập: " +
        error.message;

    }

  }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
  "click",
  async function () {

    await supabaseClient.auth.signOut();

    window.location.reload();

  }
);


/* =========================================================
   CCCD CHỈ CHO PHÉP SỐ
========================================================= */

document
  .getElementById("cccd")
  .addEventListener(
    "input",
    function () {

      this.value =
        this.value
          .replace(/\D/g, "")
          .slice(0, 12);

    }
  );


/* =========================================================
   LƯU CCCD
========================================================= */

cccdForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    formMessage.innerHTML = "";

    const hoTen =
      document
        .getElementById("hoTen")
        .value
        .trim();

    const cccd =
      document
        .getElementById("cccd")
        .value
        .trim();

    const diaChi =
      document
        .getElementById("diaChi")
        .value
        .trim();

    const noiCap =
      document
        .getElementById("noiCap")
        .value
        .trim();

    const ngayCap =
      document
        .getElementById("ngayCap")
        .value;


    /* VALIDATE */

    if (!hoTen) {

      showFormError(
        "Vui lòng nhập họ và tên."
      );

      return;
    }


    if (!/^\d{12}$/.test(cccd)) {

      showFormError(
        "Số CCCD phải gồm đúng 12 chữ số."
      );

      return;
    }


    saveBtn.disabled = true;

    saveBtn.textContent =
      "Đang lưu...";


    try {

      /* KIỂM TRA USER */

      const {
        data: userData
      } =
        await supabaseClient.auth.getUser();

      const user =
        userData.user;


      if (!user) {

        throw new Error(
          "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
        );

      }


      /* INSERT */

      const {
        error
      } =
        await supabaseClient
          .from("cccd_data")
          .insert({

            ho_ten: hoTen,

            cccd: cccd,

            dia_chi:
              diaChi || null,

            noi_cap:
              noiCap || null,

            ngay_cap:
              ngayCap || null

          });


      if (error) {

        throw error;

      }


      /* THÀNH CÔNG */

      formMessage.innerHTML = `
        <div class="success-message">
          ✓ Đã lưu thông tin CCCD thành công.
        </div>
      `;


      cccdForm.reset();


      setTimeout(
        function () {

          formMessage.innerHTML = "";

        },
        3000
      );


    } catch (error) {

      console.error(error);

      showFormError(
        "Lỗi khi lưu dữ liệu: " +
        error.message
      );

    } finally {

      saveBtn.disabled = false;

      saveBtn.textContent =
        "Lưu thông tin";

    }

  }
);


/* =========================================================
   ERROR
========================================================= */

function showFormError(message) {

  formMessage.innerHTML = `
    <div class="error-box">
      ${escapeHtml(message)}
    </div>
  `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
  function (_event, session) {

    if (session && session.user) {

      showMain(session.user);

    } else {

      showLogin();

    }

  }
);


/* =========================================================
   START
========================================================= */

checkUser();
