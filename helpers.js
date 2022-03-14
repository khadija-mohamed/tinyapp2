// generating a six-character alphanumeric code
const generateRandomString = function() {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ""
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result
}
console.log(generateRandomString(6));

//get user by email stored in database and return if true or false
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
};

// get userid for email and return id
const userIdEmail = function(email, database) {
  for (const key in database) {
    if (database[key]['email'] === email) {
      return database[key].id;
    }
  }
};

// get specific user url and return
const usersUrls = (id, database) => {
  const userUrls = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
};

// get cookies for respective user and return true
const userCookies = (cookie, database) => {
  for (const user in database) {
    if (cookie === user) {
      return true;
    }
  }
};

module.exports = { generateRandomString, getUserByEmail, userIdEmail, usersUrls, userCookies };