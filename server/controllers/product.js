const User = require('../models/User');
const Laptop = require('../models/Laptop');
const Checkout = require('../models/Checkout');
const isAuth = require('../middleware/is-auth');

const createNewProduct = async(req, res) => {
    if(await isAuth(req, res)){
        //Check for duplication
        const productWithSameModel = await Laptop.findOne({ model: req.body.model });
        const productWithSameUrl = await Laptop.findOne({ url: req.body.url });

        if(productWithSameModel || productWithSameUrl) {
            res.status(409).json(
            {
                message: 'A product already exist!',
            });
            return false;
        }
        
        const authorId = req.headers.userid;
        
        const { model, url, description, price } = req.body;

        if(price < 0.01) {
            res.status(400).json(
            {
                message: 'Price is invalid!',
            });
            return;
        }

        if(!url.startsWith('http') || description.length < 10 || model.length < 5)
        {
            res.status(400).json(
            {
                message: 'Product cannot be created!',
            });
            return;
        }

        const newProduct = { model, url, description, price, author: authorId };

        try{
            await Laptop.create(newProduct)                        
            
            res.status(200).json(
                {
                    message: 'Product successfully created!'                  
                }
            );
        }
        catch(err) {            
            res.status(500).json(
            {
                message: 'Product cannot be created!',
            });
        }
    }
}


const deleteProduct = async(req, res) => {
    const productId = req.params.id;

    if(await isAuth(req, res)){
        try {
            const laptop = await Laptop.findById(productId);
            
            if(laptop) {
                Laptop.deleteOne({
                    _id: productId
                }).then(() => {
                    res.status(200).json(
                    {
                        message: 'Product has been successfully deleted!',
                    });
                })
            }else {
                res.status(400).json(
                {
                    message: 'Cannot find the product!',
                });
            }
        }
        catch(err) {
            res.status(500).json(
            {
                message: 'Cannot find the product!',
            });
        }
    }
}

const checkout = async(req, res) => {
    if(await isAuth(req, res)){
        try {
            const { productName, quantity, author } = req.body;

            if(productName.length >= 5 && Number.isInteger(quantity) && (quantity >= 1 && quantity <= 10))
            {
                const laptop = await Laptop.findOne({ model: productName });                
                if(laptop) {
                    await Checkout.create({ productName, url: laptop.url, price: laptop.price, quantity, author });
                    res.status(200).json(
                    {
                        message: 'Checkout has been successfully created!',
                    });
                } else {
                    res.status(400).json(
                    {
                        message: 'Invalid Product!',
                    });
                }
            } else {
                res.status(400).json(
                {
                    message: 'Invalid Data!',
                });
            }
        }
        catch(err) {
            console.log(err);
            res.status(400).json(
            {
                message: 'Cannot checkout!',
            });
        }
    }
}

module.exports = {    
    createNewProduct,    
    deleteProduct,
    checkout
};