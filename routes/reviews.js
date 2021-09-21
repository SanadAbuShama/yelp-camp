
const express = require('express')
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { urlencoded } = require('express');
const Campground = require('../models/campground');
const Review = require('../models/review')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.addReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))


module.exports = router;