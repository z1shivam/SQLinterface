const backendURL = "http://localhost:8080";

const getById = (id) => document.getElementById(id);
const getByQuery = (query) => document.querySelector(query);
const setInnerText = (id, text) => (getById(id).innerText = text);
const toggleClass = (id, add, remove) =>
  getById(id).classList.add(add) && getById(id).classList.remove(remove);

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = getById("connectToDatabase");
  const inputs = ["host", "dbport", "user", "password", "database"].map(
    (name) => getByQuery(`input[name="${name}"]`)
  );

  const connectServerBtn = getById("connectToServerBtn");
  const connectPanel = getById("connectToServerPanel");
  const closeBtn = getById("connectToServerCloseBtn");

  connectBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const connectURL = `${backendURL}/connect`;
    const connectionInfo = Object.fromEntries(
      inputs.map((input) => [input.name, input.value])
    );

    localStorage.setItem("currentUser", JSON.stringify(connectionInfo));

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
        setInnerText("user", data.user);
        setInnerText("port", data.port);
        setInnerText("database", data.database);
        setInnerText("host", data.host);
        setInnerText("connectionStatus", "CONNECTED");

        toggleClass("connectionStatus", "bg-emerald-500", "bg-red-700");
        getById("notConnectedBtns").classList.add("hidden");
        getById("connectedBtns").classList.add("flex");
        getById("connectedBtns").classList.remove("hidden");
        connectPanel.classList.remove("flex");
        connectPanel.classList.add("hidden");

        return data;
      })
      .catch((error) => {
        getById("connectionPanelError").innerText =
          "Error Connecting to database";
        throw error;
      });
  });

  connectServerBtn.addEventListener("click", () => {
    connectPanel.classList.remove("hidden");
    connectPanel.classList.add("flex");
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    connectPanel.classList.remove("flex");
    connectPanel.classList.add("hidden");
  });
});

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser) {
  setInnerText("user", currentUser.user);
  setInnerText("port", currentUser.dbport);
  setInnerText("database", currentUser.database);
  setInnerText("host", currentUser.host);
  console.log(currentUser);
  getById("userExistingBtns").classList.remove("hidden");
  getById("notConnectedBtns").classList.add("hidden");
}

getById("resetServerBtn").addEventListener("click", ()=> {
  const disconnectURL = `${backendURL}/disconnect`;
  fetch(disconnectURL)
  localStorage.removeItem("currentUser");
  setInnerText("user", "-");
  setInnerText("port", "-");
  setInnerText("database", "-");
  setInnerText("host", "-");
  getById("userExistingBtns").classList.add("hidden");
  getById("notConnectedBtns").classList.remove("hidden");
});


getById("resetServerBtn2").addEventListener("click", ()=> {
  const disconnectURL = `${backendURL}/disconnect`;
  fetch(disconnectURL)
  localStorage.removeItem("currentUser");
  setInnerText("user", "-");
  setInnerText("port", "-");
  setInnerText("database", "-");
  setInnerText("host", "-");
  getById("userExistingBtns").classList.add("hidden");
  getById("notConnectedBtns").classList.remove("hidden");
  getById("connectedBtns").classList.add("hidden")
});

getById("reconnectToServer").addEventListener("click",()=>{

})
