const Laptop = require('../models/Laptop');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

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

        if((!url.startsWith('http') || description.length < 10 || model.length < 5 || model.length > 20) && authorId)
        {
            res.status(400).json(
            {
                message: 'Invalid data!',
            });
            return;
        }

        const newProduct = { model, url, description, price, author: authorId };

        try{
            await Laptop.create(newProduct)
            
            res.status(201).json(
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
    const userId = req.headers.userid; 

    if(await isAuth(req, res)){
        try {
            const laptop = await Laptop.findById(productId);            
            
            if(laptop && (laptop.author == userId || await isAdmin(req, res))) {
                Laptop.deleteOne({
                    _id: productId
                }).then(() => {
                    res.status(200).json(
                    {
                        message: 'Product has been successfully deleted!',
                    });
                })
            } else if(laptop.author !== userId) {
                res.status(401).json(
                {
                    message: 'Not authorized to delete the product!',
                });
            }else {
                res.status(400).json(
                {
                    message: 'Cannot find the product!',
                });
            }
        }
        catch(err) {
            res.status(400).json(
            {
                message: 'Cannot find the product!',
            });
        }
    }
}

const getLaptops = async(req, res) => {
    try {
        const laptops = await Laptop.find();            
        
        res.status(200).json(
        {
            message: 'Laptops!',
            laptops
        });
    }
    catch(err) {
        res.status(400).json(
        {
            message: 'Cannot find any products!',
        });
    }    
}

const getLaptop = async(req, res) => {        
    try {
        const laptop = await Laptop.findById(req.params.id);
        res.status(200).json(
        {
            message: 'Laptop!',
            laptop
        });
    }
    catch(err) {
        res.status(400).json(
        {
            message: 'Cannot find product with this id!',
        });
    }    
}

module.exports = {
    createNewProduct,
    deleteProduct,
    getLaptops,
    getLaptop
};