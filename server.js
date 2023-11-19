const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql2 = require("mysql2");
const app = express();
const fs = require("fs");
const { error } = require("console");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // Add other necessary CORS headers here
    next();
  });
  
  const PORT = 5000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });

  const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "flight",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});


app.post("/addflights", (req, res) => {
  const flightData = req.body;
  console.log(flightData)
   const query =
     "INSERT INTO addflight (`flightId`,`flightName`, `departure`, `destination`, `departureTime`,`arrivalTime`, price, seats) VALUES(?,?,?,?,?,?,?,?)";
  const values = [
    flightData.flightId,
    flightData.flightName,
    flightData.departure,
    flightData.destination,
    flightData.departureTime,
    flightData.arrivalTime,
    parseInt(flightData.price),
    parseInt(flightData.seats),
  ];

  console.log(values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error occured during inserting", err);
      res.status(500).json({ error: "Failed to insert data into database" });
    } else {
      console.log("Data inserted successfully:", result);
      // res.status(200).json({ message: "Data inserted successfully" });
      res.redirect("http://127.0.0.1:50940/admin/addflights.html");
    }
  });
});

app.get("/getflights", (req, res) => {
  const query = "Select * from addflight";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving flight data", error);
      res.status(500).json({ error: "Failed to retrieve flight data" });
    } else {
      res.json(results);
    }
  });
});

app.get("/onSearch", (req, res) => {
  const { flightName, flightDate, flightId  } = req.query;
  const query =
    "SELECT * FROM addflight WHERE `flightName` = ? AND flightId = ? AND DATE(departureTime) = ?";
  const params = [flightName, flightId, flightDate];
  console.log(params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error occured during fetching", err);
      res.status(500).json({ error: "Failed to fetch data from database" });
    } else {
      console.log("Data listed successfully", results);
    }
    console.log(results);
    res.json(results);
  });
});

//booknow

app.get("/getFlightDetails", (req, res) => {
  const id = req.query.flightId;
  console.log(id);
  const query = "Select * FROM addflight WHERE `flightId` = ?";
  const params = [id];
  console.log(params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error occured during fetching", err);
      res.status(500).json({ error: "Failed to fetch data from database" });
    } else {
      console.log("Data listed successfully", results);
    }
    res.json(results);
  });
});


app.put("/updateSeatCount/:flightId", (req, res) => {
  const flightId = req.params.flightId;
  const seatsToBook = req.body.seatsToBook;
  const updateQuery = "UPDATE addflight SET seats = seats - ? WHERE flightId = ?";
  const params = [seatsToBook, flightId];

  db.query(updateQuery, params, (error, results) => {
    if (error) {
      console.error("Error occured during updating", error);
      res.status(500).json({ error: "Failed to update data to database" });
    } else {
      // console.log("Data Updated successfully", results);
      const selectQuery = "SELECT * FROM addflight where flightId = ?";
      db.query(selectQuery, flightId, (error, results) => {
        if (error) {
          console.error("Error retrieving updated flight data", error);
          res
            .status(500)
            .json({ error: "Failed to retrieve updated flight data" });
        } else {
          res.json(results[0]);
        }
      });
    }
  });
  console.log(flightId, seatsToBook);
});


//signup

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  // Check if the username or email already exists
  const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';

  db.query(checkQuery, [username, email], (checkError, checkResults) => {
      if (checkError) {
          console.error('Error checking existing user:', checkError);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (checkResults.length > 0) {
          return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Add the new user to the MySQL database
      const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

      db.query(insertQuery, [username, email, password], (insertError, insertResults) => {
          if (insertError) {
              console.error('Error adding new user:', insertError);
              return res.status(500).json({ error: 'Internal Server Error' });
          }

          res.json({ message: 'User registered successfully' });
      });
  });
});

//login

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match a user in the MySQL database
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (error, results) => {
      if (error) {
          console.error('Error checking user credentials:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({ message: 'Login successful' });
  });
});

