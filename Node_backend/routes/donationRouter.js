const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Donations = require('../models/donations');

const donationRouter = express.Router();

donationRouter.use(bodyParser.json());

donationRouter.route('/')
    .get((req,res,next) => {
        Donations.find({})
            .populate('comments.author')
            .then((donations) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donations);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser,(req, res, next) => {
        Donations.create(req.body)
            .then((donation) => {
                console.log('Donation Created ', donation);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donation);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /donations');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Donations.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

donationRouter.route('/:donationId')
    .get((req,res,next) => {
        Donations.findById(req.params.donationId)
            .populate('comments.author')
            .then((donation) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(donation);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) =>{
        res.statusCode = 403;
        res.end('POST operation not supported on /donations/'+ req.params.donationId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
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
    .delete(authenticate.verifyUser, (req, res, next) => {
        Donations.findByIdAndRemove(req.params.donationId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

donationRouter.route('/:donationId/comments')
    .get((req,res,next) => {
        Donations.findById(req.params.donationId)
            .populate('comments.author')
            .then((donation) => {
                if (donation != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(donation.comments);
                }
                else {
                    err = new Error('Donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Donations.findById(req.params.donationId)
            .then((donation) => {
                if (donation != null) {
                    req.body.author = req.user._id;
                    donation.comments.push(req.body);
                    donation.save()
                        .then((donation) => {
                            Donations.findById(donation._id)
                                .populate('comments.author')
                                .then((donation) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(donation);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /donations/'
            + req.params.donationId + '/comments');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Donations.findById(req.params.donationId)
            .then((donation) => {
                if (donation != null) {
                    for (var i = (donation.comments.length -1); i >= 0; i--) {
                        donation.comments.id(donation.comments[i]._id).remove();
                    }
                    donation.save()
                        .then((donation) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(donation);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

donationRouter.route('/:donationId/comments/:commentId')
    .get((req,res,next) => {
        Donations.findById(req.params.donationId)
            .populate('comments.author')
            .then((donation) => {
                if (donation != null && donation.comments.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(donation.comments.id(req.params.commentId));
                }
                else if (donation == null) {
                    err = new Error('donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /donations/'+ req.params.donationId
            + '/comments/' + req.params.commentId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Donations.findById(req.params.donationId)
            .then((donation) => {
                if (donation != null && donation.comments.id(req.params.commentId) != null) {
                    if (req.body.rating) {
                        donation.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.comment) {
                        donation.comments.id(req.params.commentId).comment = req.body.comment;
                    }

                    donation.save()
                        .then((donation) => {
                            Donations.findById(donation._id)
                                .populate('comments.author')
                                .then((donation) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(donation);
                                })
                        }, (err) => next(err));
                }
                else if (donation == null) {
                    err = new Error('donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Donations.findById(req.params.donationId)
            .then((donation) => {
                if (donation != null && donation.comments.id(req.params.commentId) != null) {
                    donation.comments.id(req.params.commentId).remove();
                    donation.save()
                        .then((donation) => {
                            Donations.findById(donation._id)
                                .populate('comments.author')
                                .then((donation) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(donation);
                                })
                        }, (err) => next(err));
                }
                else if (donation == null) {
                    err = new Error('donation ' + req.params.donationId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = donationRouter;
