const env = process.env;
import express from 'express';
import helmet from "helmet";
import bodyParser from 'body-parser';
var cors = require('cors')
import path from 'path';
import 'dotenv/config';
// Vercel Analytics
import { inject } from '@vercel/analytics';
inject();

// logging system
import winston from 'winston';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'gsa-serve' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

/**
 * Import functions for router access
 */
import { getGeoConfig } from "./api/geo";
import {
    readDb, testDb,
    getApps, createApp, getApp,
    getStores,
    createStoreKey, updateStoreKey, deleteStoreKey,
    createAuth, getAuth, checkAuth, updateAuth, deleteAuth,
    getStoreKey, getStoreApp
} from "./api/db";
import { users, User } from './api/user/user';
import { authenticator } from 'otplib';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import expressJWT from 'express-jwt';
import QRCode from 'qrcode';

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
 * Configure server application
 */
const app = express();
app.use(cors());
app.use(helmet());
app.disable('x-powered-by');
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
logger.info("System launched");
/**
 * APIs for general access to server
 */
app.get("/", (req, res) => {
    res.send("👍 Server working well!");
});

app.get('/api', (req, res) => {
    res.send('Hey ! this is my API running 🥳')
})

app.get('/api/about', (req, res) => {
    res.send('👌 This is my about route..... ')
})

app.get('/api/connect', (req, res) => {
    // db.connect();
    res.send('This is a db connect..... ')
})

app.post('/api/event', (req, res) => {
    console.info(req.body);
    res.send(
        {
            msg: 'POST EVENT request received. See Log for detailed data received.',
            ts: new Date(),
            query: req.query,
            params: req.params,
            body: req.body
        }
    );
})
/**
 * API for user managment
 */
app.post('/api/register', (req, res) => {
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
                        return res.send({ status: "error", message: 'Error creating qrCode',data:err });
                    }
                    // Send the QR code to the user
                    res.send({
                        status:"ok",
                        email: email,
                        qrCode: image_data
                    });
                });
            }).catch((error: any) => {
                return res.send({ status: "error", message: 'Technical error',data:error });
            });
        } else {
            return res.send({ status: "error", message: 'Register not authorized',data:null });
        }
    }).catch(error => {
        return res.send({ status: "error", message: 'Technical error',data:error });
    });
});

app.post('/login', (req, res) => {
    const { email, password, token } = req.body;
    // Find the user with the given email address
    getAuth(email).then(data => {
        console.log("DB:", data);
        if (data.rowCount === 1) {
            const user = data.rows[0];
            console.log("USER:", user);
            // Validate the user's credentials
            if (!user || user.password !== password) {
                return res.status(401).send({ message: 'Invalid credentials' });
            }
            // Verify the user's token
            const verified = authenticator.check(token, user.secret)
            if (!verified) {
                return res.status(401).send({ message: "Invalid token" });
            }
            // User is authenticated
            res.send({ message: "Login successful", token: jwt.sign(email, 'supersecret') });
        } else {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
    }).catch(error => {
        return res.status(401).send({ message: 'Invalid credentials' });
    });
});
app.post('/protected', requireToken, (req, res) => {
    // This route handler will only be called if the user's token is valid
    res.send('Protected resource accessed successfully');
});
app.get('/user', (req, res) => {
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
app.get('/users', (req, res) => {
    res.send(users);
});

/**
 * API for GeoPortail access
 */
app.get('/api/geo/config', (req, res) => {
    getGeoConfig().then((config: any) => {
        console.log("(i) Config", config);
        res.send(config);
    }).catch((error: any) => {
        res.send(error);
    });
});

/**
 * API for db access - postgres on Vercel
 */
app.get('/api/db', (req, res) => {
    const db = req.query.db || 'cards';
    const page = req.query.page || '1';
    const size = req.query.pageSize || '100';
    const id = req.query.id || null;
    const email = req.query.email || null;
    const dbName: string = db.toString();
    const pageNumber: string = page.toString();
    const pageSize: string = size.toString();

    logger.info(`Read DB ${dbName},page ${page}, pageSize ${pageSize}`);
    readDb(dbName, id, email, pageNumber, pageSize).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
app.get('/api/db/test', (req, res) => {
    console.log("Test DB");
    testDb().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

/**
 * Api for apps request
 */
app.get('/api/db/apps', (req, res) => {
    getApps().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

app.get('/api/db/app/uid', (req, res) => {
    const email = req.query.email || null;
    const app = req.query.app || null;
    if (email && app) {
        createApp(app, email).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send({
                ts: new Date(),
                status: 'error',
                msg: 'Email and application code already exists. No account created.'
            });
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Email and application code is mandatory. No account created.'
        });
    }
});
app.get('/api/db/app', (req, res) => {
    const app = req.query.app || null;
    getApp(app).then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});

/**
 * API for store json database
 */
// Api Store Request
app.get('/api/db/stores', (req, res) => {
    getStores().then((data: any) => {
        res.send(data);
    }).catch((error: any) => {
        res.send(error);
    });
});
// createStoreKey
app.get('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || { "default": new Date() };
    if (uid && key) {
        createStoreKey(uid, key, values).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store created.`
                });
            } else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store created.`
                });
            }
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store created.'
        });
    }
});
app.put('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    const values = req.query.data || req.body || null;
    if (uid && key && values) {
        updateStoreKey(uid, key, values).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store updated.`
                });
            } else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Key ${key} for this application code already exists. No store updated.`
                });
            }
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store updated.'
        });
    }
});
app.delete('/api/db/store', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        deleteStoreKey(uid, key).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            if (error.code == "23503") {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `Application code ${uid} unknown. No store deleted.`
                });
            } else {
                res.send({
                    ts: new Date(),
                    status: 'error',
                    code: error.code,
                    msg: `No store delete.`
                });
            }
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store updated.'
        });
    }
});
app.get('/api/db/store/key', (req, res) => {
    const uid = req.query.uid || null;
    const key = req.query.key || null;
    if (uid && key) {
        getStoreKey(uid, key).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code and key are mandatory. No store readed.'
        });
    }
});
app.get('/api/db/store/app', (req, res) => {
    const uid = req.query.uid || null;
    if (uid) {
        getStoreApp(uid).then((data: any) => {
            res.send(data);
        }).catch((error: any) => {
            res.send(error);
        });
    } else {
        res.send({
            ts: new Date(),
            status: 'error',
            msg: 'Application code is mandatory. No store readed.'
        });
    }
});

// Activate Application server
const port = 3000
app.listen(port, function () {
    console.log('gsaServe server listening on port ' + port + '!');
});
// Export the Express API
module.exports = app

