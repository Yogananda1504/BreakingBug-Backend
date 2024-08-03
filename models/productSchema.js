const mongoose = require("mongoose")

const productSchema =  mongoose.Schema(
    {
        productName: {
            type: String
        },
        price: {
            mrp: {
                type: Number
            },
            cost: {
                type: Number
            },
            discountPercent: {
                type: Number
            }
        },
        subcategory: {
            type: String
        },
        productImage: {
            type: String
        },
        category: {
            type: String
        },
        description: {
            type: String
        },
        tagline: {
            type: String
        },
        quantity: {
            type: Number,
            default: 45
        },
        reviews: [
            {
                rating: {
                    type: Number,
                },
                comment: {
                    type: String,
                },
                reviewer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "CUSTOMERS",
                },
                date: {
                    type: Date,
                    default: Date.now,//Bug 2 : here the type is Date so the default value should be the Date.now() but was initially Text which is not correct
                },
            },
        ],
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'seller',
        },
    }, { timestamps: true}); //Bug 4 : If you want Mongoose to automatically manage createdAt and updatedAt timestamps for your documents, you should set timestamps to true. Setting it to false disables this feature.

module.exports = mongoose.model("product", productSchema)//Bug 3 : The correct method to create a model in Mongoose is mongoose.model(), not mongoose.mongoose(). This was likely a typo.