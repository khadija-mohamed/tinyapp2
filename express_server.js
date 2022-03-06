const express = require("express");
const app = express();
const PORT = 8080;

//body parser library, converts request body from buffer into readble string. 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// adding route for /urls
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// adding route for /urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//adding route for /urls:shortURL -- this renders information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

//post for /urls 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.params.shortURL
  urlDatabase[shortURL] = longURL 
  res.redirect(`/urls/${shortURL}`)
});

// get to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//post route to remove URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
});

// post route to update a URL resource 
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL 
  console.log(urlDatabase)
  res.redirect(`/urls`);
});

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