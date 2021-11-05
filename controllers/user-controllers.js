const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




const getUsers =async(req, res, next) => {
  let users;
  try{
     users = await User.find({},'-password');
  }
  catch(err){
    // console.log(err)
    const error = new HttpError("Error fetching user info", 500)
    return next(error);
  }
  res.json({users:users.map(users=>users.toObject({getters:true}))})
};



const signup =async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid input",422);
    return next(error);  }
  const { name, email, password } = req.body;
  let existingUser;
 try{
   existingUser = await User.findOne({email:email})
 } catch(err){
   const error = new HttpError("signing up failed, please try again later",500);
   return next(error);
 }
 if(existingUser){
  const error = new HttpError("User already exists, please login",422);
  return next(error);
 }

 let hashedPassword;
 try{
  hashedPassword = await bcrypt.hash(password,12)
 }catch(err){
  const error = new HttpError("Internal Server error.",500);
  return next(error);
 }
 
  const createUser = new User({
    name,
    email,
    password:hashedPassword,
    image:req.file.path,
    places:[]
  });
try{
  await createUser.save()
} catch(err){
  // console.log(err)
  const error = new HttpError("signing up failed, please try again later",500);
  return next(error);
};

let token;
try{
  token = await jwt.sign({userId:createUser.id, email:createUser.email},process.env.JWT_KEY,{expiresIn:'1h'})
}
catch(err){
  const error = new HttpError("signing up failed, please try again later",500);
  // console.log(err)
  return next(error);
}
  res.json({userId:createUser.id,email:createUser.email,token:token})
};




const login = async (req, res, next) => {
  let { email, password } = req.body;
  let identifiedUser;
  try{
    identifiedUser = await User.findOne({email:email})
  } catch(err){
    const error = new HttpError("Loggin in failed, please try again later",500);
    return next(error);
  }  if (!identifiedUser) {
    const error = new HttpError("Loggin in failed, Invalid credentials",403);
  return next(error);
  }
  let isValidPassword = false;

  try{
    isValidPassword = await bcrypt.compare(password,identifiedUser.password)
  }
  catch(err){
    const error = new HttpError("Couldn't log you in, please try again later.",500);
  return next(error);
  }

  if(!isValidPassword){
    const error = new HttpError("Loggin in failed, Invalid credentials",403);
  return next(error);
  }
  let token;
try{
  token = await jwt.sign({userId:identifiedUser.id, email:identifiedUser.email},process.env.JWT_KEY,{expiresIn:'1h'})
}
catch(err){
  const error = new HttpError("Loggin in failed, please try again later",500);
  // console.log(err)
  return next(error);
}
// console.log('loggged')
  res.json({userId:identifiedUser.id,email:identifiedUser.email,token:token})
};




exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
