const morgan = require('morgan');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


app.use(morgan('dev'));
app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
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
    password: "$2a$10$0TpJRWm/RtfOBuKGH25c/OxPllh5jXn/HGPNTUklZ4t99EsICk5tS",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$gqOlkhztQ.b30a6mwmWH3.y0MFbOng0dPmgW.B6.ISfvsYtro2a2W",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a",
    password: "$2a$10$EWCJ3UbIzNtcatdLA9IhF.URVwyzYoP269im9nk8Gc9pOk6ASn0L6",
  },
};

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, length + 2);
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
  const email = req.body.email;
  const password = req.body.password;

  // blank email or password, return 400
  if (!email.length || !password.length) {
    return res.status(400).send('Please enter your email / password');
  }

  for (const user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        res.cookie("user_id", users[user].id);
        console.log(`Has set ${users[user].id} to the cookie user_id`);
        return res.redirect('/urls');
      } else {
        return res.status(403).send('The password is not correct');
      }
    }
  }
  return res.status(403).send('We cannot find an account with that email address');

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
  if (!getUserByEmail(email)) return res.status(400).send(`The Email address - ${email} EXISTS!`);

  // Since this is a new email address, we can add it to the users
  const userID = generateRandomString(userIDLength);
  let newuser = {};
  newuser.id = userID;
  newuser.email = email;
  newuser.password = bcrypt.hashSync(password, 10);
  users[userID] = newuser;

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
  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.cookies['user_id']) return res.redirect('/login');
  const templateVars = {
    username: req.cookies["user_id"] ? getUserNameByID(req.cookies["user_id"]) : "",
    urls: urlsForUser(req.cookies["user_id"])
  };
  return res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.cookies["user_id"]) return res.redirect('/login');

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
  if (req.cookies['user_id']) return res.redirect('/urls');

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
  if (req.cookies['user_id']) return res.redirect('/urls');

  const templateVars = {
    username: 'REGISTER',
  };
  res.render("register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


