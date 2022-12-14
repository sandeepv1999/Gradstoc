const express = require('express');
const app = express();
const productController = require('../../controller/visitor/ProductController');
const CheckUser = require('../../../middleware/CheckUser');

app.get('/my-uploaded-products' ,CheckUser.isValidUser, productController.myUploadedProducts);

app.get('/add-new-product' , CheckUser.isValidUser ,productController.addNewProduct);

app.post('/add-school' ,CheckUser.isValidUser, productController.addSchool);

app.post('/add-subject' , productController.addSubject);

app.get('/subject' , productController.getSubjectById);

app.post('/add-course' , productController.addCourse);

app.get('/course' , productController.getCourseByIds);

app.post('/add-tag' , productController.addTag);

app.post('/product-upload' , productController.productUpload);

app.get('/edit-product' , productController.getProductById);

app.post('/update-product' , productController.updateProductById);

app.post('/delete-product' , productController.deleteProductById);

app.post('/show-product' , productController.productVisiblity);

app.get('/product-detail' , productController.productDetails);

app.get('/cart/:productId' , productController.cartItems)

app.get('/my-cart' , productController.myCart);

app.get('/empty-cart' , productController.emptyCart);

app.get('/remove-item/:productId' , productController.removeItem);

app.get('/author', productController.getAuthor);

app.get('/addBookmark/:id', productController.addToBookmark);

app.get('/removeBookmark/:id', productController.removeBookmark);

app.post('/payment/save-order' , productController.createOrder);

app.post('/payment/paypal-checkout' , productController.paypalTransaction);

app.post('/payment/direct-checkout' , productController.walletTransaction);

app.get('/paypal/success' , productController.paypalSuccess);

app.get('/paypal/cancel' , productController.paypalCancel)

app.get('/thank-you' , productController.thankMessage);

module.exports = app