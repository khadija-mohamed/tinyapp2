const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// generate a randomized alphanumeric character for the unique shortURL.
const generateRandomString = function() {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ""
  let charactersLength = characters.length;
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result
}
console.log(generateRandomString(5));

//Register helper function helper function for register route
const existingUser = function(userDatabase, email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true
      return users[user].id
    }
  } return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Global object users - to store and access users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// GET for /urls
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

// GET for /urls/new
app.get("/urls/new", (req, res) => {
    let templateVars = { 
      urls: urlDatabase,
      user: users[req.cookies["user_id"]]}
  res.render("urls_new", templateVars);
});

//GET for /urls:shortURL -- this renders information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL],
    user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});

//POST for /urls 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.params.shortURL
  urlDatabase[shortURL] = longURL 
  res.redirect(`/urls/${shortURL}`)
});

// GET to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// post route to update a URL resource 
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL 
  console.log(urlDatabase)
  res.redirect(`/urls`);
});

//post route to remove URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
});

//get /login
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]}
  res.render("urls_login", templateVars)
  });

// adding endpoint to handle post for LOGIN
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect(`/urls`);
});

//adding /logout endpoint that clears username cookie and redirects
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', users[req.cookies["user_id"]])
  res.redirect(`/urls`)
})

// get for /register - display registration form 
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]}
  res.render("urls_register", templateVars)
  });

// post for /register endpoint
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400).send('ERROR 400: Please enter valid email/password')
  } else if (existingUser(users, req.body.email)) {
    res.status(400).send('Error 400')
  } else {
  users[userID] = { 
    email: req.body.email, 
    password: req.body.password, 
    id: userID};
  }
  res.cookie('user_id', userID)
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});