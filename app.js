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

const cccdForm =
  document.getElementById("cccdForm");

const saveBtn =
  document.getElementById("saveBtn");

const formMessage =
  document.getElementById("formMessage");

const cccdInput =
  document.getElementById("cccd");


/* =========================================================
   CCCD CHỈ NHẬP SỐ
========================================================= */

cccdInput.addEventListener(
  "input",
  function () {

    this.value =
      this.value
        .replace(/\D/g, "")
        .slice(0, 12);

  }
);


/* =========================================================
   SUBMIT
========================================================= */

cccdForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    formMessage.innerHTML = "";


    /* LẤY DỮ LIỆU */

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


    /* =====================================================
       KIỂM TRA
    ===================================================== */

    if (!hoTen) {

      showError(
        "Vui lòng nhập họ và tên."
      );

      return;

    }


    if (!/^\d{12}$/.test(cccd)) {

      showError(
        "CCCD phải gồm đúng 12 số."
      );

      return;

    }


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    saveBtn.disabled = true;

    saveBtn.textContent =
      "Đang lưu...";


    /* =====================================================
       INSERT
    ===================================================== */

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


    /* =====================================================
       ERROR
    ===================================================== */

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


    /* =====================================================
       SUCCESS
    ===================================================== */

    showSuccess(
      "Đã lưu thông tin CCCD thành công!"
    );


    /* XÓA FORM */

    cccdForm.reset();


    /* ĐƯA CON TRỎ VỀ HỌ TÊN */

    setTimeout(
      function () {

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
   SUCCESS MESSAGE
========================================================= */

function showSuccess(message) {

  formMessage.innerHTML = `

    <div class="success-message">

      ✓ ${escapeHtml(message)}

    </div>

  `;

}


/* =========================================================
   ERROR MESSAGE
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

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}
