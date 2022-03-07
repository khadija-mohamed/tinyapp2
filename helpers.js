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

//get user by email stored in database
const getUserByEmail = (database, email) => {
  let user = {};

  for (let key in database) {
    if (database[key]['email'] === email) {
      user = database[key];
      return user;
    }
  }
  return null;
};

module.exports = { generateRandomString, getUserByEmail };