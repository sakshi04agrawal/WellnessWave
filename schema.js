const Joi = require('joi');
module.exports.blogSchema = Joi.object({
    blog: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        shortdescription: Joi.string().required(),
        // logo: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    })
})