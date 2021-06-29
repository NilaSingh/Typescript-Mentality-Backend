require("dotenv").config();
const db = require("../db")
const bcrypt=require("bcrypt")
import { Request, Response, NextFunction } from 'express';

// const jwt = require('jsonwebtoken')
const {generateToken} =  require('../middleware/user_auth')
//USER TABLE CONTROLLERS  
//get all users from database
async function getAllUsers(req:Request,res:Response){
    try{
        const users = await db.any(`SELECT * FROM users`)
        console.log(users)
        return res.json(users)
    }catch(err) {
        res.send(err)
    }
}

//get user by username TODO: test/change
async function getUserByName(req:Request,res:Response) {
    const query = req.params.query
    try{
        // const results = await db.any(`SELECT * FROM users WHERE lower(user_name) LIKE '%${query.toLowerCase()}%';`)
        const results = await db.any(`SELECT * FROM users WHERE user_name = $1`, query)
        return res.json(results)
    }catch(err){
        res.json(err.message)
    }
}

//get the username and password, returns the username  user sign in function
async function getUserAccountInfo(req:Request,res:Response){ 
    const username = req.params.userName;
    const password= req.params.password;
    try {
        const user = await db.one(`SELECT * FROM users WHERE users.user_name = ${username} AND users.password = ${password}`);
        return res.json(user);
    } catch (err) {
        res.send(err);
    }
}

//get a single user from table, now works
async function getAUser(req:Request,res:Response){
    const id=parseInt(req.params.id,10)
    try {
        const user = await db.any(`SELECT * FROM users WHERE id = $1`, id)
        return res.json(user)
    }catch(err){
        return res.json({message: err.message})
    }
}

//get users by the a certain issue
async function getUsersByIssue(req:Request, res:Response) {
    const issue=req.params.issue;
    try {
        const specialists = await db.any(`SELECT * FROM users WHERE medical_issue = $1`, issue);
        return res.status(200).json(specialists);
    } catch (err) {
        res.send(err);
    }
}

//SPECIALIST TABLE CONTROLLERS
async function getAllSpecialists(req:Request, res:Response) {
    try {
        const specialists = await db.any(`SELECT * FROM users WHERE account_type = 'specialist'`);
        return res.json(specialists);
    } catch (err) {
        res.send(err);
    }
}


//PATIENT TABLE CONTROLLERS
async function getAllPatients(req:Request, res:Response) {
    try {
        const patients = await db.any(`SELECT * FROM users WHERE account_type = 'patient'`);
        return res.json(patients);
    } catch (err) {
        res.send(err);
    }
}

//create one user and add to table not added to routes yet
async function registerUser(req:Request, res:Response){
    let user=req.body
    let hashedPassword;
    const rounds=10
    // console.log('created user, ',user)
    if(!user){
        return res.status(400).json({
            message:"Account Information Invalid"
        })
    }
    try{
        hashedPassword = await bcrypt.hash(user.password, rounds)
        user.password=hashedPassword
    }catch(err){
        return res.status(401).json({
            message: "Invalid Password",
            error: err.message
        })
    }
    let token;
    try{
        console.log(user.password)
        await db.none('INSERT INTO users (first_name, last_name, user_name, email, password, medical_issue, account_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.first_name, user.last_name, user.user_name, user.email, user.password, user.medical_issue, user.account_type]
        )
        // const userID = await db.one(`SELECT id, account_type FROM users WHERE user_name=${user_name}`, user)
        // console.log("User Created: ", userID)
        token=await generateToken(1)
        return res.status(201).json({token})
    }catch(err){
        console.log(`ERROR CAUGHT : ${err.message}`)
        return res.status(400).json({error: err.message})
    }

}


async function userLogin(req:Request, res:Response){
    const users=req.body;
    const password= req.params.password;
    const {exists} = await db.one(`SELECT EXISTS(SELECT * FROM users WHERE user_name = $1)`, users.user_name)
    let user;
    if(!exists){
        return res.status(404).json({
            message: "User Not Found"
        })
    } else {
        user = await db.one(`SELECT * FROM users WHERE user_name = $1 AND password = $2)`, [users.user_name, users.password])
        console.log(user)
    }
    let match;
    try{
        match=await bcrypt.compare(password, user.password)
        if(!match){
            return res.status(401).json({
                message: "Invalid Credentials"
            })
        }else{
            const token = await generateToken(user)
            return res.status(202).json({"token":token})
        }
    } catch(err){
        return res.status(400).json(err.message)
    }
}

//select a specific type of user
async function getAccountType(req:Request, res:Response){
    const accountType=JSON.stringify(req.params.account_type);
    if(accountType === 'Specialist'){
        try{
            const userTypes = await db.any(`SELECT * FROM users WHERE account_type=$1`,
            'specialist')
            return res.json(userTypes)
        } catch (err) {
            res.send(err)
        }
    }else if(accountType === "User"){
        try{
            const userTypes = await db.any(`SELECT * FROM users WHERE account_type=$1`,
            'patient')
            return res.json(userTypes)
        } catch (err) {
            res.send(err)
        }
    }
}

//get user by account by account_type by user_name
async function getAccountByTypeAndUsername(req:Request, res:Response){
    let info = req.body;
    try {
        const users = await db.any(`SELECT * FROM users WHERE account_type = $1 AND user_name = $2`, [info.account_type, info.user_name]);
        return res.json(users);
    } catch (err) {
        res.send(err);
    }
}

async function getAccountByIssueAndUsername(req:Request, res:Response){
    let info = req.body;
    try {
        const users = await db.any(`SELECT * FROM users WHERE medical_issue = $1 AND user_name = $2`, [info.medical_issue, info.user_name]);
        return res.json(users);
    } catch (err) {
        res.send(err);
    }
}

async function getSpecificAccount(req:Request, res:Response){
    let info = req.body;
    try {
        const users = await db.any(`SELECT * FROM users WHERE medical_issue = $1 AND user_name = $2 AND account_type = $3`, [info.medical_issue, info.user_name, info.account_type]);
        return res.json(users);
    } catch (err) {
        res.send(err);
    }
}

async function getAccountByTypeAndIssue(req:Request, res:Response){
    let info = req.body;
    try {
        const users = await db.any(`SELECT * FROM users WHERE medical_issue = $1 AND account_type = $2`, [info.medical_issue, info.account_type]);
        return res.json(users);
    } catch (err) {
        res.send(err);
    }
}
module.exports = {
    getAUser,
    getAllUsers,
    getUserByName,
    getAccountType,
    getAllSpecialists,
    getAllPatients,
    getUsersByIssue,
    getUserAccountInfo,
    registerUser,
    userLogin,
    getAccountByTypeAndUsername,
    getAccountByIssueAndUsername,
    getSpecificAccount,
    getAccountByTypeAndIssue
};
