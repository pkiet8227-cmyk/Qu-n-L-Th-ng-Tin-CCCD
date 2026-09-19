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
   SETTINGS
========================================================= */

const PAGE_SIZE = 20;

let allData = [];

let filteredData = [];

let currentPage = 1;

let editingId = null;


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

const searchInput =
  document.getElementById("searchInput");

const refreshBtn =
  document.getElementById("refreshBtn");

const exportBtn =
  document.getElementById("exportBtn");

const dataBody =
  document.getElementById("dataBody");

const totalCount =
  document.getElementById("totalCount");

const emptyMessage =
  document.getElementById("emptyMessage");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const pageInfo =
  document.getElementById("pageInfo");

const tableMessage =
  document.getElementById("tableMessage");


/* MODAL */

const editModal =
  document.getElementById("editModal");

const closeModalBtn =
  document.getElementById("closeModalBtn");

const cancelEditBtn =
  document.getElementById("cancelEditBtn");

const editForm =
  document.getElementById("editForm");

const editMessage =
  document.getElementById("editMessage");


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


    /* =====================================================
       LOGIN ERROR
    ===================================================== */

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


    /* =====================================================
       LOGIN SUCCESS
    ===================================================== */

    loginForm.reset();


    loginBtn.disabled = false;

    loginBtn.textContent =
      "Đăng nhập";


    showMain(
      data.user
    );


    await loadData();

  }
);


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


    await loadData();

  } else {

    showLogin();

  }

}


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
   LOAD DATA
========================================================= */

async function loadData() {

  showTableMessage(
    "Đang tải dữ liệu..."
  );


  const {
    data,
    error
  } =
    await supabaseClient
      .from("cccd_data")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);


    showTableError(
      "Không thể tải dữ liệu: " +
      error.message
    );


    return;

  }


  allData =
    data || [];


  totalCount.textContent =
    allData.length;


  currentPage = 1;


  applySearch();

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
  "input",
  function() {

    currentPage = 1;

    applySearch();

  }
);


