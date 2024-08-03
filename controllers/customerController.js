const bcrypt = require('bcrypt');
const Customer = require('../models/customerSchema.js');
const { createNewToken } = require('../utils/token.js');


const customerRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const customer = new Customer({
            ...req.body,
            password: hashedPass
        });

        const existingCustomerByEmail = await Customer.findOne({ email: req.body.email });

        if (existingCustomerByEmail) {
            // Bug: Changed from res.send to res.status(400).send for existing email
            return res.status(400).send({ message: 'Email already exists' }); // Status 400 for bad request
        } else {
            let result = await customer.save();
            result.password = undefined; // Remove password from response

            const token = createNewToken(result._id);

            result = {
                ...result._doc,
                token: token
            };

            // Bug: Changed from res.send to res.status(201).send for successful registration
            return res.status(201).send(result); // Status 201 for resource created
        }
    } catch (err) {
        // Bug: Improved error handling to return a generic server error message
        return res.status(500).json({ message: 'Internal server error', error: err.message }); // Status 500 for server error
    }
};


const customerLogIn = async (req, res) => {
    try {
        if (req.body.email && req.body.password) {
            let customer = await Customer.findOne({ email: req.body.email });
            if (!customer) {
                return res.status(404).send({ message: 'User not found' }); // Status 404 for not found
            }
            
            const validated = await bcrypt.compare(req.body.password, customer.password);
            if (validated) {
                customer.password = undefined; // Remove password from response

                const token = createNewToken(customer._id);

                customer = {
                    ...customer._doc,
                    token: token
                };

                // Bug: Changed from res.send to res.status(200).send for successful login
                return res.status(200).send(customer); // Status 200 for successful login
            } else {
                // Bug: Changed from res.send to res.status(400).send for invalid password
                return res.status(400).send({ message: 'Invalid password' }); // Status 400 for bad request
            }
        } else {
            // Bug: Changed from res.send to res.status(400).send for missing email/password
            return res.status(400).send({ message: 'Email and password are required' }); // Status 400 for bad request
        }
    } catch (err) {
        // Bug: Improved error handling to return a generic server error message
        return res.status(500).json({ message: 'Internal server error', error: err.message }); // Status 500 for server error
    }
};


const getCartDetail = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id); // Bug: Changed from findBy to findById
        if (customer) {
            // Bug: Changed from res.get to res.status(200).send for successful retrieval
            return res.status(200).send(customer.cartDetails); // Status 200 for successful retrieval
        } else {
            // Bug: Changed from res.send to res.status(404).send for customer not found
            return res.status(404).send({ message: 'No customer found' }); // Status 404 for not found
        }
    } catch (err) {
        // Bug: Improved error handling to return a generic server error message
        return res.status(500).json({ message: 'Internal server error', error: err.message }); // Status 500 for server error
    }
};


const cartUpdate = async (req, res) => {
    try {
        let customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Bug: Changed new: false to new: true to return the updated document
        if (customer) {
            // Bug: Changed from res.send to res.status(200).send for successful update
            return res.status(200).send(customer.cartDetails); // Status 200 for successful update
        } else {
            // Bug: Added handling for case when customer is not found
            return res.status(404).send({ message: 'No customer found' }); // Status 404 for not found
        }
    } catch (err) {
        // Bug: Improved error handling to return a generic server error message
        return res.status(500).json({ message: 'Internal server error', error: err.message }); // Status 500 for server error
    }
};

module.exports = {
    customerRegister,
    customerLogIn,
    getCartDetail,
    cartUpdate,
};
