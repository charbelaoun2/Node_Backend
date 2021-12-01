const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Donations = require('../models/donations');

const donationRouter = express.Router();

donationRouter.use(bodyParser.json());

donationRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Donations.find(req.query)

            .then((donations) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donations);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Donations.create(req.body)
            .then((donation) => {
                console.log('Donation Created ', donation);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donation);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /donations');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Donations.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

donationRouter.route('/:donationId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Donations.findById(req.params.donationId)

            .then((donation) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donation);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /donations/'+ req.params.donationId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Donations.findByIdAndUpdate(req.params.donationId, {
            $set: req.body
        }, { new: true })
            .then((donation) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donation);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Donations.findByIdAndRemove(req.params.donationId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = donationRouter;
