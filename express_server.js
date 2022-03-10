const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs')
const app = express();
const PORT = 8080;
const { getUserByEmail, generateRandomString } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession ({
  name: 'session',
  keys: ['key1', 'key2'],
})
);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Global object users - to store and access users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("password", 10)
  }
};
app.get("/", (req, res) => {
  res.redirect(`/urls`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// adding GET route for /urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

// adding GET route for /urls/new
app.get("/urls/new", (req, res) => {
    const templateVars = { 
      urls: urlDatabase,
      user: users[req.session.user_id]}
      if (templateVars.user) {
        res.render("urls_new", templateVars);
      }
      res.render("urls_login", templateVars);
});

// adding GET route for /urls:shortURL -- this renders information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL],
    user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

// adding POST for /urls 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.params.shortURL
  urlDatabase[shortURL] = longURL 
  res.redirect(`/urls/${shortURL}`)
});

// adding GET route to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// adding POST route to update a URL resource 
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL 
  console.log(urlDatabase)
  res.redirect(`/urls`);
});

// adding POST route to remove URL resource, deletes only when logged in, and if not returns error message
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id ===  urlDatabase[shortURL].userID) {
  }
  delete urlDatabase[shortURL];
  res.redirect(`/urls`)
});

// adding GET route /login
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id]}
  res.render("urls_login", templateVars)
  });

// adding POST route for /LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(403).send('ERROR 403: Email address or password is incorrect, please try again');
  }
  const user = getUserByEmail(users, email);
  if (!user) {
    res.status(400).send('ERROR 400: Email address is incorrect, please try again');
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).send('ERROR 400: Password is incorrect, please try again');
  }
  req.session.user_id = user.userID;
  res.redirect(`/urls`);
});

// adding POST for Logout -- once logged out, clears session and redirects to login page
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`/login`);
});

// get for /register - display registration form 
app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id]}
  res.render("urls_register", templateVars)
  });

// post for /register endpoint with corresponding error messages, and redirections.
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);

  if (!email || !password || getUserByEmail(email, users)) {
    res.status(400).send("ERROR 400: Email address or password entered is invalid, please try again");
  } else {
    req.session.user_id = userID;
    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = { 
      userID,
      email, 
      hashPassword };
  }
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});