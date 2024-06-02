const { EntityOrderItems, EntityProducts } = require('../../../db.js');
const { Op } = require('sequelize');

const updateOrderItems = async (req, res) => {
    const { id } = req.params;
    const { idOrder, quantity, idProduct } = req.body;

    if (!idOrder || !quantity || !idProduct) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const orderItem = await EntityOrderItems.findByPk(id);
        if (orderItem) {
            await orderItem.update({ idOrder, quantity, idProduct });
            res.json(orderItem);
        } else {
            res.status(404).json({ error: 'Order item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating order item' });
    }
};

const deleteOrderItems = async (req, res) => {
    const { id } = req.params;
    try {
        const orderItem = await EntityOrderItems.findByPk(id);
        if (orderItem) {
            await orderItem.destroy();
            res.status(200).json({ message: 'Order item deleted successfully' });
        } else {
            res.status(404).json({ error: 'Order item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order item' });
    }
};

const getOrderItems = async (req, res) => {
    try {
        const orderItems = await EntityOrderItems.findAll({
            include: [{
                model: EntityProducts,
                as: 'entityProduct', // Aquí se cambia 'product' por 'entityProduct'
                attributes: ['nameProduct', 'priceProduct']
            }]
        });
        res.json(orderItems);
    } catch (error) {
        console.error('Error fetching order items:', error);  // Log del error para depuración
        res.status(500).json({ error: 'Error fetching order items' });
    }
};


const getOrderItemsByValue = async (req, res) => {
    const { idOrder, idProduct, nameProduct } = req.query;

    try {
        const whereConditions = {};
        if (idOrder) whereConditions.idOrder = idOrder;
        if (idProduct) whereConditions.idProduct = idProduct;
        if (nameProduct) {
            const products = await EntityProducts.findAll({
                where: { nameProduct },
                attributes: ['idProduct']
            });
            whereConditions.idProduct = products.map(product => product.idProduct);
        }

        const orderItems = await EntityOrderItems.findAll({
            where: whereConditions,
            include: [{
                model: EntityProducts,
                as: 'entityProduct',
                attributes: ['nameProduct', 'priceProduct']
            }]
        });
        res.json(orderItems);
    } catch (error) {
        console.error('Error fetching order items:', error);
        res.status(500).json({ error: 'Error fetching order items' });
    }
};

// Filtro por status
const getOrderItemsByStatus = async (req, res) => {
    const { status } = req.params;
    
    try {
        const orderItems = await EntityOrderItems.findAll({
            where: { status },
            include: [{
                model: EntityProducts,
                as: 'entityProduct',
                attributes: ['nameProduct', 'priceProduct']
            }]
        });
        res.json(orderItems);
    } catch (error) {
        console.error('Error fetching order items by status:', error);
        res.status(500).json({ error: 'Error fetching order items by status' });
    }
};

module.exports = {
    updateOrderItems,
    deleteOrderItems,
    getOrderItems,
    getOrderItemsByValue,
    getOrderItemsByStatus,
};

