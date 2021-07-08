const db=require('../db')
import { Request, Response, NextFunction } from 'express';

type Note = {
    noteID:number,
    content:string,
    user_id:number,
}
async function getAllNotes(req:Request, res:Response) {
    try{
        const notes:Note[]=await db.any(`SELECT * FROM notes`)
        return res.json(notes)
    }catch(err){
        return res.status(500).send(err)
    }
}

// //get all notes for a specific user
async function getUserNotes(req:Request, res:Response) {
    const userID=parseInt(req.params.user_id,10)
    try{
        const notes:Note[]=await db.any(`SELECT * FROM notes WHERE user_id=$1`,
        userID)
        return res.json(notes)
    } catch(err){
        return res.status(500).send(err)
    }
}

//get specific note by id
async function getSpecificNote(req:Request, res:Response) {
    const noteInfo:Note = req.body;
    try{
        const notes:Note= await db.one(`SELECT * FROM notes WHERE notes_id=$1`,
        noteInfo.noteID)
        return res.json(notes)
    } catch (err) {
        return res.status(500).send(err)
    }
}

//create a note
async function createNote(req:Request, res:Response) {
    const noteInfo:Note = req.body;
    try{
        await db.none(`INSERT INTO notes (content, user_id) VALUES ($1,$2)`,
        [noteInfo.content, noteInfo.user_id])
        return res.json({
            message:'success'
        })
    } catch (err){
        return res.status(500).send(err)
    }
}


//delete a note
async function deleteNote(req:Request,res:Response){
    const noteInfo:Note = req.body;
    try{
        await db.none(`DELETE FROM notes WHERE notes_id=$1`,
        noteInfo.noteID)
        return res.json({
            message:'success'
        })
    } catch(err){
        return res.status(500).send(err)
    }
}

//update a note
async function updateNote(req:Request, res:Response) {
    const noteInfo:Note=req.body;
    try {
        await db.none(`UPDATE users SET content=$1 WHERE notes_id=$2`,
        [noteInfo.content,noteInfo.noteID])
        return res.json({
            message:'success'
        })
    } catch (err) {
        return res.status(500).send(err)
    }
}

module.exports = {
    getAllNotes,
    getUserNotes,
    getSpecificNote,
    createNote,
    deleteNote,
    updateNote,
}