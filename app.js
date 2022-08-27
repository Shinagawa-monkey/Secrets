//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
const port = 3000;
const app = express();
const md5 = require('md5');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
};

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login", {
    errMsg: "",
    username: "",
    password: ""
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password)
  });
  newUser.save((err) => {
    if (!err) {
      res.render("secrets");
    } else {
      res.send(err);
    }
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne({
    email: username
  }, (err, foundUser) => {
    if (err) {
      res.send(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
          console.log("New login (" + username + ")");
        } else {
          res.render("login", {
            errMsg: "Email or password incorrect",
            username: username,
            password: password
          });
        }
      } else {
        res.render("login", {
          errMsg: "Email or password incorrect",
          username: username,
          password: password
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server has started successfully on port ${port}`);
});
