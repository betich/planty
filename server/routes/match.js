const express = require('express');
const auth = require('../middleware/index');
const router = express.Router();
const Project = require('../models/projects');
const User = require('../models/users');
const sendError = require('../helpers/sendError');

router
.get('/', auth.checkLogin, async (req, res) => {
    try {
        // estimatedDocumentCount() - O(1)
        // countDocuments({}) - O(n)
        await Project.aggregate([
            { $match: {
                $and: [{owner: { $ne: req.user._id }}, {workers: { $ne: req.user._id }}]
            }},
            { $sample: { size: 1 } }
        ])
        .exec((err, result) => {
            if (err) throw err;
            Project.populate(result, ['owner', 'workers'],
                (err, foundProject) => {
                    if (err) throw err;
                    res.status(200).json(foundProject[0]);
                });
        });
        
        /*
        Project.estimatedDocumentCount().exec((err, count) => {
            if (err) throw err;
            const random = Math.floor(Math.random() * count);
            Project.findOne({ owner: { $ne: req.user._id }, workers: { $ne: req.user._id }})
                .populate("owner")
                .populate("workers")
                .skip(random)
                .exec((err, result) => {
                    if (err) throw err;
                    res.status(200).send(result);
                });
        });
        */
    } catch (err) {
        sendError(req, res, err);
    }
})

.post('/', auth.checkLogin, (req, res) => {
    Project.findById(req.query.p)
        .populate("owner", "_id").populate("workers", "_id")
        .then((foundProject) => {
            if (foundProject) {
                return foundProject;
            } else {
                res.status(404).send("can't find the project you're looking for");
            }
        })
        .then(async (foundProject) => {
            let alreadyJoined = false;
            let foundUser = await User.findById(req.user._id);
            
            if (foundProject.owner._id.equals(foundUser._id)) alreadyJoined = true;
            foundProject.workers.forEach((worker) => {
                if (worker._id.equals(foundUser._id)) {
                    alreadyJoined = true;
                }
            })

            if (alreadyJoined) res.status(409).send("duplicate project");
            else {
                return [foundUser, foundProject];
            }
        })
        .then(async (results) => {
            if (!results) return null;
            let [foundUser, foundProject] = results;
            foundProject.workers.push(req.user._id);

            foundUser.projects.push({
                info: foundProject._id,
                role: "worker"
            })

            const [user, project] = await Promise.all([foundUser.save(), foundProject.save()])
            res.status(200).send(project);
        })
        .catch((err) => sendError(req, res, err))
})

module.exports = router;
