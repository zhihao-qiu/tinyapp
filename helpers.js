
/**
 * The function generates a random string of a specified length using alphanumeric characters.
 * @param length - The length parameter is the desired length of the random string that will be
 * generated.
 * @returns A random string of characters with the specified length. The string consists of
 * alphanumeric characters (a-z, A-Z, 0-9).
 */
function generateRandomString(length) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * The function searches for a user in a database by their email address.
 * @param email - The email address of the user you are trying to find in the `user_database`.
 * @param user_database - The `user_database` parameter is an object that contains information about
 * multiple users. Each user is represented as a property of the object, with the property name being a
 * unique identifier for the user and the property value being an object that contains various
 * properties such as `email`, `password`, `name`,
 * @returns the user object that matches the email parameter passed to the function, or undefined if no
 * user with that email is found in the user_database.
 */
function getUserByEmail(email, user_database) {
  let user = undefined;

  /* The `for...in` loop is iterating over the properties of the `user_database` object and assigning
  each property name to the `index` variable. This allows the function to check if any of the users
  in the database have an email that matches the `email` parameter passed to the function. */
  for (const index in user_database) {
    if (user_database[index].email === email) {
      user = user_database[index];
      return user;
    }
  }
  return user;
}

/**
 * The function retrieves a user's email address from a user database based on their user ID.
 * @param user_id - The ID of the user whose name is being retrieved from the user_database.
 * @param user_database - The user_database parameter is likely an object or array that contains
 * information about users, such as their email addresses, names, and other details. The function is
 * designed to take a user ID as input and return the corresponding email address from the
 * user_database object.
 * @returns the email associated with the user ID in the user database, or null if there is no email
 * associated with that user ID.
 */
function getUserNameByID(user_id, user_database) {
  if (user_database[user_id].email) return user_database[user_id].email;
  return null;
}

/**
 * The function checks if a URL exists in a database based on its ID.
 * @param url_id - The ID of the URL that we want to check if it exists in the URL database.
 * @param url_database - The `url_database` parameter is likely an object or a dictionary that stores
 * URLs with their corresponding IDs as keys. The function `foundURLByID` takes in an `url_id`
 * parameter and checks if it exists as a key in the `url_database` object. If it does, the function
 * @returns a boolean value (true or false) depending on whether the given `url_id` exists in the
 * `url_database` object. If the `url_id` exists in the `url_database`, the function returns `true`,
 * otherwise it returns `false`.
 */
function foundURLByID(url_id, url_database) {
  if (url_database[url_id]) return true;
  return false;
}

/**
 * This function returns a list of URLs associated with a given user ID from a URL database and user
 * database.
 * @param id - The user ID for which we want to retrieve URLs.
 * @param url_database - A database containing information about URLs, including their long and short
 * versions, as well as the user ID of the user who created them.
 * @param user_database - It is a database or object that contains information about users, such as
 * their IDs, email addresses, and passwords.
 * @returns The function `urlsForUser` returns an object containing URLs and their corresponding
 * longURLs that belong to the user with the given `id`. If the user does not exist in the
 * `user_database`, an empty object is returned.
 */
function urlsForUser(id, url_database, user_database) {
  let urls = {};
  if (getUserNameByID(id, user_database)) {
    for (const url in url_database) {
      if (url_database[url].userID === id) urls[url] = url_database[url].longURL;
    }
  }
  return urls;
}

/**
 * The function checks if a given URL belongs to a specific user in a URL database.
 * @param url_id - The ID of the URL that needs to be checked.
 * @param user_id - The user ID is a unique identifier for a user in the system. It is used to
 * associate URLs with specific users and to ensure that users can only access and modify their own
 * URLs.
 * @param url_database - The `url_database` parameter is likely an object or an array that contains
 * information about URLs, such as their IDs, the user who created them, and other relevant data. The
 * function `checkURLBelongsToUser` takes in this database as a parameter, along with a `url_id` and
 * @returns a boolean value indicating whether the URL with the given `url_id` belongs to the user with
 * the given `user_id` in the `url_database`.
 */
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