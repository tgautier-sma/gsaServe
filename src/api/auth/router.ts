
import { authenticator } from 'otplib';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import expressJWT from 'express-jwt';
import QRCode from 'qrcode';

import { createAuth, getAuth, checkAuth, updateAuth, deleteAuth } from "../db/controller";
import { users, User } from '../user/user';

import express from "express";
const router = express.Router();
const appSecret = 'supersecret';
const jwtExpire = "7d";
var dateFormat = new Intl.DateTimeFormat('fr-FR', {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
});
//var usedOptions = dateFormat.resolvedOptions();
/**
 * Common functions
 */
const requireToken = (req: any, res: any, next: any) => {
    const { token } = req.body;
    jwt.verify(token, appSecret, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token' });
        } else {
            // Token is valid, proceed to the next middleware or route handler
            // console.log(decoded)
            next();
        }
    });
}
/**
 * API for user managment
 */
router.get('/', (req, res) => {
    res.send("👍 Server auth working well!");
})
router.post('/register', (req: any, res: any) => {
    const { name, email, password } = req.body;
    checkAuth(email).then(response => {
        if (response.rowCount === 0) {
            // Generate a new secret key for the user
            const secret = authenticator.generateSecret();
            // Create the new account
            createAuth(name, email, password, secret).then((data: any) => {
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
            return res.send({ status: "error", message: 'Account not allowed to register', data: null });
        }
    }).catch(error => {
        return res.send({ status: "error", message: 'Technical error', data: error });
    });
});
router.post('/login', (req: any, res: any) => {
    var { email, password, token } = req.body;
    // console.log(req.body);
    // Find the user with the given email address
    getAuth(email).then(data => {
        // console.log("DB:", data);
        if (data.rowCount === 1) {
            const user = data.rows[0];
            // console.log("USER:", user);
            // Validate the user's credentials
            if (!user || user.password !== password) {
                // return res.status(401).send({ status: "error", message: 'Invalid credentials' });
                return res.status(401).send({ status: "error", message: 'Invalid credentials' });
            }
            // Verify the user's token
            const secret = user.secret;
            let isValid=false;
            // token = authenticator.generate(secret);
            try {
                 isValid = authenticator.check(token.toString(), secret);
                 // console.log("Verify user secret:", secret, ", token:", token, ", Result:", isValid, typeof isValid);
              } catch (err) {
                // Possible errors
                // - options validation
                // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
                console.log("Error Verify user secret:", secret, ", token:", token, ", Result:", err);
                return res.status(401).send({ status: "error", message: "Invalid token" });
              }
            if (isValid){
                // User is authenticated
                const jwToken = jwt.sign(
                    { email: email, userName: user.name },
                    appSecret,
                    { expiresIn: jwtExpire }
                );
                return res.send({ status: "ok", message: "Login successful", token: jwToken });
            } else {
                return res.status(401).send({ status: "error", message: "Invalid token" });
            }  
        } else {
            return res.status(401).send({ status: "error", message: 'Invalid credentials' });
        }
    }).catch(error => {
        return res.status(401).send({ status: "error", message: 'Invalid credentials' });
    });
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

/**
 * Protected Routes
 */
router.post('/protected', requireToken, (req: any, res: any) => {
    // This route handler will only be called if the user's token is valid
    res.send('Protected resource accessed successfully');
});
router.post('/check', requireToken, (req: any, res: any) => {
    // This route handler will only be called if the user's token is valid
    const { token } = req.body;
    jwt.verify(token, appSecret, (err: any, decoded: any) => {
        if (err) {
            res.status(401).send({ status: "error", message: 'Invalid token', data: err });
        } else {
            // Token is valid, proceed to the next middleware or route handler
            // console.log(decoded) // bar
            checkAuth(decoded.email).then(response => {
                decoded['id'] = response.data.id;
                decoded['expireAt'] = dateFormat.format(new Date(decoded.exp * 1000));
                res.send(decoded);
            }).catch(error => {
                res.status(401).send({ status: "error", message: 'Invalid credential' });
            })
        }
    });
});

module.exports = router;