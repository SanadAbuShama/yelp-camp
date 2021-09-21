const express = require('express')
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { urlencoded } = require('express');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

router.route('/:id/addImage')
    .post(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id)
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(newImages)
        await campground.save();
    })

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.renderEditForm))


module.exports = router;