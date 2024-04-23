const backendURL = "http://localhost:8080";
const connectURL = `${backendURL}/connect`;
const queryURL = `${backendURL}/query`;
const disconnectURL = `${backendURL}/disconnect`;

const getById = (id) => document.getElementById(id);
const getByQuery = (query) => document.querySelector(query);
const setInnerText = (id, text) => (getById(id).innerText = text);
const toggleClass = (id, add, remove) => {
  getById(id).classList.add(add);
  getById(id).classList.remove(remove);
};

let connectionInfo = {};
let connctionStatus = false;
let commandHistory = [];

function addRefreshRecents() {
  let commandHistory = JSON.parse(localStorage.getItem("commandhistory")) || [];
  const queryValue = getById("mainQuery").value;
  commandHistory.unshift(String(queryValue));
  localStorage.setItem("commandhistory", JSON.stringify(commandHistory));
  renderCommandHistory();
}
function setConnectedStatus(status = false) {
  if (status) {
    connctionStatus = true;
    toggleClass("connectionStatus", "bg-green-600", "bg-red-600");
    setInnerText("connectionStatus", "CONNECTED");
  } else if (!status) {
    toggleClass("connectionStatus", "bg-red-600", "bg-green-600");
    setInnerText("connectionStatus", "DISCONNECTED");
  }
}

function setDatabaseDetails(configObject) {
  setInnerText("host", `${configObject.host || "Unavailable"}`);
  setInnerText("dbport", `${configObject.dbport || "Unavailable"}`);
  setInnerText("database", `${configObject.database || "Unavailable"}`);
  setInnerText("user", `${configObject.user || "Unavailable"}`);
}

function setButtonPanel(status = 0) {
  // status 0 : No user is available
  // status 1 : user is available but disconnnected
  // status 2: user is available and connected
  if (status === 0) {
    getById("status0").classList.remove("hidden");
    getById("status1").classList.add("hidden");
    getById("status2").classList.add("hidden");
  } else if (status === 1) {
    getById("status0").classList.add("hidden");
    getById("status1").classList.remove("hidden");
    getById("status2").classList.add("hidden");
  } else if (status === 2) {
    getById("status0").classList.add("hidden");
    getById("status1").classList.add("hidden");
    getById("status2").classList.remove("hidden");
  }
}

function checkAllFieldsPresent(inputs) {
  return inputs.every((input) => input.value.trim() !== "");
}

getById("runQueryBtn").addEventListener("click", () => {
  if (!connctionStatus) {
    getById("queryRunError").innerText = "Database Connection Error";
    return;
  }
  getById("queryRunError").innerText = "";
  const queryValue = getById("mainQuery").value;

  if (queryValue === "") {
    getById("queryRunError").innerText = "Query cannot be empty";
    getById("resultTable").innerText = "";
    getById("resultTable").classList.add("hidden");
    return;
  }

  const queryToSend = { query: queryValue };
  fetch(queryURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queryToSend),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      if (data[0].command != "error") addRefreshRecents();
      fillResultTable(data);
    });
});

getById("connectPanelBtn").addEventListener("click", () => {
  getById("connectPanel").classList.remove("hidden");
  getById("connectPanel").classList.add("flex");
  getById("connectFocus").focus();
});

getById("connectPanelClose").addEventListener("click", (e) => {
  e.preventDefault();
  getById("connectPanel").classList.add("hidden");
  getById("connectPanel").classList.remove("flex");
});

getById("connectToDatabase").addEventListener("click", (e) => {
  e.preventDefault();

  const inputs = ["host", "dbport", "user", "password", "database"].map(
    (name) => getByQuery(`input[name="${name}"]`)
  );

  if (checkAllFieldsPresent(inputs)) {
    connectionInfo = Object.fromEntries(
      inputs.map((input) => [input.name, input.value])
    );
  } else {
    getById("connectionPanelError").innerText = "Every field is required";
    return;
  }

  fetch(connectURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connectionInfo),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const configObject = {
        host: data.host,
        dbport: data.dbport,
        database: data.database,
        user: data.user,
      };

      localStorage.setItem("currentUser", JSON.stringify(configObject));
      setDatabaseDetails(configObject);
      setConnectedStatus(true);
      setButtonPanel(2);
      getById("connectPanel").classList.add("hidden");
      getById("connectPanel").classList.remove("flex");
    });
});

getById("resetServer1").addEventListener("click", (e) => {
  localStorage.removeItem("currentUser");
  fetch(disconnectURL);
  setButtonPanel(0);
  setConnectedStatus(false);
  setDatabaseDetails({});
});

getById("resetServer2").addEventListener("click", (e) => {
  localStorage.removeItem("currentUser");
  fetch(disconnectURL);
  setButtonPanel(0);
  setConnectedStatus(false);
  setDatabaseDetails({});
});

getById("reconnectServerPanel").addEventListener("click", () => {
  getById("reconnectPanel").classList.remove("hidden");
  getById("reconnectPanel").classList.add("flex");
  getById("reconnectFocus").focus();
});

getById("reconnectPanelClose").addEventListener("click", (e) => {
  e.preventDefault();
  getById("reconnectPanel").classList.add("hidden");
  getById("reconnectPanel").classList.remove("flex");
});

getById("reconnectToServer").addEventListener("click", (e) => {
  e.preventDefault();
  const passwordForReconnect = getByQuery(
    `input[name="reconnectPassword"]`
  ).value;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const connectionInfo = { ...currentUser, password: passwordForReconnect };
  fetch(connectURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connectionInfo),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const configObject = {
        host: data.host,
        dbport: data.dbport,
        database: data.database,
        user: data.user,
      };

      localStorage.setItem("currentUser", JSON.stringify(configObject));
      setDatabaseDetails(configObject);
      setConnectedStatus(true);
      setButtonPanel(2);
      getById("reconnectPanel").classList.add("hidden");
      getById("reconnectPanel").classList.remove("flex");
    });
});