function applySearch() {

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  if (!keyword) {

    filteredData =
      [...allData];

  } else {

    filteredData =
      allData.filter(
        function(item) {

          return (

            String(
              item.ho_ten || ""
            )
              .toLowerCase()
              .includes(keyword)

            ||

            String(
              item.cccd || ""
            )
              .includes(keyword)

          );

        }
      );

  }


  renderTable();

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

  dataBody.innerHTML = "";

  tableMessage.innerHTML = "";


  if (
    filteredData.length === 0
  ) {

    emptyMessage.classList.remove(
      "hidden"
    );


    pageInfo.textContent =
      "Trang 0";


    prevBtn.disabled = true;

    nextBtn.disabled = true;


    return;

  }


  emptyMessage.classList.add(
    "hidden"
  );


  const totalPages =
    Math.ceil(
      filteredData.length /
      PAGE_SIZE
    );


  if (
    currentPage > totalPages
  ) {

    currentPage =
      totalPages;

  }


  const start =
    (currentPage - 1) *
    PAGE_SIZE;


  const end =
    start + PAGE_SIZE;


  const pageData =
    filteredData.slice(
      start,
      end
    );


  pageData.forEach(
    function(item) {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>

          <strong>
            ${escapeHtml(item.ho_ten)}
          </strong>

        </td>


        <td>

          ${escapeHtml(item.cccd)}

        </td>


        <td>

          ${escapeHtml(item.dia_chi || "")}

        </td>


        <td>

          ${escapeHtml(item.noi_cap || "")}

        </td>


        <td>

          ${formatDate(item.ngay_cap)}

        </td>


        <td>

          <div class="action-buttons">


            <button
              class="action-btn edit-btn"
              onclick="openEdit('${item.id}')"
            >
              Sửa
            </button>


            <button
              class="action-btn delete-btn"
              onclick="deleteData('${item.id}')"
            >
              Xóa
            </button>


          </div>

        </td>

      `;


      dataBody.appendChild(tr);

    }
  );


  pageInfo.textContent =
    `Trang ${currentPage} / ${totalPages}`;


  prevBtn.disabled =
    currentPage <= 1;


  nextBtn.disabled =
    currentPage >= totalPages;

}


/* =========================================================
   PAGINATION
========================================================= */

prevBtn.addEventListener(
  "click",
  function() {

    if (currentPage > 1) {

      currentPage--;

      renderTable();

    }

  }
);


nextBtn.addEventListener(
  "click",
  function() {

    const totalPages =
      Math.ceil(
        filteredData.length /
        PAGE_SIZE
      );


    if (
      currentPage < totalPages
    ) {

      currentPage++;

      renderTable();

    }

  }
);


/* =========================================================
   REFRESH
========================================================= */

refreshBtn.addEventListener(
  "click",
  async function() {

    await loadData();

  }
);


/* =========================================================
   OPEN EDIT
========================================================= */

window.openEdit =
  function(id) {

    const item =
      allData.find(
        function(row) {

          return String(row.id) ===
            String(id);

        }
      );


    if (!item) {

      alert(
        "Không tìm thấy dữ liệu."
      );

      return;

    }


    editingId =
      item.id;


    document.getElementById(
      "editHoTen"
    ).value =
      item.ho_ten || "";


    document.getElementById(
      "editCccd"
    ).value =
      item.cccd || "";


    document.getElementById(
      "editDiaChi"
    ).value =
      item.dia_chi || "";


    document.getElementById(
      "editNoiCap"
    ).value =
      item.noi_cap || "";


    document.getElementById(
      "editNgayCap"
    ).value =
      item.ngay_cap || "";


    editMessage.innerHTML = "";


    editModal.classList.remove(
      "hidden"
    );

  };


/* =========================================================
   CLOSE EDIT
========================================================= */

function closeEdit() {

  editModal.classList.add(
    "hidden"
  );

  editingId = null;

}


closeModalBtn.addEventListener(
  "click",
  closeEdit
);


cancelEditBtn.addEventListener(
  "click",
  closeEdit
);


/* =========================================================
   EDIT CCCD - ONLY NUMBER
========================================================= */

document
  .getElementById("editCccd")
  .addEventListener(
    "input",
    function() {

      this.value =
        this.value
          .replace(/\D/g, "")
          .slice(0, 12);

    }
  );


/* =========================================================
   SAVE EDIT
========================================================= */

editForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const hoTen =
      document
        .getElementById("editHoTen")
        .value
        .trim();


    const cccd =
      document
        .getElementById("editCccd")
        .value
        .trim();


    const diaChi =
      document
        .getElementById("editDiaChi")
        .value
        .trim();


    const noiCap =
      document
        .getElementById("editNoiCap")
        .value
        .trim();


    const ngayCap =
      document
        .getElementById("editNgayCap")
        .value;


    if (!hoTen) {

      showEditError(
        "Vui lòng nhập họ tên."
      );

      return;

    }


    if (!/^\d{12}$/.test(cccd)) {

      showEditError(
        "CCCD phải gồm đúng 12 số."
      );

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from("cccd_data")
        .update({

          ho_ten: hoTen,

          cccd: cccd,

          dia_chi:
            diaChi || null,

          noi_cap:
            noiCap || null,

          ngay_cap:
            ngayCap || null

        })
        .eq(
          "id",
          editingId
        );


    if (error) {

      console.error(error);

      showEditError(
        "Không thể cập nhật: " +
        error.message
      );

      return;

    }


    closeEdit();

    await loadData();

  }
);


/* =========================================================
   DELETE
========================================================= */

window.deleteData =
  async function(id) {

    const item =
      allData.find(
        function(row) {

          return String(row.id) ===
            String(id);

        }
      );


    if (!item) {

      return;

    }


    const confirmed =
      confirm(
        `Bạn có chắc muốn xóa hồ sơ của "${item.ho_ten}"?`
      );


    if (!confirmed) {

      return;

    }


    const {
      error
    } =
      await supabaseClient
        .from("cccd_data")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      console.error(error);

      alert(
        "Không thể xóa: " +
        error.message
      );

      return;

    }


    await loadData();

  };


/* =========================================================
   EXPORT EXCEL
========================================================= */

exportBtn.addEventListener(
  "click",
  function() {

    if (
      filteredData.length === 0
    ) {

      alert(
        "Không có dữ liệu để xuất."
      );

      return;

    }


    const excelData =
      filteredData.map(
        function(item) {

          return {

            "Họ tên":
              item.ho_ten || "",

            "CCCD":
              item.cccd || "",

            "Địa chỉ":
              item.dia_chi || "",

            "Nơi cấp CCCD":
              item.noi_cap || "",

            "Ngày cấp":
              formatDate(
                item.ngay_cap
              )

          };

        }
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );


    worksheet["!cols"] = [

      {
        wch: 28
      },

      {
        wch: 18
      },

      {
        wch: 45
      },

      {
        wch: 35
      },

      {
        wch: 15
      }

    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "CCCD"
    );


    const now =
      new Date();


    const fileDate =
      now.getFullYear() +
      "-" +
      String(
        now.getMonth() + 1
      ).padStart(2, "0") +
      "-" +
      String(
        now.getDate()
      ).padStart(2, "0");


    XLSX.writeFile(
      workbook,
      `Danh_sach_CCCD_${fileDate}.xlsx`
    );

  }
);


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

  if (!dateValue) {

    return "";

  }


  const parts =
    String(dateValue)
      .split("-");


  if (
    parts.length === 3
  ) {

    return (
      parts[2] +
      "/" +
      parts[1] +
      "/" +
      parts[0]
    );

  }


  return dateValue;

}


/* =========================================================
   MESSAGE
========================================================= */

function showTableMessage(message) {

  tableMessage.innerHTML = `

    <div class="success-message">

      ${escapeHtml(message)}

    </div>

  `;

}


function showTableError(message) {

  tableMessage.innerHTML = `

    <div class="error-box">

      ${escapeHtml(message)}

    </div>

  `;

}


function showEditError(message) {

  editMessage.innerHTML = `

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
