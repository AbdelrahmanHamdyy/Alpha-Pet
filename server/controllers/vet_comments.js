const { validationResult } = require('express-validator');
const connection = require('../connection.js');

const getCommentsOfVet = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.params;
    const { postType } = req.query;
    let sqlStr;
    if(postType == 'owner') sqlStr = `SELECT * FROM OwnerPost_VetComment, Vet_Comment WHERE VetComment_ID = C_Id AND OWNEREMAIL = '${email}'`;
    else if(postType == 'vet') sqlStr = `SELECT * FROM VetPost_VetComment, Vet_Comment WHERE VetComment_ID = C_Id AND OWNEREMAIL = '${email}'`;
    else if(postType == 'pharmacist') sqlStr = `SELECT * FROM PharmacistPost_VetComment, Vet_Comment WHERE VetComment_ID = C_Id AND OWNEREMAIL = '${email}'`;
    else sqlStr = `SELECT * FROM Vet_Comment WHERE OWNEREMAIL = '${email}'`;
    
    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });
            
            res.status(200).json({ data: results, fields });
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getCommentById = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const sqlStr = `SELECT * FROM Vet_Comment WHERE C_Id = ${id}`;
    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });
            
            res.status(200).json({ data: results, fields });
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createComment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { postId, content, currentUserEmail } = req.body;
    const { postType } = req.query;
    let commentId = 0;
    let comment;
    const sqlStr = `INSERT INTO VET_COMMENT(COMMENT_CONTENT, VETEMAIL) VALUES ('${content}', '${currentUserEmail}')`;
    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });
            
            comment = results;
            commentId = results[0].C_Id;            
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }

    if(postType == 'owner') sqlStr = `INSERT INTO OwnerPost_VetComment VALUES (${postId}, ${commentId})`;
    else if(postType == 'vet') sqlStr = `INSERT INTO VetPost_VetComment VALUES (${postId}, ${commentId})`;
    else sqlStr = `INSERT INTO PharmacistPost_VetComment VALUES (${postId}, ${commentId})`;

    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });

            res.status(200).json({ data: comment, fields });            
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const updateComment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { commentId, content, currentUserEmail } = req.body;

    const sqlStr = `UPDATE VET_COMMENT SET CONTENT = ${content} WHERE C_ID = ${commentId} AND VETEMAIL = '${currentUserEmail}'`;
    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });

            res.status(200).json({ data: comment, fields });            
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const deleteComment = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { commentId, currentUserEmail } = req.body;

    const sqlStr = `DELETE FROM VET_COMMENT WHERE C_ID = ${commentId} AND VETEMAIL = '${currentUserEmail}'`;
    try {
        connection.query(sqlStr, (error, results, fields) => {
            if(error) return res.status(400).json({ message: error.message });

            res.status(200).json({ data: results, fields });            
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = {
    getCommentsOfVet,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
}
