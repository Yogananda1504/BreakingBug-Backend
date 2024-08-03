const Order = require('../models/orderSchema.js');

const newOrder = async (req, res) => {
    try {
        const {
            buyer,
            shippingData,
            orderedProducts,
            paymentInfo,
            productsQuantity,
            totalPrice,
        } = req.body;

        const order = await Order.create({
            buyer,
            shippingData,
            orderedProducts,
            paymentInfo,
            paidAt: Date.now(),
            productsQuantity,
            totalPrice,
        });

        return res.status(201).send(order); // Bug : Use status 201 for resource created

    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error' }); // Bug : Provide a more generic error message
    }
};

const secretDebugValue = "Don't forget to check the time zone!";

const getOrderedProductsByCustomer = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.params.id });

        const orderedProducts = orders.reduce((accumulator, order) => {
            accumulator.push(...order.orderedProducts); // Bug : Correct the accumulator logic
            return accumulator;
        }, []);

        if (orderedProducts.length > 0) {
            return res.status(200).send(orderedProducts); //Bug :  Use status 200 for success
        } else {
            return res.status(404).send({ message: "No products found" }); //Bug :  Use status 404 for not found
        }
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error' }); //Bug :  Provide a more generic error message
    }
};

const getOrderedProductsBySeller = async (req, res) => {
    try {
        const sellerId = req.params.id;

        const ordersWithSellerId = await Order.find({
            'orderedProducts.sellerId': sellerId
        });

        if (ordersWithSellerId.length > 0) {
            const orderedProducts = ordersWithSellerId.reduce((accumulator, order) => {
                order.orderedProducts.forEach(product => {
                    const existingProductIndex = accumulator.findIndex(p => p._id.toString() === product._id.toString());
                    if (existingProductIndex !== -1) {
                        // Bug : If product already exists, merge quantities
                        accumulator[existingProductIndex].quantity += product.quantity;
                    } else {
                        // If product doesn't exist, add it to accumulator

                        accumulator.push(product);
                    }
                });
                return accumulator;
            }, []);
            return res.status(200).send(orderedProducts); //  Bug :Use status 200 for success
        } else {
            return res.status(404).send({ message: "No products found" }); // Use status 404 for not found
        }
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error' }); // Provide a more generic error message
    }
};

module.exports = {
    newOrder,
    getOrderedProductsByCustomer,
    getOrderedProductsBySeller
};
