const bcrypt = require('bcrypt');
const Seller = require('../models/sellerSchema.js');
const { createNewToken } = require('../utils/token.js');

// Registration function for sellers
const sellerRegister = async (req, res) => {
    try {
        const { password, email, shopName, ...rest } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const existingSellerByEmail = await Seller.findOne({ email });
        const existingShop = await Seller.findOne({ shopName });

        if (existingSellerByEmail) {
            return res.status(400).json({ message: 'Email already exists' }); // Bug: Added proper status code
        } else if (existingShop) {
            return res.status(400).json({ message: 'Shop name already exists' }); // Bug: Added proper status code
        } else {
            const seller = new Seller({
                ...rest,
                email,
                shopName,
                password: hashedPass
            });

            let result = await seller.save();
            result.password = undefined;

            const token = createNewToken(result._id);

            result = {
                ...result._doc,
                token
            };

            return res.status(201).json(result); // Bug: Changed response status to 201 for successful creation
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

// Login function for sellers
const sellerLogIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' }); // Bug: Added proper status code
    }

    try {
        let seller = await Seller.findOne({ email });
        if (seller) {
            const validated = await bcrypt.compare(password, seller.password);
            if (validated) {
                seller.password = undefined;

                const token = createNewToken(seller._id);

                seller = {
                    ...seller._doc,
                    token
                };

                return res.status(200).json(seller); // Bug: Changed response status to 200 for successful login
            } else {
                return res.status(401).json({ message: 'Invalid password' }); // Bug: Added proper status code
            }
        } else {
            return res.status(404).json({ message: 'User not found' }); // Bug: Added proper status code
        }
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message }); // Bug: Improved error response
    }
};

module.exports = { sellerRegister, sellerLogIn };
