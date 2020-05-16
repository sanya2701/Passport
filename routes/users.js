const express = require("express");
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/login",(req,res)=>{
    res.render("login");
})

router.get("/register",(req,res)=>{
    res.render("signup");
})

router.post("/register",(req,res)=>{
    //console.log(req.body);
    const {name, email, psw, psw2} = req.body;
    const password = req.body.psw;
    const errors = [];

    if(!name || !email || !psw || !psw2){
        errors.push({msg:"Please fill in all fields"});
    }

    if(psw.length<6){
        errors.push({msg:"Password length should be atleast 6 characters"});
    }

    if(psw !== psw2){
        errors.push({msg:"Passwords do not match"});
    }

    if(errors.length>0){
        res.render("signup",{
            errors,
            name,email,psw,psw2
        })
    }else{
        //Validation passed
        User.findOne({email:email},(err,user)=>{
            //console.log(user);
            if(user){
                errors.push({msg:"Email is already registered"});
                res.render("signup",{
                    errors,
                    name,email,psw,psw2
                })
            }else{
                const newUser = new User({
                    name,email,password
                });
            
                //encrypt password
                bcrypt.genSalt(10,(err,salt)=>{
                        bcrypt.hash(newUser.password,salt,(err,hash)=>{
                           if(err){
                               throw error;
                           }else{
                               newUser.password = hash;
                               newUser.save((err)=>{
                                   if(err) console.log(err);
                                   else{
                                       req.flash('success_msg','You are now registered and can log in');
                                       res.redirect("/users/login");
                                   }
                               })
                           }
                        })                   
                })
            }
        })
    }
})

router.post("/login",(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash : true 
    })(req,res,next);
});

router.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success_msg","You are logged out");
    res.redirect("/users/login");
})

module.exports = router;