getById("disconnectServerBtn").addEventListener("click", () => {
  fetch(disconnectURL);
  setButtonPanel(1);
  setConnectedStatus(false);
});

getById("changeDatabaseBtn").addEventListener("click", () => {
  getById("changeDbPanel").classList.remove("hidden");
  getById("changeDbPanel").classList.add("flex");
  getById("databaseFocus").focus();
});

getById("changeDbPanleClose").addEventListener("click", (e) => {
  e.preventDefault();
  getById("changeDbPanel").classList.add("hidden");
  getById("changeDbPanel").classList.remove("flex");
});

getById("changeDbBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const dbName = getByQuery(`input[name="dbName"]`).value;
  const dbPassword = getByQuery(`input[name="changeDbPassword"]`).value;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const connectionInfo = { ...currentUser, password: dbPassword };
  connectionInfo.database = dbName;

  fetch(connectURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(connectionInfo),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const configObject = {
        host: data.host,
        dbport: data.dbport,
        database: data.database,
        user: data.user,
      };
      localStorage.setItem("currentUser", JSON.stringify(configObject));
      setDatabaseDetails(configObject);
      setConnectedStatus(true);
      setButtonPanel(2);
      getById("changeDbPanel").classList.add("hidden");
      getById("changeDbPanel").classList.remove("flex");
    });
});

function showCopyNotification() {
  getById("copyNotif").classList.remove("hidden");
  setTimeout(() => {
    copyNotif.classList.add("hidden");
  }, 2000);
}
// Function to render command history
function renderCommandHistory() {
  const commandHistory = JSON.parse(localStorage.getItem("commandhistory")) || [];
  const commandList = document.querySelector(".command-list");
  commandList.innerHTML = "";
  
  commandHistory.forEach((command, index) => {
    const listItem = createCommandListItem(command, index);
    commandList.appendChild(listItem);
  });
}

// Function to create a list item for a command
function createCommandListItem(command, index) {
  const listItem = document.createElement("li");
  listItem.classList.add(
    "bg-blue-100",
    "py-1",
    "px-3",
    "border-2",
    "border-blue-200",
    "rounded-md",
    "relative",
    "pr-12"
  );
  listItem.innerHTML = `
    ${command}
    <button data-index="${index}" class="copy-btn absolute right-0 flex justify-center items-center h-full top-0 p-3 bg-blue-200 rounded-r-sm">
      <img data-index="${index}" src="copy-regular.svg" height="15" width="15" alt="Copy" class="copy-btn" />
    </button>
  `;
  return listItem;
}

// Event delegation for copy button click
document.addEventListener("click", function(event) {
  if (event.target.classList.contains("copy-btn")) {
    const index = event.target.dataset.index;
    const commandHistory = JSON.parse(localStorage.getItem("commandhistory")) || [];
    const commandToCopy = commandHistory[index];
    copyCommandToClipboard(commandToCopy);
  }
});

// Function to copy command to clipboard
function copyCommandToClipboard(command) {
  navigator.clipboard.writeText(command)
    .then(() => {
      showCopyNotification();
    })
    .catch((err) => {
      console.error("Unable to copy command: ", err);
    });
}

getById("clearCopyHistory").addEventListener("click", () => {
  localStorage.removeItem("commandhistory");
  renderCommandHistory();
});


function fillResultTable(data) {
  const resultTable = document.getElementById("resultTable");
  resultTable.classList.remove("hidden");
  resultTable.innerHTML = "";

  data.forEach((obj) => {
    const div = document.createElement("div");
    div.classList.add(
      "rounded-md",
      "overflow-x-scroll",
      "no-scrollbar",
      "my-4",
      "p-3",
      "border-2",
      "border-gray-300"
    );

    if (obj.rows && obj.rows.length > 0) {
      const table = document.createElement("table");
      table.classList.add(
        "w-full",
        "table-auto",
        "border-collapse",
        "border",
        "border-gray-900"
      );

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      obj.fields.forEach((field) => {
        const th = document.createElement("th");
        th.textContent = field.name;
        th.classList.add(
          "px-4",
          "py-2",
          "text-left",
          "text-xs",
          "font-semibold",
          "text-gray-800",
          "uppercase",
          "border",
          "border-gray-300"
        );
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      obj.rows.forEach((rowData) => {
        const row = document.createElement("tr");
        row.classList.add("even:bg-gray-50", "odd:bg-white");
        obj.fields.forEach((field) => {
          const td = document.createElement("td");
          td.textContent = rowData[field.name];
          td.classList.add(
            "px-4",
            "py-2",
            "text-sm",
            "text-gray-800",
            "border",
            "border-gray-200"
          );
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      div.appendChild(table);
    } else {
      let message = "";
      switch (obj.command) {
        case "SELECT":
          message = "No results found.";
          break;
        case "INSERT":
          message = `Data inserted successfully. ${obj.rowCount} rows affected`;
          break;
        case "DELETE":
          message = `Data deleted successfully. ${obj.rowCount} rows affected`;
          break;
        case "error":
          message = obj.message;
          break;
        case "CREATE TABLE":
          message = "Table created successfully.";
          break;
        default:
          message = "Unknown command.";
      }

      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      paragraph.classList.add("text-gray-600");

      div.appendChild(paragraph);
    }

    resultTable.appendChild(div);
  });
}

(function initialUI() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    setButtonPanel(1);
    setConnectedStatus(false);
    setDatabaseDetails(currentUser);
    renderCommandHistory();
  } else {
    renderCommandHistory();
    setButtonPanel(0);
  }
})();
