const { Client } = require("pg");
const express = require("express");
const cors = require("cors");
const PORT = 9032;
const app = express();
const path = require("path");

// Database configuration
let dbConf = {
  host: "",
  dbport: "",
  database: "",
  user: "",
  password: "",
};

// Initialize client and connection status
let client = new Client(dbConf);
let isConnected = false;

// Function to connect to the database
async function connectDb() {
  try {
    client = new Client(dbConf);
    await client.connect();
    isConnected = true;
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Error connecting to database:", error);
    isConnected = false;
  }
}

// Function to disconnect from the database
async function disconnectDb() {
  try {
    await client.end();
    isConnected = false;
    console.log("Database disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));

// Default route
app.get("/", (req, res) => {
  console.log(`Request received from ${req.ip}`);
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Route to connect to the database
app.post("/connect", async (req, res) => {
  console.log("Database connection request received!");
  const { user, host, database, dbport, password } = req.body;

  try {
    if (!user || !host || !database || !dbport || !password) {
      throw new Error(
        "Please provide all required parameters: user, host, database, dbport, password"
      );
    }

    dbConf = {
      host: String(host),
      user: String(user),
      database: String(database),
      password: String(password),
      dbport: Number(dbport),
    };

    await connectDb();

    res.json({
      message: "Database connected successfully",
      user: dbConf.user,
      host: dbConf.host,
      dbport: dbConf.dbport,
      database: dbConf.database,
    });
  } catch (error) {
    console.error(`Error connecting to database:${error}`);
    res
      .status(200)
      .json([{ command: "error", message: "Failed to connect to database" }]);
  }
});

// Route to handle database disconnection
app.get("/disconnect", (req, res) => {
  console.log("Database disconnection request received!");

  if (!isConnected) {
    res
      .status(200)
      .json([{ command: "error", message: "Database is not connected" }]);
    return;
  }

  disconnectDb();
  res.json({ message: "Database disconnected successfully!" });
});

// Route to execute a database query
app.post("/query", async (req, res) => {
  if (!isConnected) {
    res
      .status(200)
      .json([
        {
          command: "error",
          message: "Database is not connected. Please reconnect",
        },
      ]);
    return;
  }

  const { query } = req.body;

  if (!query) {
    res
      .status(200)
      .json([{ command: "error", message: "Query is not available." }]);
    return;
  }

  console.log(`Query received: ${query}`);

  try {
    let result = await client.query(query);
    if (!Array.isArray(result)) {
      result = [result];
    }
    res.json(result);
  } catch (error) {
    res.status(200).json([{ command: "error", message: String(error) }]);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`CTRL + CLICK on this link to open in browser.`);
  console.log(`http://localhost:${PORT}`);
});
