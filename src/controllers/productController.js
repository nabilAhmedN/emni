const { Product } = require('../models');
const { Op } = require('sequelize');

exports.createProduct = async (req, res, next) => {
    try {
        const { title, price, description, category, stock } = req.body;
        const image = req.file ? req.file.path : null;

        const product = await Product.create({
            title,
            price,
            description,
            category,
            image,
            stock
        });

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllProducts = async (req, res, next) => {
    try {
        const { sortBy, order, category, minPrice, maxPrice } = req.query;

        const where = {};
        if (category) where.category = category;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        const orderClause = [];
        if (sortBy) {
            orderClause.push([sortBy, order === 'desc' ? 'DESC' : 'ASC']);
        }

        const products = await Product.findAll({
            where,
            order: orderClause
        });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path;
        }

        await product.update(updateData);

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        await product.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

exports.resetStock = async (req, res, next) => {
    try {
        await Product.update({ stock: 10 }, { where: {} });

        res.status(200).json({
            success: true,
            message: 'All products stock reset to 10'
        });
    } catch (error) {
        next(error);
    }
};

exports.filterProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, minRating } = req.query;

        const where = {};
        if (category) where.category = category;

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        if (minRating) {
            where.rating_rate = {
                [Op.gte]: minRating
            };
        }

        const products = await Product.findAll({ where });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

exports.searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            const error = new Error('Search query "q" is required');
            error.statusCode = 400;
            throw error;
        }

        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ]
            }
        });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};
