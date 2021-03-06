// const { request } = require('express');
const jwt = require('jsonwebtoken');
import {NextFunction} from 'express';

type User = {
    id:number,
    first_name:string,
    last_name:string, 
    user_name:string, 
    email:string,
    password:string, 
    medical_issue:string,
    account_type:string
}
type Request = {
    user_id:number,
    headers:header,
    authorization: string
}
type Response = {
    user_id:number,
    status:any,
}
type header = {
    authorization:string
}

// generate JWT
async function generateToken (user:User) {
    const secret = process.env.SECRET;

    const token = await jwt.sign(
        {
            "user_id": user["id"],
            "acct_type": user["account_type"]      
        },
        secret,
        {
            expiresIn: '60d'
        }
    );

    console.log(`Token: ${token}`);

    return token;
}

// authorize
async function authorize (req:Request, res:Response, next:NextFunction) {

    const secret = process.env.SECRET;

    // no token
    if (!req.headers.authorization) {
        return res.status(403).json({
            message: "Unauthorized"
        })
    }

    // Bearer token

    // below for when we have a frontend
    // const token = req.headers.authorization.split(" ")[0] === "Bearer" ? req.headers.authorization.split(" ")[1] : null;

    const token = req.headers.authorization.split(" ")[1]

    console.log(token)

    let decoded;

    try {
        decoded = await jwt.verify(token, secret);
    } catch (err) {
        console.log('code')
        return res.status(401).json({
            message: err.message
        })
    }

    if (decoded) {
        req["user_id"] = decoded["user_id"];
        res["user_id"] = decoded["user_id"];
        console.log("req user id: ", req["user_id"])
        console.log("res user id: ", res["user_id"])
        next();
    }
}



// export above

module.exports = {
    generateToken,
    authorize
}