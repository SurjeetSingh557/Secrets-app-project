const express=require('express');
const bodyParser=require('body-parser');
const encrypt=require("mongoose-encryption");
const ejs=require("ejs");
const app=express();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/secrets");
const RegisterSchema=new mongoose.Schema({
    email:String,
    password:String
});
const secretSchema=new mongoose.Schema({
    secret:String
});
const secretItem=mongoose.model("Secret",secretSchema);
const secret="thisislittlesecret.";
RegisterSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]})
const item=mongoose.model("Register",RegisterSchema);

app.get("/",function(req,res){
  res.render("home");
})
app.get("/register", function (req, res) {
  return  res.render("register", { errorMessage: null });
  });

app.get("/login", function (req, res) {
  return  res.render("login", { errorMessage: null });
  });


app.post("/register", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  let errorMessage = "";

  try {
    const foundUser = await item.findOne({ email: username });
    if (foundUser) {
      errorMessage = "User is already registered.";
      return res.render("register", { errorMessage: errorMessage });
    } else {
      const newUser = new item({
        email: username,
        password: password,
      });

      await newUser.save();
      const findsec = await secretItem.find();
      return res.render("secrets", { box: findsec });
    }
  }catch (err) {
    console.log(err);
    return res.status(500).send("Server error");
  }
});
app.post("/login",async function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  try{
    const founduser= await item.findOne({email:username});
    if(founduser){
      if(founduser.password==password){
        const findsec=await secretItem.find();
        return res.render("secrets",{box:findsec,});
      }else{
        let errorMessage="Username or password is incorrect";
        return res.render("login",{errorMessage: errorMessage})
      }
    }else{
      let errorMessage="User not found"
      return res.render("login",{errorMessage: errorMessage});
    }
  }catch(err){
      console.log(err);
  }
})
app.get("/submit",function(req,res){
    try{
        res.render("submit")
    }catch(err){
        console.log(err)
    }
});
app.get("/logout",function(req,res){
    try{
        res.render("home")
    }catch(err){
        console.log(err)
    }
})
app.get("/secrets",async function(req,res){
  const findsec=await secretItem.find();
  return res.render("secrets",{box:findsec})
})
app.post("/submit",function(req,res){
  async function addSecret(){
    try{
      const newSec=new secretItem({
        secret:req.body.secret
      })
      newSec.save();
      return res.redirect("/secrets");
    }catch(err){
      console.log(err)
    }
  }
  addSecret();
})
app.listen(5000,function(){
    console.log("Server Started");
});
