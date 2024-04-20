const { Client } = require("pg");
const express = require("express");
const cors = require("cors");
const PORT = 8080;
const app = express();

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

// Default route
app.get("/", (req, res) => {
  console.log(`Request received from ${req.ip}`);
  res.json({ message: "Hello from server!" });
});

// Route to connect to the database
app.get("/connect", async (req, res) => {
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

    res.json({ message: "Database connected successfully!" });
  } catch (error) {
    console.error("Error connecting to database");
    res.status(500).json({ error: "Failed to connect to database" });
  }
});

// Route to handle database disconnection
app.get("/disconnect", (req, res) => {
  console.log("Database disconnection request received!");

  if (!isConnected) {
    res.json({ message: "Database is not connected" });
    return;
  }

  disconnectDb();
  res.json({ message: "Database disconnected successfully!" });
});

// Route to execute a database query
app.get("/query", async (req, res) => {
  if (!isConnected) {
    res.json({ message: "Database is not connected" });
    return;
  }

  const { query } = req.body;

  if (!query) {
    res.json({ message: "Query is not available!" });
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
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Failed to execute query" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is up and running on PORT: ${PORT}`);
});
