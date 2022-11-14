import { validationResult } from 'express-validator';
import { checkEmail } from '../middleware/validation.js';
import bcrypt from 'bcryptjs';


export async function login(req, res) {
    try {
        // 1. result of req.body validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // 2. check user in database
        let user = await checkEmail(req.body.email);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        // 3. compare hashed passwords
        let checkPass = await bcrypt.compare(req.body.password, user["password"])
        if (!checkPass) {
            return res.status(400).send({ message: 'Incorrect password' });
        }
        
        // 4. create and add user data to session
        req.session.regenerate(function (err) {
            if (err) next(err)
            req.session.authenticated = true;
            req.session.user = {
                id: user["id"],
                email: user["email"],
                password: user["password"]
            }
            
            req.session.save(function (err) {
                if (err) return next(err)
                res.redirect('/');
            })

        })
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}

export async function logout(req, res) {
    try {
        req.session.user = null;
        req.session.authenticated = false;
        req.session.save(function (err) {
            if (err) next(err)
            req.session.regenerate(function (err) {
              if (err) next(err)
              res.redirect('/');
            })
        });
    } catch (error) {
        res.status(400).send(error);
    }
}