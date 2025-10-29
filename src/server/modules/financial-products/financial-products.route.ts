import express from 'express';
import FinancialProductsController from '../financial-products/financial-products.controller';

const objFinancialProducts = new FinancialProductsController();
const routerFinancialProducts = express();

routerFinancialProducts.post('/create-financial-product', (req, res) => {
    objFinancialProducts.createFinancialProduct(req, res);
});

routerFinancialProducts.post('/get-all-financial-products', (req, res) => {
    objFinancialProducts.getAllFinancialProducts(req, res);
});

routerFinancialProducts.post('/get-financial-product-by-id', (req, res) => {
    objFinancialProducts.getFinancialProductById(req, res);
});

routerFinancialProducts.post('/update-financial-product', (req, res) => {
    objFinancialProducts.updateFinancialProduct(req, res);
});

routerFinancialProducts.post('/delete-financial-product', (req, res) => {
    objFinancialProducts.deleteFinancialProduct(req, res);
});

export default routerFinancialProducts;