
import { authenticator } from 'otplib';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import expressJWT from 'express-jwt';
import QRCode from 'qrcode';

import { createAuth, getAuth, checkAuth, updateAuth, deleteAuth } from "../db/controller";
import { users, User } from '../user/user';

import express from "express";
const router = express.Router();

/**
 * Common functions
 */
const requireToken = (req: any, res: any, next: any) => {
    const { token } = req.body;
    // Find the user with the given email address
    const user = users.find(u => u.email === req.user.email);
    // Verify the user's token
    const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token,
        window: 1
    });
    if (!verified) {
        return res.status(401).send('Invalid token');
    }
    // Token is valid, proceed to the next middleware or route handler
    next();
}
/**
 * API for user managment
 */
router.get('/', (req, res) => {
    res.send("👍 Server auth working well!");
})
router.post('/register', (req: any, res: any) => {
    const { name, email, password } = req.body;
    // Generate a new secret key for the user
    const secret = authenticator.generateSecret();
    // Save the user data in the database
    const user = new User(users.length + 1, name, email, password, secret);
    checkAuth(email).then(response => {
        if (response.rowCount === 0) {
            // Create the new account
            createAuth(name, email, password, secret).then((data: any) => {
                users.push(user);
                // Generate a QR code for the user to scan
                var url = authenticator.keyuri(email, '2FA Node App', secret);
                QRCode.toDataURL(url, (err: any, image_data: any) => {
                    if (err) {
                        console.error(err);
                        return res.send({ status: "error", message: 'Error creating qrCode', data: err });
                    }
                    // Send the QR code to the user
                    res.send({
                        status: "ok",
                        email: email,
                        qrCode: image_data
                    });
                });
            }).catch((error: any) => {
                return res.send({ status: "error", message: 'Technical error', data: error });
            });
        } else {
            return res.send({ status: "error", message: 'Register not authorized', data: null });
        }
    }).catch(error => {
        return res.send({ status: "error", message: 'Technical error', data: error });
    });
});
router.post('/login', (req: any, res: any) => {
    const { email, password, token } = req.body;
    // console.log(req.body);
    // Find the user with the given email address
    getAuth(email).then(data => {
        // console.log("DB:", data);
        if (data.rowCount === 1) {
            const user = data.rows[0];
            // console.log("USER:", user);
            // Validate the user's credentials
            if (!user || user.password !== password) {
                return res.status(401).send({ status: "error",message: 'Invalid credentials' });
            }
            // Verify the user's token
            try {
                const secret = user.secret;
                // const token = authenticator.generate(secret);
                const verified = authenticator.verify({ token, secret });
                if (!verified) {
                    return res.status(401).send({ status: "error", message: "Invalid token" });
                }
                // User is authenticated
                return res.send({ status: "ok", message: "Login successful", token: jwt.sign(email, 'supersecret') });
            } catch (err) {
                // Possible errors
                // - options validation
                // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
                console.error(err);
                return res.status(401).send({ status: "error", message: "Invalid token" });
            }
        } else {
            return res.status(401).send({ status: "error", message: 'Invalid credentials' });
        }
    }).catch(error => {
        return res.status(401).send({ status: "error", message: 'Invalid credentials' });
    });
});
router.post('/protected', requireToken, (req: any, res: any) => {
    // This route handler will only be called if the user's token is valid
    res.send('Protected resource accessed successfully');
});
router.get('/user', (req: any, res: any) => {
    const email = req.query.email || null;
    if (email) {
        checkAuth(email).then(response => {
            return res.send(response);
        }).catch(error => {
            return res.send(error);
        })
    } else {
        return res.status(401).send({ message: 'Missing parameter' });
    }
});
router.get('/users', (req: any, res: any) => {
    res.send(users);
});

module.exports = router;