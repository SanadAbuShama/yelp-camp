
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
    console.log('DATABASE CONNECTED')
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]
const price = Math.floor(Math.random() * 20) + 10;
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const newCamp = new Campground({
            author: '6149ab17cd765c347ebcacb9',
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dju2sbfnj/image/upload/v1631791185/YelpCamp/jwwkbrbz0s2szufqe3q3.jpg',
                    filename: 'YelpCamp/jwwkbrbz0s2szufqe3q3',
                },
                {
                    url: 'https://res.cloudinary.com/dju2sbfnj/image/upload/v1631791185/YelpCamp/xkdnaxaeopqf7vfzjgfw.jpg',
                    filename: 'YelpCamp/xkdnaxaeopqf7vfzjgfw',
                },
                {
                    url: 'https://res.cloudinary.com/dju2sbfnj/image/upload/v1631791186/YelpCamp/sayo1qmbxfturqd2doq9.jpg',
                    filename: 'YelpCamp/sayo1qmbxfturqd2doq9',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa fugit beatae, sapiente, nam minima, cum sunt sequi architecto dignissimos nemo debitis nostrum vero! Recusandae laboriosam aspernatur cum illum, corporis totam.',
            price
        })
        await newCamp.save()
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})