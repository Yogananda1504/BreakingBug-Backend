const Product = require("../models/productSchema");
const Customer = require("../models/customerSchema");

// Create a new product
const productCreate = async (req, res) => {
    try {
        const product = new Product(req.body);
        const result = await product.save();
        res.status(201).json(result); // Bug: Added proper status code for creation
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("seller", "shopName");
        if (products.length > 0) {
            res.status(200).json(products); // Bug: Added proper status code for successful retrieval
        } else {
            res.status(404).json({ message: "No products found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Get products by seller ID
const getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.params.id });
        if (products.length > 0) {
            res.status(200).json(products); // Bug: Added proper status code for successful retrieval
        } else {
            res.status(404).json({ message: "No products found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Get product details by product ID
const getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("seller", "shopName")
            .populate({
                path: "reviews.reviewer",
                model: "customer",
                select: "name"
            });

        if (product) {
            res.status(200).json(product); // Bug: Added proper status code for successful retrieval
        } else {
            res.status(404).json({ message: "No product found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Update product details by product ID
const updateProduct = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (result) {
            res.status(200).json(result); // Bug: Added proper status code for successful update
        } else {
            res.status(404).json({ message: "Product not found" }); // Bug: Changed status code to 404 if product not found
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Add review to a product
const addReview = async (req, res) => {
    try {
        const { rating, comment, reviewer } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" }); // Bug: Added proper status code if product not found
        }

        const existingReview = product.reviews.find(review => review.reviewer.toString() === reviewer);
        if (existingReview) {
            return res.status(400).json({ message: "You have already submitted a review for this product." }); // Bug: Added proper status code for duplicate review
        }

        product.reviews.push({
            rating,
            comment,
            reviewer,
            date: new Date(),
        });

        const updatedProduct = await product.save();
        res.status(201).json(updatedProduct); // Bug: Added proper status code for successful review addition
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Search products by various criteria
const searchProduct = async (req, res) => {
    try {
        const key = req.params.key;
        const products = await Product.find({
            $or: [
                { productName: { $regex: key, $options: 'i' } },
                { category: { $regex: key, $options: 'i' } },
                { subcategory: { $regex: key, $options: 'i' } }
            ]
        }).populate("seller", "shopName");

        if (products.length > 0) {
            res.status(200).json(products); // Bug: Added proper status code for successful search
        } else {
            res.status(404).json({ message: "No products found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Search products by category
const searchProductbyCategory = async (req, res) => {
    try {
        const key = req.params.key;
        const products = await Product.find({
            category: { $regex: key, $options: 'i' }
        }).populate("seller", "shopName");

        if (products.length > 0) {
            res.status(200).json(products); // Bug: Added proper status code for successful search
        } else {
            res.status(404).json({ message: "No products found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Search products by subcategory
const searchProductbySubCategory = async (req, res) => {
    try {
        const key = req.params.key;
        const products = await Product.find({
            subcategory: { $regex: key, $options: 'i' }
        }).populate("seller", "shopName");

        if (products.length > 0) {
            res.status(200).json(products); // Bug: Added proper status code for successful search
        } else {
            res.status(404).json({ message: "No products found" }); // Bug: Changed status code to 404 for no results
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" }); // Bug: Added proper status code if product not found
        }

        await Customer.updateMany(
            { "cartDetails._id": deletedProduct._id },
            { $pull: { cartDetails: { _id: deletedProduct._id } } }
        );

        res.status(200).json(deletedProduct); // Bug: Added proper status code for successful deletion
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Delete all products of a seller
const deleteProducts = async (req, res) => {
    try {
        const deletionResult = await Product.deleteMany({ seller: req.params.id });
        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            return res.status(404).json({ message: "No products found to delete" }); // Bug: Added proper status code for no products found
        }

        const deletedProducts = await Product.find({ seller: req.params.id });

        await Customer.updateMany(
            { "cartDetails._id": { $in: deletedProducts.map(product => product._id) } },
            { $pull: { cartDetails: { _id: { $in: deletedProducts.map(product => product._id) } } } }
        );

        res.status(200).json(deletionResult); // Bug: Added proper status code for successful deletion
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Delete a specific review from a product
const deleteProductReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" }); // Bug: Added proper status code if product not found
        }

        const updatedReviews = product.reviews.filter(review => review._id.toString() !== reviewId);

        product.reviews = updatedReviews;

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct); // Bug: Added proper status code for successful review deletion
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Delete all reviews from a product
const deleteAllProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" }); // Bug: Added proper status code if product not found
        }

        product.reviews = [];
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct); // Bug: Added proper status code for successful review deletion
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Get customers interested in a product
const getInterestedCustomers = async (req, res) => {
    try {
        const productId = req.params.id;
        const interestedCustomers = await Customer.find({ 'cartDetails._id': productId });

        const customerDetails = interestedCustomers.map(customer => {
            const cartItem = customer.cartDetails.find(item => item._id.toString() === productId);
            if (cartItem) {
                return {
                    customerName: customer.name,
                    customerID: customer._id,
                    quantity: cartItem.quantity,
                };
            }
            return null; // If cartItem is not found in this customer's cartDetails
        }).filter(item => item !== null); // Remove null values from the result

        if (customerDetails.length > 0) {
            res.status(200).json(customerDetails); // Bug: Added proper status code for successful retrieval
        } else {
            res.status(404).json({ message: 'No customers are interested in this product.' }); // Bug: Changed status code to 404 for no results
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

// Get products added to cart by customers of a seller
const getAddedToCartProducts = async (req, res) => {
    try {
        const sellerId = req.params.id;

        const customersWithSellerProduct = await Customer.find({
            'cartDetails.seller': sellerId
        });

        const productMap = new Map(); // Use a Map to aggregate products by ID
        customersWithSellerProduct.forEach(customer => {
            customer.cartDetails.forEach(cartItem => {
                if (cartItem.seller.toString() === sellerId) {
                    const productId = cartItem._id.toString();
                    if (productMap.has(productId)) {
                        // If product ID already exists, update the quantity
                        const existingProduct = productMap.get(productId);
                        existingProduct.quantity += cartItem.quantity;
                    } else {
                        // If product ID does not exist, add it to the Map
                        productMap.set(productId, {
                            productName: cartItem.productName,
                            quantity: cartItem.quantity,
                            category: cartItem.category,
                            subcategory: cartItem.subcategory,
                            productID: productId,
                        });
                    }
                }
            });
        });

        const productsInCart = Array.from(productMap.values());

        if (productsInCart.length > 0) {
            res.status(200).json(productsInCart); // Bug: Added proper status code for successful retrieval
        } else {
            res.status(404).json({ message: 'No products from this seller are added to cart by customers.' }); // Bug: Changed status code to 404 for no results
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Bug: Improved error response
    }
};

module.exports = {
    productCreate,
    getProducts,
    getSellerProducts,
    getProductDetail,
    updateProduct,
    addReview,
    searchProduct,
    searchProductbyCategory,
    searchProductbySubCategory,
    deleteProduct,
    deleteProducts,
    deleteProductReview,
    deleteAllProductReviews,
    getInterestedCustomers,
    getAddedToCartProducts,
};
