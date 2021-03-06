const Project = require('../models/projects');
const User = require('../models/users');
const usernameRegex = require('../helpers/usernameRegex');
    
const middleware = {
    checkLogin: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.status(401).send("You need to be logged in first");
        }
    },
    checkUser: (req,res,next) => {
        if (req.isAuthenticated()) {
            // Is the user the same?
            User.findOne({ username: req.params.username }, (err, foundUser) => {
                if (err || !foundUser) {
                    res.status(404).send("Sorry, We Can't find the User!");
                }
                else if (foundUser._id.equals(req.user._id)) {
                    next();
                }
                else if (!foundUser._id.equals(req.user._id)) {
                    res.status(403).send("You don't have permission to do that");
                }
                else {
                    res.status(500).send("An an unknown error occured");
                }
            });
        } else {
            res.status(401).send("You need to be logged in first");
        }
    },
    checkUserByUsername: (req,res,next) => {
        if (req.isAuthenticated()) {
            // Is the user the same?
            User.findOne({username : usernameRegex(req.params.username)}, (err, foundUser) => {
                if (err || !foundUser) {
                    res.status(404).send("Sorry, We Can't find the User!");
                }
                else if (foundUser._id.equals(req.user._id)) {
                    next();
                }
                else if (!foundUser._id.equals(req.user._id)) {
                    res.status(403).send("You don't have permission to do that");
                }
                else {
                    res.status(500).send("An an unknown error occured");
                }
            });
        } else {
            res.status(401).send("You need to be logged in first");
        }
    },
    checkProjectOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            // Does the user own the project?
            Project.findById(req.params.id, (err, foundProject) => {
                if (err || !foundProject) {
                    res.status(404).send("Sorry, Your Project cannot be found!");
                }
                else if (foundProject.owner.equals(req.user._id)) {
                    next();
                }
                else if (!foundProject.owner.equals(req.user._id)) {
                    res.status(403).send("You don't have permission to do that");
                }
                else {
                    res.status(500).send("An an unknown error occured");
                }
            });
        } else {
            res.status(401).send("You need to be logged in first");
        }
    }
}

module.exports = middleware;