//get all specialists from database completed
import { Request, Response, NextFunction } from 'express';
const db=require('../db')

async function getAllSpecialists(req:Request, res:Response) {
    try {
        const specialists = await db.any("SELECT * FROM users WHERE users.id=specialists.specialists_id");
        return res.json(specialists);
    } catch (err) {
        return res.send(err);
    }
}

//get a specialist matching id completed
async function getSpecialistsById(req:Request,res:Response){
    const specialistID=req.body["specialist_id"] ? parseInt(req.body["specialist_id"],10) : parseInt(req.params["specialist_id"])
    try{
        const specialist= await db.one(`SELECT * FROM specialists where id=$1`,
        specialistID)
        return res.json(specialist)
    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

//search for specialist by name completed
async function getSpecialistByName(req:Request, res:Response) {
    const first=JSON.stringify(req.params.first_name)
    const last=JSON.stringify(req.params.last_name)
    try {
        const specialists = await db.one(`SELECT specialists.specialist_id, users.first_name, users.last_name, users.medical_issue FROM specialists, users WHERE users.first_name = ${first} AND users.last_name = ${last}`);
        return res.json(specialists);
    } catch (err) {
        return res.send(err);
    }
}

//get all specialists of a specific field completed
async function getSpecialistsBySpecialty(req:Request, res:Response) {
    const specialty=JSON.stringify(req.params.medical_issue)
    try {
        const specialists = await db.one('SELECT specialists.specialist_id, users.first_name, users.last_name, users.medical_issue FROM specialists, users WHERE users.medical_issue = $1',
        specialty);
        return res.json(specialists);
    } catch (err) {
        return res.send(err);
    }
}

module.exports = {
    getSpecialistsById,
    getAllSpecialists,
    getSpecialistByName,
    getSpecialistsBySpecialty,
}