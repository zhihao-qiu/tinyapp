function generateRandomString(length) {
  return Math.random().toString(36).substring(2, length + 2);
}

function getUserByEmail(email, user_database) {
  let user = undefined;

  for (const index in user_database) {
    if (user_database[index].email === email) {
      user = user_database[index];
      return user;
    }
  }
  return user;
}

function getUserNameByID(user_id, user_database) {
  if (user_database[user_id].email) return user_database[user_id].email;
  return null;
}

function foundURLByID(url_id, url_database) {
  if (url_database[url_id]) return true;
  return false;
}

function urlsForUser(id, url_database, user_database) {
  let urls = {};
  if (getUserNameByID(id, user_database)) {
    for (const url in url_database) {
      if (url_database[url].userID === id) urls[url] = url_database[url].longURL;
    }
  }
  return urls;
}

function checkURLBelongsToUser(url_id, user_id, url_database) {
  return url_database[url_id].userID === user_id;
}

module.exports = {
  generateRandomString,
  getUserByEmail,
  getUserNameByID,
  foundURLByID,
  urlsForUser,
  checkURLBelongsToUser,
};