const morgan = require('morgan');
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { urlDatabase, users } = require("./database");
const app = express();
const PORT = 8080;

const { generateRandomString,
  getUserByEmail,
  getUserNameByID,
  foundURLByID,
  urlsForUser,
  checkURLBelongsToUser } = require("./helpers");

app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'TinyApp sessions',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlIDLength = 6;
const userIDLength = 13;

/**
 * Function of dealing with POST
 */
app.post("/urls", (req, res) => {
  /**
   * If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs. 
   * Double check that in this case the URL is not added to the database.
  */
  if (!req.session.user_id) {
    return res.status(400).send('Cannot shorten URLs because you haven\'t logged in yet.');
  }
  const newID = generateRandomString(urlIDLength);

  if (!urlDatabase[newID]) {
    urlDatabase[newID] = {};
    urlDatabase[newID].longURL = req.body.longURL.startsWith("http://") ? req.body.longURL : ("http://") + req.body.longURL;
    urlDatabase[newID].userID = req.session.user_id;
  }

  res.redirect(`/urls/${newID}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const url_id = req.params.id;
  if (!req.session.user_id) return res.status(401).send("Please click here to <a href='/login'>login</a>!");
  if (urlDatabase[url_id] && urlDatabase[url_id].userID !== req.session.user_id) return res.status(400).send('This is not your URL');

  delete urlDatabase[url_id];
  return res.redirect('/urls');
});

app.post("/urls/:id/", (req, res) => {
  if (!req.session.user_id) res.status(401).send("Please click here to <a href='/login'>login</a>!");
  if (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID !== req.session.user_id) return res.status(400).send('This is not your URL');

  urlDatabase[req.params.id].longURL = req.body.longURL;
  return res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // blank email or password, return 400
  if (!email.length || !password.length) {
    return res.status(400).send('Please enter your email / password');
  }

  for (const user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        req.session.user_id = users[user].id;
        return res.redirect('/urls');
      } else {
        return res.status(403).send('The password is not correct');
      }
    }
  }
  return res.status(403).send('We cannot find an account with that email address');

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // blank email or password, return 400
  if (!email.length || !password.length) {
    return res.status(400).send('Please enter your email / password');
  }

  // In order to avoid duplicate entry, need to check if the email address has been existed
  const newuser = getUserByEmail(email, users) ? getUserByEmail(email, users) : {};

  if (newuser.email) return res.status(400).send(`The Email address - ${email} EXISTS!`);

  // Since this is a new email address, we can add it to the users
  const userID = generateRandomString(userIDLength);
  newuser.id = userID;
  newuser.email = email;
  newuser.password = bcrypt.hashSync(password, 10);
  users[userID] = newuser;

  // set the user email to cookies
  req.session.user_id = userID;
  res.redirect('/urls');
});



/**
 * Function of dealing with GET
 */
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) return res.status(401).send("Please click here to <a href='/login'>login</a>!");
  const templateVars = {
    username: req.session.user_id ? getUserNameByID(req.session.user_id, users) : "",
    urls: urlsForUser(req.session.user_id, urlDatabase, users)
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.session.user_id) return res.redirect('/login');

  const templateVars = {
    username: req.session.user_id ? getUserNameByID(req.session.user_id, users) : "",
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  /**
   * If a user tries to access a shortened url (GET /u/:id) that does not exist (:id is not in the database), 
   * we should send them a relevant message.
   */

  if (!foundURLByID(req.params.id, urlDatabase)) return res.status(400).send('The URL is not existed!');
  if (!checkURLBelongsToUser(req.params.id, req.session.user_id, urlDatabase)) return res.status(400).send('This is not your URL');

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: req.session.user_id ? getUserNameByID(req.session.user_id, users) : "",
  };
  return res.render('urls_show', templateVars);
});

app.get("/login", (req, res) => {
  // If the user is logged in, GET /login should redirect to GET /urls
  if (req.session.user_id) return res.redirect('/urls');

  const templateVars = {
    username: 'LOGIN'
  };
  return res.render('login', templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  // If the user is logged in, GET /register should redirect to GET /urls
  if (req.session.user_id) return res.redirect('/urls');

  const templateVars = {
    username: 'REGISTER',
  };
  res.render("register", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


