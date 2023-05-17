const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


function generateRandomString() {
  let result = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const userDatabase = [
  {
    "userName": "Jojo",
    "passWord": null
  },
  {
    "userName": "foo",
    "passWord": null
  },
  {
    "userName": "Avril",
    "passWord": null
  }
];

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  if (!urlDatabase[newID]) {
    urlDatabase[newID] = "http://" + req.body.longURL;
  }

  // res.send(urlDatabase); // Respond with 'Ok' (we will replace this)
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {

  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];

  }

  // res.send(urlDatabase); // Respond with 'Ok' (we will replace this)
  res.redirect('/urls');
});


app.post("/urls/:id/update", (req, res) => {
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id] = req.body.longURL;
  }
  console.log(urlDatabase);
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  for (const user of userDatabase) {
    if (user.userName === req.body.username) {
      res.cookie("username", req.body.username);
      console.log(`Has set ${req.body.username} to the cookie username`);
    }
  }
  // console.log(req.cookies.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});



app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


