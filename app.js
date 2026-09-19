"use strict";

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://hfvcvxrljvbqqifgbkac.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_85chCDmVUX_rKw8f3FKfLA_zMWP5__-";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   ELEMENTS
========================================================= */

const loginSection =
  document.getElementById("loginSection");

const mainSection =
  document.getElementById("mainSection");

const loginForm =
  document.getElementById("loginForm");

const loginBtn =
  document.getElementById("loginBtn");

const loginError =
  document.getElementById("loginError");

const logoutBtn =
  document.getElementById("logoutBtn");

const userEmail =
  document.getElementById("userEmail");

const cccdForm =
  document.getElementById("cccdForm");

const saveBtn =
  document.getElementById("saveBtn");

const formMessage =
  document.getElementById("formMessage");

const cccdInput =
  document.getElementById("cccd");


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

  loginSection.classList.remove("hidden");

  mainSection.classList.add("hidden");

  logoutBtn.classList.add("hidden");

}


/* =========================================================
   SHOW MAIN
========================================================= */

function showMain(user) {

  loginSection.classList.add("hidden");

  mainSection.classList.remove("hidden");

  logoutBtn.classList.remove("hidden");

  userEmail.textContent =
    user.email || "---";

}


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkUser() {

  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();


  if (error) {

    console.error(error);

    showLogin();

    return;

  }


  if (
    data.session &&
    data.session.user
  ) {

    showMain(
      data.session.user
    );

  } else {

    showLogin();

  }

}


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    loginError.innerHTML = "";

    const email =
      document
        .getElementById("loginEmail")
        .value
        .trim();

    const password =
      document
        .getElementById("loginPassword")
        .value;


    loginBtn.disabled = true;

    loginBtn.textContent =
      "Đang đăng nhập...";


    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email: email,

          password: password

        });


    if (error) {

      console.error(error);

      loginError.innerHTML = `
        <div class="error-box">
          Đăng nhập thất bại.<br>
          ${escapeHtml(error.message)}
        </div>
      `;

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Đăng nhập";

      return;

    }


    loginForm.reset();

    loginBtn.disabled = false;

    loginBtn.textContent =
      "Đăng nhập";


    showMain(data.user);

  }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
  "click",
  async function() {

    await supabaseClient.auth.signOut();

    window.location.reload();

  }
);


/* =========================================================
   CCCD CHỈ CHO NHẬP SỐ
========================================================= */

cccdInput.addEventListener(
  "input",
  function() {

    this.value =
      this.value
        .replace(/\D/g, "")
        .slice(0, 12);

  }
);


/* =========================================================
   SUBMIT CCCD
========================================================= */

cccdForm.addEventListener(
  "submit",
  async function(event) {

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


    /* KIỂM TRA HỌ TÊN */

    if (!hoTen) {

      showError(
        "Vui lòng nhập họ và tên."
      );

      return;

    }


    /* KIỂM TRA CCCD */

    if (!/^\d{12}$/.test(cccd)) {

      showError(
        "Số CCCD phải gồm đúng 12 số."
      );

      return;

    }


    /* DISABLE BUTTON */

    saveBtn.disabled = true;

    saveBtn.textContent =
      "Đang lưu...";


    /* INSERT SUPABASE */

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


    /* ERROR */

    if (error) {

      console.error(error);

      showError(
        "Không thể lưu dữ liệu: " +
        error.message
      );

      saveBtn.disabled = false;

      saveBtn.textContent =
        "Lưu thông tin";

      return;

    }


    /* SUCCESS */

    showSuccess(
      "Đã lưu thông tin CCCD thành công."
    );


    /* RESET FORM */

    cccdForm.reset();


    /* ĐƯA CON TRỎ VỀ HỌ TÊN */

    setTimeout(
      function() {

        document
          .getElementById("hoTen")
          .focus();

      },
      100
    );


    saveBtn.disabled = false;

    saveBtn.textContent =
      "Lưu thông tin";

  }
);


/* =========================================================
   SUCCESS
========================================================= */

function showSuccess(message) {

  formMessage.innerHTML = `
    <div class="success-message">
      ✓ ${escapeHtml(message)}
    </div>
  `;

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

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
  function(_event, session) {

    if (
      session &&
      session.user
    ) {

      showMain(
        session.user
      );

    } else {

      showLogin();

    }

  }
);


/* =========================================================
   START
========================================================= */

checkUser();
