const bcrypt = require("bcrypt");

const hash = "$2b$12$Ca1CmIhtAEZ/h5kA02.cAexcdkcAfQ2Bjf5R9jAguaKikRyeFSqqG";
bcrypt.compare("demo@123", hash).then(result => {
  console.log("Does 'password' match hash?", result);
});