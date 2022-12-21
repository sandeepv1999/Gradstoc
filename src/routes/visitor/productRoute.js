const express = require('express');
const app = express();
const productController = require('../../controller/visitor/ProductController');
const CheckUser = require('../../../middleware/CheckUser');
const userController = require('../../controller/visitor/UserController');

app.get('/my-uploaded-products' ,CheckUser.isValidUser, productController.myUploadedProducts);

app.get('/add-new-product' , CheckUser.isValidUser ,productController.addNewProduct);

app.post('/add-school' , productController.addSchool);

app.post('/add-subject' , productController.addSubject);

app.get('/subject' , productController.getSubjectById);

app.post('/add-course' , productController.addCourse);

app.get('/course' , productController.getCourseByIds);

app.post('/add-tag' , productController.addTag);

app.post('/product-upload' , productController.productUpload);

app.get('/edit-product' ,CheckUser.isValidUser ,productController.getProductById);

app.post('/update-product' , productController.updateProductById);

app.post('/delete-product' , productController.deleteProductById);

app.post('/show-product' , productController.productVisiblity);

app.get('/product-detail' , productController.productDetails);

app.get('/cart/:productId'  ,productController.cartItems)

app.get('/my-cart' , productController.myCart);

app.get('/empty-cart' , productController.emptyCart);

app.get('/remove-item/:productId' , productController.removeItem);

app.get('/author', productController.getAuthor);

app.get('/addBookmark/:id',CheckUser.isValidUser,productController.addToBookmark);

app.get('/removeBookmark/:id', productController.removeBookmark);

app.post('/payment/save-order' ,CheckUser.isValidUser, productController.createOrder);

app.post('/payment/paypal-checkout' , CheckUser.isValidUser,productController.paypalTransaction);

app.post('/payment/direct-checkout' ,CheckUser.isValidUser, productController.walletTransaction);

app.get('/paypal/success' ,CheckUser.isValidUser, productController.paypalSuccess);

app.get('/paypal/cancel' ,CheckUser.isValidUser, productController.paypalCancel)

app.get('/thank-you' ,CheckUser.isValidUser, productController.thankMessage);

app.post('/add-review' ,CheckUser.isValidUser, productController.review);


// app.get('*' ,CheckUser.isValidUser, userController.new);


module.exports = app