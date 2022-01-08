const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [' https://donationbackendwebsite.herokuapp.com/','process.env.PORT||http://localhost:3001']
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
