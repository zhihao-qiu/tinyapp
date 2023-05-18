const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlIDLength = 6;
const userIDLength = 13;
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user3RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a",
    password: "123",
  },
};

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
    return false;
  }
}

function getUserNameByID(user_id) {
  if (users[user_id].email) return users[user_id].email;
  return null;
}

function foundURLByID(url_id) {
  if (urlDatabase[url_id]) return true;
  return false;
}


function urlsForUser(id) {
  let urls = {};
  if (getUserNameByID(id)) {
    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === id) urls[url] = urlDatabase[url].longURL;
    }
  }
  return urls;
}

function checkURLBelongsToUser(url_id, user_id) {
  return urlDatabase[url_id].userID === user_id;
}

/**
 * Function of dealing with POST
 */
app.post("/urls", (req, res) => {
  /**
   * If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs. 
   * Double check that in this case the URL is not added to the database.
  */
  if (!req.cookies["user_id"]) {
    return res.status(400).send('Cannot shorten URLs because you haven\'t logged in yet.');
  }
  const newID = generateRandomString(urlIDLength);

  if (!urlDatabase[newID]) {
    urlDatabase[newID] = {};
    urlDatabase[newID].longURL = "http://" + req.body.longURL;
    urlDatabase[newID].userID = req.cookies['user_id'];
  }

  // res.send(urlDatabase); // Respond with 'Ok' (we will replace this)
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies['user_id']) return res.redirect('/login');
  if (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID !== req.cookies['user_id']) return res.status(400).send('This is not your URL');

  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});


app.post("/urls/:id/update", (req, res) => {
  if (!req.cookies['user_id']) return res.redirect('/login');
  console.log('user exist:', urlDatabase[req.params.id]);
  console.log('my url:', urlDatabase[req.params.id].userID !== req.cookies['user_id']);
  if (urlDatabase[req.params.id] && urlDatabase[req.params.id].userID !== req.cookies['user_id']) return res.status(400).send('This is not your URL');

  urlDatabase[req.params.id].longURL = req.body.longURL;
  return res.redirect('/urls');
});


app.post("/login", (req, res) => {
  // blank email or password, return 400
  if (!req.body.email.length || !req.body.password.length) {
    return res.status(400).send('Please fill up each input');
  }

  for (const user in users) {
    if (users[user].email === req.body.email) {
      if (users[user].password === req.body.password) {
        res.cookie("user_id", users[user].id);
        console.log(`Has set ${users[user].id} to the cookie user_id`);
        return res.redirect('/urls');
      } else {
        return res.status(403).send('Wrong Password');
      }
    }
  }
  return res.status(403).send('Could not find this user');

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


app.post("/register", (req, res) => {
  // blank email or password, return 400
  if (!req.body.email.length || !req.body.password.length) {
    return res.status(400).send('Please fill up each input');
  }

  // In order to avoid duplicate entry, need to check if the email address has been existed
  if (!getUserByEmail(req.body.email)) return res.status(400).send(`The Email address - ${req.body.email} is EXISTING!`);

  // Since this is a new email address, we can add it to the users
  const userID = generateRandomString(userIDLength);
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = req.body.email;
  users[userID].password = req.body.password;

  // set the user email to cookies
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

/**
 * Function of dealing with GET
 */
app.get("/", (req, res) => {
  console.log(getUserNameByID('user2RandomID'));
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!req.cookies['user_id']) return res.redirect('/login');
  const templateVars = {
    username: req.cookies["user_id"] ? getUserNameByID(req.cookies["user_id"]) : "",
    urls: urlsForUser(req.cookies["user_id"])
  };
  return res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.cookies["user_id"]) {
    return res.redirect('/login');
  }
  const templateVars = {
    username: req.cookies["user_id"] ? getUserNameByID(req.cookies["user_id"]) : "",
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  /**
   * If a user tries to access a shortened url (GET /u/:id) that does not exist (:id is not in the database), 
   * we should send them a relevant message.
   */

  if (!foundURLByID(req.params.id)) return res.status(400).send('The URL is not existed!');
  if (!checkURLBelongsToUser(req.params.id, req.cookies['user_id'])) return res.status(400).send('This is not your URL');

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: req.cookies["user_id"] ? getUserNameByID(req.cookies["user_id"]) : "",
  };
  return res.render('urls_show', templateVars);
});


app.get("/login", (req, res) => {
  // If the user is logged in, GET /login should redirect to GET /urls
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
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
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    username: 'REGISTER',
  };
  res.render("register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


