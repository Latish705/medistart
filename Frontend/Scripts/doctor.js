import baseURL from "./baseURL.js";

let docsCont = document.getElementById("doctors-cont");
let depObj = {
  1: "Neurology",
  2: "Dermatology",
  3: "Dental",
  4: "Ayurveda",
  5: "Gastroenterology",
  6: "Gynaecology",
  7: "ENT",
  8: "General Physician",
  9: "Orthopedic",
  10: "Cardiology",
};
window.addEventListener("load", async (e) => {
  let deptID = localStorage.getItem("deptID");
  if (deptID) {
    try {
      let res = await fetch(baseURL + `doctor/allDoctor/${deptID}`);
      if (res.ok) {
        let data = await res.json();
        if (data.msg) {
          swal("", `${data.msg}`, "info").then(function () {
            getdata();
          });
        } else {
          renderdata(data.doctor);
        }
      }
      localStorage.removeItem("deptID");
    } catch (err) {
      console.log(err);
    }
  } else {
    getdata();
  }

  populateDateOptions(); // Call this to populate dates dynamically
});

// Function to dynamically create date options starting from today
function populateDateOptions() {
  const dateSelectElements = document.querySelectorAll("select[name='date']");

  const today = new Date();
  const options = [];
  for (let i = 0; i < 7; i++) {
    // Generate the next 7 days
    const date = new Date();
    date.setDate(today.getDate() + i);

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const value = date.toISOString().split("T")[0]; // Use ISO format for value

    options.push(`<option value="${value}">${formattedDate}</option>`);
  }

  // Populate the date options dynamically
  dateSelectElements.forEach((select) => {
    select.innerHTML = options.join("");
  });
}

async function getdata() {
  try {
    const res = await fetch(baseURL + `doctor/alldoctor`);
    let data = await res.json();
    data = data.doctor;
    renderdata(data);
  } catch (error) {
    console.log(error.message);
  }
}

function renderdata(arr) {
  docsCont.innerHTML = "";
  docsCont.innerHTML = arr
    .map((elem) => {
      return `
            <div class=doc-card>
                <div class="top-cont">
                    <div class="doc-profile">
                        <div class="doc-img">
                            <img alt="doc-pfp" src=${elem.image} />
                        </div>
                        <div class="doc-desc">
                            <h2>${elem.doctorName}</h2>
                            <h4>Department: ${depObj[elem.departmentId]}</h4>
                            <p>Experience: ${elem.experience}</p>
                            <h4>Qualification: ${elem.qualifications}</h4>
                            <p style="color:white">${elem._id}<p>
                            <p>Rs.1,000 Consultation Fee</p>
                            <p style=${
                              elem.status ? "color:green" : "color:red"
                            }>${
        elem.status ? "Available" : "Currently Unavailable"
      }</p>
                        </div>
                    </div>
                    <div class="doc-book">
                        <div class="select-app">
                            <form>
                                <div>
                                    <label>Select Date:</label>
                                    <select required="true" name="date">
                                    </select>
                                </div>
                                <div>
                                    <label>Select Slot:</label>
                                    <select required="true" name="slot">
                                        <option value="2-3">2PM to 3PM</option>
                                        <option value="4-5">4PM to 5PM</option>
                                        <option value="7-8">6PM to 7PM</option>
                                    </select>
                                </div>
                                <input type="submit" value="Book Appointment Now"/>
                                <p style="color:green; margin-top:0.3rem; text-align:center">No Booking Fee<p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  // Re-populate the date options after the render
  populateDateOptions();

  let forms = document.querySelectorAll(".select-app>form");
  for (let form of forms) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log(e.composedPath());

      if (!localStorage.getItem("token")) {
        swal("", "Please Login!", "warning").then(function () {
          window.location.href = "./login.html";
          return;
        });
      } else {
        let img =
          e.composedPath()[3].children[0].children[0].children[0].currentSrc;
        let name =
          e.composedPath()[3].children[0].children[1].children[0].innerText;
        let dept =
          e.composedPath()[3].children[0].children[1].children[1].innerText;
        let exp =
          e.composedPath()[3].children[0].children[1].children[2].innerText;
        let qual =
          e.composedPath()[3].children[0].children[1].children[3].innerText;
        let docID =
          e.composedPath()[3].children[0].children[1].children[4].innerText;

        let formObj = {
          date: form.date.value,
          slot: form.slot.value,
        };
        let docObj = {
          img,
          name,
          dept,
          exp,
          qual,
          docID,
        };
        console.log(docObj);
        swal("", `Confirm Booking?`, "info").then(function () {
          localStorage.setItem("formObj", JSON.stringify(formObj));
          localStorage.setItem("docObj", JSON.stringify(docObj));
          window.location.href = "./patient_details.html";
        });
      }
    });
  }
}
