const Blog = require('../models/blog');
const mongoose = require('mongoose');
const blogs = require('./blogs');

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/BLOGS');
    // await mongoose.connect('mongodb://localhost:27017');
    console.log("Database Connected!!!! ");
}


const seedDB = async () => {
    await Blog.deleteMany({});
    for (let i = 0; i < 14; i++) {
        const blog = new Blog({
            title: `${blogs[i].title}`,
            shortdescription: `${blogs[i].subdescription}`,
            description: `${blogs[i].description}`,
            author: '651801476877e33651c54541',
            //author: '64de55a8da5e393a8307315a',
            logo: [
                {
                    url: 'https://res.cloudinary.com/dfxbpcwoq/image/upload/v1703327690/YelpCamp/e8vmmvxs0napcvhvogmj.jpg',
                    filename: 'YelpCamp/e8vmmvxs0napcvhvogmj',
                },
                {
                    url: 'https://res.cloudinary.com/dfxbpcwoq/image/upload/v1702551962/YelpCamp/gtwxvhlaztrp1jodeog0.jpg',
                    filename: 'YelpCamp/gtwxvhlaztrp1jodeog0',
                }
                // {
                //     //
                //     url: 'https://res.cloudinary.com/dxldqvmej/image/upload/v1693389585/FlourishFables/um9colcxxcm48t9jletc.jpg',
                //     filename: 'FlourishFables/um9colcxxcm48t9jletc',
                // },
                // {
                //     //
                //     url: 'https://res.cloudinary.com/dxldqvmej/image/upload/v1693389585/FlourishFables/pdsmdsy9d1cbirkeadgq.jpg',
                //     filename: 'FlourishFables/pdsmdsy9d1cbirkeadgq',
                // }
            ]
        });
        await blog.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})
