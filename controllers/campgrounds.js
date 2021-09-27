
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')


module.exports.index = async (req, res) => {
    if (req.query.search) {
        const { search } = req.query;
        const regex = new RegExp(escapeRegex(search), 'gi');
        const campgrounds = await Campground.find({ $or: [{ title: regex }, { location: regex }] })
        res.render('campgrounds/index', { campgrounds, search })
    }
    else {
        const { search } = req.query;
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', { campgrounds, search })
    }

}

module.exports.renderNewForm = (req, res) => {

    res.render('campgrounds/new');
}



module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()

    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${newCampground._id}`);

}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { foundCampground })
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!')
    res.redirect('/campgrounds')
}


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};