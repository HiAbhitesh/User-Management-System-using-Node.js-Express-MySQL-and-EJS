const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const MethodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(MethodOverride("_method"));
app.use(express.urlencoded({extended : true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Abhitesh@18',
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Home Route
app.get("/", (req, res) =>{
  let q = "SELECT count(*) FROM user";
  try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let count = result[0]["count(*)"];
        console.log(count);
        res.render("home.ejs", {count});
      });
    } catch (err) {
      console.log(err);
      res.send("SOme error in DB");
    }
});

// Show Routes
app.get("/user", (req, res) =>{
    let q = "SELECT * FROM user";
    try {
        connection.query(q, (err, users) => {
          if (err) throw err;
          res.render("showusers.ejs",{users})
        });
      } catch (err) {
        console.log(err);
        res.send("SOme error in DB");
      }
});

// Edit Route
app.get("/user/:id/edit", (req, res) =>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", {user});
    });
  } catch (err) {
    console.log(err);
    res.send("SOme error in DB");
  }
});

// Update (DB) Route
app.patch("/user/:id", (req, res) =>{
  let {id} = req.params;
  let {password : formPassword, username : newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if(formPassword != user.password){
        res.send("WRONG PASSWORD");
      } else {
        let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result) =>{
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("SOme error in DB");
  }
});
 
// Add User
app.get("/user/new", (req, res) =>{
  res.render("new.ejs");
});

app.post("/user/new", (req, res) =>{
  let {username, email, password} = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("add new user");
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send("SOme error in DB");
  }
});

// Delete User
app.get("/user/:id/delete", (req, res) =>{
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err, result) =>{
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", {user});
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.delete("/user/:id", (req, res) =>{
  let {id} = req.params;
  let {password} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) =>{
      if(err) throw err;
      let user = result[0];
      if (!user) {
        return res.send("User not found.");
      }
      if (password !== user.password){
        res.send("WRONG Password Entered");
      } else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        connection.query(q2, (err, result) =>{
          if(err) throw err;
          else {
            console.log(result);
            console.log("delete !");
            res.redirect("/user");
          }
        });
      }
    });
  } catch(err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.listen("8080",() =>{
  console.log("server is listing to the port 8080");
});