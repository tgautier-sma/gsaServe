"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const otplib_1 = require("otplib");
const speakeasy_1 = __importDefault(require("speakeasy"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const controller_1 = require("../db/controller");
const user_1 = require("../user/user");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/**
 * Common functions
 */
const requireToken = (req, res, next) => {
    const { token } = req.body;
    // Find the user with the given email address
    const user = user_1.users.find(u => u.email === req.user.email);
    // Verify the user's token
    const verified = speakeasy_1.default.totp.verify({
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
};
/**
 * API for user managment
 */
router.get('/', (req, res) => {
    res.send("👍 Server auth working well!");
});
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    // Generate a new secret key for the user
    const secret = otplib_1.authenticator.generateSecret();
    // Save the user data in the database
    const user = new user_1.User(user_1.users.length + 1, name, email, password, secret);
    (0, controller_1.checkAuth)(email).then(response => {
        if (response.rowCount === 0) {
            // Create the new account
            (0, controller_1.createAuth)(name, email, password, secret).then((data) => {
                user_1.users.push(user);
                // Generate a QR code for the user to scan
                var url = otplib_1.authenticator.keyuri(email, '2FA Node App', secret);
                qrcode_1.default.toDataURL(url, (err, image_data) => {
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
            }).catch((error) => {
                return res.send({ status: "error", message: 'Technical error', data: error });
            });
        }
        else {
            return res.send({ status: "error", message: 'Register not authorized', data: null });
        }
    }).catch(error => {
        return res.send({ status: "error", message: 'Technical error', data: error });
    });
});
router.post('/login', (req, res) => {
    const { email, password, token } = req.body;
    // Find the user with the given email address
    (0, controller_1.getAuth)(email).then(data => {
        console.log("DB:", data);
        if (data.rowCount === 1) {
            const user = data.rows[0];
            console.log("USER:", user);
            // Validate the user's credentials
            if (!user || user.password !== password) {
                return res.status(401).send({ message: 'Invalid credentials' });
            }
            // Verify the user's token
            const verified = otplib_1.authenticator.check(token, user.secret);
            if (!verified) {
                return res.status(401).send({ message: "Invalid token" });
            }
            // User is authenticated
            res.send({ message: "Login successful", token: jsonwebtoken_1.default.sign(email, 'supersecret') });
        }
        else {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
    }).catch(error => {
        return res.status(401).send({ message: 'Invalid credentials' });
    });
});
router.post('/protected', requireToken, (req, res) => {
    // This route handler will only be called if the user's token is valid
    res.send('Protected resource accessed successfully');
});
router.get('/user', (req, res) => {
    const email = req.query.email || null;
    if (email) {
        (0, controller_1.checkAuth)(email).then(response => {
            return res.send(response);
        }).catch(error => {
            return res.send(error);
        });
    }
    else {
        return res.status(401).send({ message: 'Missing parameter' });
    }
});
router.get('/users', (req, res) => {
    res.send(user_1.users);
});
module.exports = router;
//# sourceMappingURL=router.js.map