const { Op } = require('sequelize');
const Product = require('../models/Product');



exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
// GET /api/products/filter
exports.getFilteredProducts = async (req, res) => {
  try {
    const {
      category,
      search = '',
      sort = 'createdAt:desc',
      page = 1,
      limit = 6,
    } = req.query;

    const where = {};
    const validCategories = ['pet food', 'toys', 'clothes'];
    if (category && validCategories.includes(category.toLowerCase())) {
      where.category = category.toLowerCase();
    }

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const allowedSortFields = ['createdAt', 'price', 'name'];
    const allowedDirections = ['asc', 'desc'];

    let [sortField, sortDirection] = sort.split(':');
    sortField = allowedSortFields.includes(sortField) ? sortField : 'createdAt';
    sortDirection = allowedDirections.includes(sortDirection?.toLowerCase()) ? sortDirection.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.findAndCountAll({
      where,
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      totalItems: products.count,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
      products: products.rows,
    });

  } catch (err) {
  console.error('Error in getFilteredProducts:', err.message, err.stack);
  res.status(500).json({ error: err.message });
}

};

// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return res.status(404).json({ error: 'Product not found' });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch product' });
//   }
// };

exports.createProduct = async (req, res) => {
  const { name, description, price, discount, category } = req.body;
  try {
    const newProduct = await Product.create({ name, description, price, discount, category });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};


exports.updateProduct = async (req, res) => {
  const { name, description, price, discount, category } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ name, description, price, discount, category });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};