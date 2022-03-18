const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const { generateRandomString, userIdEmail, usersUrls, userCookies } = require('./helpers');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

// empty objects to house urldatabase and users
const urlDatabase = {};
const users = {};

// GET REQUESTS

//homepage
app.get("/", (req, res) => {
  if (userCookies(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//adding GET route for /urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: usersUrls(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//adding GET route for /urls/new
app.get("/urls/new", (req, res) => {
  if (!userCookies(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

//adding GET route for /urls:shortURL -- this renders information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("ERROR 404: The short URL is nonfunctional, please try again.");
  }
});

// adding GET route to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("ERROR 404: The short URL is nonfunctional, please try again.");
  }
});

// adding GET route /login
app.get("/login", (req, res) => {
  if (userCookies(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

 // adding GET route for /register - display registration form 
app.get("/register", (req, res) => {
  if (userCookies(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_register", templateVars);
  }
});

// POST Requests
// adding POST for / urls
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("ERROR 401: Please login or register to create short URLs.");
  }
});

// adding POST route to update a URL resource
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = usersUrls(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("ERROR 401: Please login or register to edit your short URLs.");
  }
});

// adding POST route to remove URL resource, deletes only when logged in, and if not returns error message
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = usersUrls(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("ERROR 401: You are unable to delete this short URL, please login or register.");
  }
});

// adding POST route for /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!userIdEmail(email, users)) {
    res.status(403).send('ERROR 403: Email address is incorrect, please try again.');
  } else {
    const userID = userIdEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send('ERROR 403: Password is incorrect, please try again.');
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});

// // adding POST for Logout -- once logged out, clears session and redirects to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// post for /register endpoint with corresponding error messages, and redirections.
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("ERROR 400: Email address or password entered is invalid, please try again.");
  } else if (userIdEmail(email, users)) {
    res.status(400).send("ERROR 400: Email address or password entered is invalid, please try again.");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
