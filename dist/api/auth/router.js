"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const otplib_1 = require("otplib");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const controller_1 = require("../db/controller");
const user_1 = require("../user/user");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
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
const requireToken = (req, res, next) => {
    const { token } = req.body;
    jsonwebtoken_1.default.verify(token, appSecret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token' });
        }
        else {
            // Token is valid, proceed to the next middleware or route handler
            // console.log(decoded)
            next();
        }
    });
};
/**
 * API for user managment
 */
router.get('/', (req, res) => {
    res.send("👍 Server auth working well!");
});
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    (0, controller_1.checkAuth)(email).then(response => {
        if (response.rowCount === 0) {
            // Generate a new secret key for the user
            const secret = otplib_1.authenticator.generateSecret();
            // Create the new account
            (0, controller_1.createAuth)(name, email, password, secret).then((data) => {
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
    // console.log(req.body);
    // Find the user with the given email address
    (0, controller_1.getAuth)(email).then(data => {
        // console.log("DB:", data);
        if (data.rowCount === 1) {
            const user = data.rows[0];
            // console.log("USER:", user);
            // Validate the user's credentials
            if (!user || user.password !== password) {
                return res.status(401).send({ status: "error", message: 'Invalid credentials' });
            }
            // Verify the user's token
            try {
                const secret = user.secret;
                // const token = authenticator.generate(secret);
                const verified = otplib_1.authenticator.verify({ token, secret });
                if (!verified) {
                    return res.status(401).send({ status: "error", message: "Invalid token" });
                }
                // User is authenticated
                const jwToken = jsonwebtoken_1.default.sign({ email: email, userName: user.name }, appSecret, { expiresIn: jwtExpire });
                return res.send({ status: "ok", message: "Login successful", token: jwToken });
            }
            catch (err) {
                // Possible errors
                // - options validation
                // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
                console.error(err);
                return res.status(401).send({ status: "error", message: "Invalid token" });
            }
        }
        else {
            return res.status(401).send({ status: "error", message: 'Invalid credentials' });
        }
    }).catch(error => {
        return res.status(401).send({ status: "error", message: 'Invalid credentials' });
    });
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
/**
 * Protected Routes
 */
router.post('/protected', requireToken, (req, res) => {
    // This route handler will only be called if the user's token is valid
    res.send('Protected resource accessed successfully');
});
router.get('/check', requireToken, (req, res) => {
    // This route handler will only be called if the user's token is valid
    const { token } = req.body;
    jsonwebtoken_1.default.verify(token, appSecret, (err, decoded) => {
        if (err) {
            res.status(401).send({ message: 'Invalid token', data: err });
        }
        else {
            // Token is valid, proceed to the next middleware or route handler
            console.log(decoded); // bar
            (0, controller_1.checkAuth)(decoded.email).then(response => {
                decoded['id'] = response.data.id;
                decoded['expireAt'] = dateFormat.format(new Date(decoded.exp * 1000));
                res.send(decoded);
            }).catch(error => {
                res.status(401).send({ message: 'Invalid credential' });
            });
        }
    });
});
module.exports = router;
//# sourceMappingURL=router.js.map