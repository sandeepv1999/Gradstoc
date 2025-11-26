const express = require("express");
const app = express();
const User = require("../../model/user");
const School = require("../../model/school");
const Subject = require("../../model/subject");
const Course = require("../../model/course");
const Product = require("../../model/product");
const Tag = require("../../model/tag");
const ProductView = require("../../model/product_view");
const Cart = require("../../model/cart");
const Bookmark = require("../../model/bookmark");
const mongoose = require("mongoose");
const Order = require("../../model/order");
const OrderDetails = require("../../model/orderDetail");
const Admin_earning = require("../../model/admin_earning");
const Wallets = require("../../model/wallet");
const stripe = require("stripe")(process.env.SECRET_KEY);
const AuthController = require("./AuthController");
const transaction = require("../../../utils/transaction");
const createPaypal = require("../../../config/paypal");
const { v4 } = require("uuid");
const Review = require("../../model/review");

class ProductController {
  constructor() {}

  //*************** GET MY UPLOAD PAGE ****************

  myUploadedProducts = async (req, res) => {
    try {
      let productType = req.query.type;
      let page = 1;
      var whereClause = [];
      if (req.query && req.query.page) {
        page = req.query.page;
      }
      let limit = 3;
      let skip = (page - 1) * limit;
      let isUserLoggedIn = false;
      let userData, loginId;
      let start_date, end_date, search_school;
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        loginId = mongoose.Types.ObjectId(req.session.isCustomerLoggedIn);
        userData = await User.findOne({ _id: loginId });
      }
      let schoolData = await School.find({});
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
        schoolData,
        productType,
        currentPage: page,
        limit,
        skip,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      if (
        req.query.start_date !== "" &&
        req.query.end_date !== "" &&
        req.query.end_date != undefined &&
        req.query.end_date != " undefined" &&
        req.query.start_date != undefined &&
        req.query.start_date != "undefined"
      ) {
        start_date = req.query.start_date;
        end_date = req.query.end_date;
        var obj = {
          createdAt: {
            $gte: new Date(`${start_date}T00:00:00.00Z`),
            $lte: new Date(`${end_date}T00:00:00.00Z`),
          },
        };
        whereClause.push(obj);
      }
      if (req.query.search_school && req.query.search_school !== "") {
        search_school = req.query.search_school;
        var scl_id = mongoose.Types.ObjectId(search_school);
        whereClause.push({ scl_id: scl_id });
      }
      whereClause.push({ user_id: loginId });
      whereClause.push({ type: productType });
      whereClause.push({ isDeleted: "0" });
      let bookCount = await Product.count({ $and: whereClause });
      let bookData = await Product.aggregate([
        {
          $match: {
            $and: whereClause,
          },
        },
        {
          $lookup: {
            from: "tags",
            let: { tagId: "$tag_id" },
            pipeline: [{ $match: { $expr: { $in: ["$_id", "$$tagId"] } } }],
            as: "tags",
          },
        },
        {
          $lookup: {
            from: "reviews",
            let: { proId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$product_id", "$$proId"] } } },
              { $project: { rating: 1, _id: 0 } },
            ],
            as: "reviews",
          },
        },
      ])
        .limit(limit)
        .skip(skip);
      let totalPages = Math.ceil(bookCount / limit);
      let remaining = bookCount - skip + skip;
      data.start_date = start_date;
      data.end_date = end_date;
      data.search_school = search_school;
      data.bookData = bookData;
      data.totalPages = totalPages;
      data.remaining = remaining;
      data.bookCount = bookCount;
      res.render("user/my-upload-books", data);
    } catch (error) {
      console.log("my upload product error", error);
      res.send({ messsage: error.message });
    }
  };

  //*************** GET ADD BOOK PAGE ****************

  addNewProduct = async (req, res) => {
    try {
      let type = req.query.type; // book = 0 , document = 1
      let isUserLoggedIn = false;
      let userData = "";
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        let loginId = req.session.isCustomerLoggedIn;
        loginId = mongoose.Types.ObjectId(loginId);
        userData = await User.findOne({ _id: loginId });
      }
      let school = await School.find({});
      let tags = await Tag.find({});
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
        school,
        tags,
        type,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      res.render("user/add-new-book", data);
    } catch (error) {
      console.log("add books error", error);
      res.send({ messsage: error.message });
    }
  };

  //*************** ADD SCHOOL ****************

  addSchool = async (req, res) => {
    try {
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      const body = req.body;
      const image = req.files.school_logo;
      let logo = await AuthController.saveImageDirectorys(image);
      let schoolData = {
        name: body.school_name,
        description: body.school_description,
        logo: logo,
        user_id: userId,
      };
      await School.create(schoolData);
      let school = await School.find({});
      res.json({ success: true, school });
    } catch (error) {
      res.send({ message: error.message });
    }
  };

  //*************** GET SUBJECT BY SCL_ID ****************

  getSubjectById = async (req, res) => {
    try {
      let scl_id = req.query.scl_id;
      scl_id = mongoose.Types.ObjectId(scl_id);
      let scl_sub = await Subject.find({ school_id: scl_id });
      if (scl_sub.length > 0) {
        res.json({ success: true, scl_sub });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };

  //*************** ADD SUBJECT BY SCL_ID ****************

  addSubject = async (req, res) => {
    try {
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      const body = req.body;
      let scl_id = body.school_id;
      scl_id = mongoose.Types.ObjectId(scl_id);
      let subjectData = {
        name: body.subject_name,
        description: body.subject_description,
        user_id: userId,
        school_id: scl_id,
      };
      await Subject.create(subjectData);
      res.json({ success: true });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };

  //*************** GET COURSE BY SCL AND SUB_ID ****************

  getCourseByIds = async (req, res) => {
    try {
      let { scl_id, sub_id } = req.query;
      scl_id = mongoose.Types.ObjectId(scl_id);
      sub_id = mongoose.Types.ObjectId(sub_id);
      let courses = await Course.find({
        school_id: scl_id,
        subject_id: sub_id,
      });
      if (courses.length > 0) {
        res.json({ success: true, courses });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log("get course ", error);
      res.send({ success: false, message: error.message });
    }
  };

  //*************** ADD COURSE WITH SCL AND SUB ID ****************

  addCourse = async (req, res) => {
    try {
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      const body = req.body;
      let school_id = body.school_id;
      school_id = mongoose.Types.ObjectId(school_id);
      let subject_id = body.subject_id;
      subject_id = mongoose.Types.ObjectId(subject_id);
      let courseData = {
        name: body.course_name,
        description: body.course_description,
        user_id: userId,
        school_id,
        subject_id,
      };
      let course = await Course.create(courseData);
      res.json({ success: true, course });
    } catch (error) {
      console.log("add course ", error);
      res.send({ message: error.message });
    }
  };

  //*************** ADD TAGS ****************

  addTag = async (req, res) => {
    try {
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      const body = req.body;
      let tags = {
        name: body.tag,
        user_id: userId,
      };
      await Tag.create(tags);
      let tag = await Tag.find();
      res.json({ success: true, tag });
    } catch (error) {
      res.send({ message: error.message });
    }
  };

  //*************** BOOK UPLOAD ****************

  productUpload = async (req, res) => {
    try {
      const body = req.body;
      const type = req.body.type;
      let tags = [];
      const { book_image, sample_file, main_file } = req.files;
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      let scl_id = mongoose.Types.ObjectId(body.school);
      let sub_id = mongoose.Types.ObjectId(body.subject);
      let course_id = mongoose.Types.ObjectId(body.course);
      let tag_id = body.tags;
      let mainFile = await AuthController.saveImageDirectorys(main_file);
      let bookImg = await AuthController.saveImageDirectorys(book_image);
      let samp_file = await AuthController.saveImageDirectorys(sample_file);
      let currentDate = new Date()
        .toLocaleDateString(`fr-CA`)
        .split("/")
        .join("-");
      let book = {
        title: body.title,
        user_id: userId,
        scl_id: scl_id,
        sub_id: sub_id,
        course_id: course_id,
        main_file: mainFile,
        sample_file: samp_file,
        image: bookImg,
        price: body.price,
        type: body.type,
        short_description: body.short_description,
        full_description: body.full_description,
        createdAt: new Date(`${currentDate}T00:00:00.00Z`),
      };
      if (Array.isArray(tag_id)) {
        var tag = tag_id.map((e) => {
          return mongoose.Types.ObjectId(e);
        });
        console.log("1");
        book.tag_id = tag;
      } else {
        tag_id = mongoose.Types.ObjectId(tag_id);
        tags.push(tag_id);
        book.tag_id = tags;
      }
      await Product.create(book);
      req.session.status = "success";
      req.session.message = "Book successfully uploaded";
      res.redirect(`/my-uploaded-products?type=${type}`);
    } catch (error) {
      res.send({ message: error.message });
    }
  };

  //*************** GET PRODUCT BY ID ****************

  getProductById = async (req, res) => {
    try {
      let userData,
        isUserLoggedIn = false;
      let productId = req.query.productId;
      productId = mongoose.Types.ObjectId(productId);
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        var loginId = mongoose.Types.ObjectId(req.session.isCustomerLoggedIn);
        userData = await User.findOne({ _id: loginId });
      }
      let school = await School.find({});
      let tags = await Tag.find({});
      let product = await Product.aggregate([
        { $match: { _id: productId } },
        {
          $lookup: {
            from: "subjects",
            localField: "sub_id",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course_id",
            foreignField: "_id",
            as: "course",
          },
        },
      ]);
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
        product: product[0],
        school,
        tags,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      res.render("user/edit-product", data);
    } catch (error) {
      console.log("get product by id ", error);
      res.send({ message: error.message });
    }
  };

  //*************** UPDATE PRODUCT BY ID ****************

  updateProductById = async (req, res) => {
    try {
      const body = req.body;
      let tags = [];
      let productId = body.productId;
      productId = mongoose.Types.ObjectId(productId);
      let userId = req.session.isCustomerLoggedIn;
      userId = mongoose.Types.ObjectId(userId);
      let product = await Product.findById({ _id: productId });
      let currentDate = new Date()
        .toLocaleDateString(`fr-CA`)
        .split("/")
        .join("-");
      let productData = {
        title: body.title ? body.title : product.title,
        user_id: userId,
        scl_id: mongoose.Types.ObjectId(body.school),
        sub_id: mongoose.Types.ObjectId(body.subject),
        course_id: mongoose.Types.ObjectId(body.course),
        price: body.price ? body.price : product.price,
        type: body.type ? body.type : product.type,
        short_description: body.short_description
          ? body.short_description
          : product.short_description,
        full_description: body.full_description
          ? body.full_description
          : product.full_description,
        createdAt: product.createdAt,
        updatedAt: new Date(`${currentDate}T00:00:00.00Z`),
      };
      let tag_ids = body.tags;
      console.log("tag_ids", tag_ids);
      if (tag_ids === undefined) {
        productData.tag_id = product.tag_id.map((e) => {
          return mongoose.Types.ObjectId(e);
        });
      } else {
        if (Array.isArray(tag_ids)) {
          var tag = tag_ids.map((e) => {
            return mongoose.Types.ObjectId(e);
          });
          productData.tag_id = tag;
        } else {
          tag_ids = mongoose.Types.ObjectId(tag_ids);
          tags.push(tag_ids);
          productData.tag_id = tags;
        }
      }
      console.log("productData.tag_id", productData.tag_id);
      if (req.files && req.files.main_file) {
        let mainFile = req.files.main_file;
        let main_file = await AuthController.saveImageDirectorys(mainFile);
        productData.main_file = main_file;
      }
      if (req.files && req.files.product_image) {
        let productImage = req.files.product_image;
        let image = await AuthController.saveImageDirectorys(productImage);
        productData.image = image;
      }
      if (req.files && req.files.sample_file) {
        let sampleFile = req.files.sample_file;
        let sample_file = await AuthController.saveImageDirectorys(sampleFile);
        productData.sample_file = sample_file;
      }
      let resp = await Product.updateOne({ _id: productId }, productData);
      req.session.status = "success";
      req.session.message =
        product.type == "0"
          ? "Book successfully Updated"
          : "Document successfully Updated";
      res.redirect(`/my-uploaded-products?type=${product.type}`);
    } catch (error) {
      console.log("update product by id ", error);
      res.send({ message: error.message });
    }
  };

  //*************** DELETE PRODUCT BY ID ****************

  deleteProductById = async (req, res) => {
    try {
      let productId = req.body.product_id;
      productId = mongoose.Types.ObjectId(productId);

      let product = await Product.updateOne(
        { _id: productId },
        { isDeleted: "1" }
      );
      if (product.acknowledged) {
        let data = {
          success: true,
        };
        res.json(data);
      }
    } catch (error) {
      console.log("delete product by id ", error);
      res.send({ message: error.message });
    }
  };

  //*************** Product Visiblity ****************

  productVisiblity = async (req, res) => {
    try {
      let data = {};
      let { bookId, checkValue } = req.body;
      bookId = mongoose.Types.ObjectId(bookId);
      let resp = await Product.updateOne(
        { _id: bookId },
        { visiblity: checkValue }
      );
      data.success = true;
      data.resp = resp;
      res.json(data);
    } catch (error) {
      res.send({ message: error.message });
    }
  };

  //*************** PRODUCTS DETAILS ****************

  productDetails = async (req, res) => {
    try {
      let productId = req.query.productId;
      let avg = req.query.avg;
      avg = avg == "" ? (avg = 0) : avg;
      let isUserLoggedIn = false;
      let userData = "";
      let cartItems = [];
      var isBookmark = 0;
      productId = mongoose.Types.ObjectId(productId);
      let bookData = await Product.aggregate([
        { $match: { _id: productId } },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
      ]);

      let reviews = await Review.aggregate([
        { $match: { product_id: productId } },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "review_user",
          },
        },
      ]);
      if (bookData.length > 0) {
        var tags = await Tag.find({ _id: { $in: bookData[0].tag_id } });
      } else {
        res.redirect("/my-cart");
      }
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        let loginId = req.session.isCustomerLoggedIn;
        loginId = mongoose.Types.ObjectId(loginId);
        userData = await User.findOne({ _id: loginId });
        var alreadyView = await ProductView.findOne({
          $and: [{ user_id: loginId }, { product_id: productId }],
        });
        if (!alreadyView) {
          let viewData = {
            user_id: loginId,
            product_id: productId,
          };
          await ProductView.create(viewData);
        }
        let userProducts = await Cart.find({ user_id: loginId }).select(
          "product_id"
        );
        if (userProducts.length > 0) {
          for (let i = 0; i < userProducts.length; i++) {
            cartItems.push(userProducts[i].product_id.toString());
          }
        }
        var productData = await Bookmark.findOne({
          user_id: loginId,
          product_id: productId,
        });
        if (productData) {
          isBookmark = 1;
        }
      }
      if (req.cookies.cartItems && req.cookies.cartItems.length > 0) {
        cartItems = req.cookies.cartItems;
      }
      let viewCount = await ProductView.count({ product_id: productId });
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
        isBookmark,
        bookData: bookData[0],
        reviews,
        viewCount,
        tags,
        cartItems,
        avg,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      res.render("user/product-details", data);
    } catch (error) {
      res.send({ message: error.message });
    }
  };

  //*************** ADD CART ITEMS ****************

  cartItems = async (req, res) => {
    try {
      const productId = req.params.productId;
      let productIds = [];
      if (!req.session.isCustomerLoggedIn) {
        if (req.cookies.cartItems) {
          productIds = req.cookies.cartItems;
          productIds.push(productId);
        } else {
          productIds.push(productId);
        }
        productIds = Array.from(new Set(productIds));
        res.cookie("cartItems", productIds);
        res.json({ success: true });
      } else {
        let loginId = req.session.isCustomerLoggedIn;
        let product = await Cart.findOne({
          user_id: loginId,
          product_id: productId,
        });
        console.log("product", product);
        if (!product) {
          await Cart.create({ user_id: loginId, product_id: productId });
        }
        res.json({ success: true });
      }
    } catch (error) {
      console.log("get update profile error", error);
    }
  };

  //*************** ADD CART ITEMS ****************

  myCart = async (req, res) => {
    try {
      let isUserLoggedIn = false;
      let userData = "";
      let success = 0;
      let amount = 0;
      let serviceCharge = 0;
      let totalAmount = 0;
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        var loginId = req.session.isCustomerLoggedIn;
        loginId = mongoose.Types.ObjectId(loginId);
        userData = await User.findOne({ _id: loginId });
      }
      let grandTotal = 0;
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
        totalAmount,
        success,
        grandTotal,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      global.productCount = 0;
      if (req.cookies.cartItems && !req.session.isCustomerLoggedIn) {
        let cartItem = req.cookies.cartItems;
        let productIds = cartItem.map((e) => {
          return mongoose.Types.ObjectId(e);
        });
        let productCount = await Product.count({
          _id: { $in: productIds },
        });
        let products = await Product.find({
          _id: { $in: productIds },
        });
        if (products.length > 0) {
          for (let i = 0; i < products.length; i++) {
            amount = parseFloat(amount) + parseFloat(products[i].price);
          }
          serviceCharge = parseFloat(amount) * parseFloat(0.07);
          data.totalAmount = parseFloat(amount).toFixed(2);
          grandTotal = parseFloat(amount) + parseFloat(serviceCharge);
        }
        data.success = 1;
        data.productCounts = productCount;
        global.productCount = productCount;
        data.products = products;
        data.serviceCharge = serviceCharge.toFixed(2);
        data.grandTotal = grandTotal.toFixed(2);
      } else {
        if (req.session.isCustomerLoggedIn) {
          let productCount = await Cart.count({
            user_id: loginId,
          });
          let productData = await Cart.aggregate([
            {
              $match: { user_id: loginId },
            },
            {
              $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "items",
              },
            },
          ]);
          var newProducts = [];
          if (productData.length > 0) {
            for (let i = 0; i < productData.length; i++) {
              newProducts.push(productData[i].items[0]);
              amount = amount + parseFloat(productData[i].items[0].price);
            }
            serviceCharge = parseFloat(amount) * parseFloat(0.07);
            data.success = 1;
            grandTotal = parseFloat(amount) + parseFloat(serviceCharge);
          }
          let walletamount = await Wallets.findOne({ user_id: loginId });
          data.walletamount = walletamount.balance;
          data.productCounts = productCount;
          global.productCount = productCount;
          data.products = newProducts;
          data.totalAmount = amount;
          data.serviceCharge = serviceCharge.toFixed(2);
          data.grandTotal = grandTotal.toFixed(2);
        }
      }
      res.render("visitor/myCart", data);
    } catch (error) {
      console.log("my cart page error", error);
    }
  };

  //*************** Empty cart ****************

  emptyCart = async (req, res) => {
    try {
      if (!req.session.isCustomerLoggedIn) {
        res.clearCookie("cartItems");
        global.productCount = 0;
        res.redirect("/my-cart");
      } else {
        let loginId = req.session.isCustomerLoggedIn;
        let product = await Cart.deleteMany({ user_id: loginId });
        console.log("product", product);
        global.productCount = 0;
        res.redirect("/my-cart");
      }
    } catch (error) {
      console.log("empty cart  error", error);
    }
  };

  //*************** Remove single item ****************

  removeItem = async (req, res) => {
    try {
      let product_id = req.params.productId;
      var productCount;
      if (!req.session.isCustomerLoggedIn) {
        let cartItems = req.cookies.cartItems;
        let position = cartItems.indexOf(product_id);
        delete cartItems[position];
        cartItems = cartItems.filter(Boolean);
        res.cookie("cartItems", cartItems);
        if (req.cookies.cartItems.length == 1) {
          res.clearCookie("cartItems");
          productCount = 0;
          global.productCount = productCount;
        }
        req.session.status = "success";
        req.session.message = "Item succesfully removed from your cart";
        res.redirect("/my-cart");
      } else {
        let loginId = req.session.isCustomerLoggedIn;
        await Cart.deleteOne({ user_id: loginId });
        req.session.status = "success";
        req.session.message = "Item succesfully removed from your cart";
        res.redirect("/my-cart");
      }
    } catch (error) {
      console.log("remove cart error", error);
    }
  };

  //*************** GET BOOK AUTHOR ****************

  getAuthor = async (req, res) => {
    try {
      let user_id = req.query.userId;
      user_id = mongoose.Types.ObjectId(user_id);
      let isUserLoggedIn = false;
      let userData = "";
      if (req.session.isCustomerLoggedIn) {
        isUserLoggedIn = true;
        var loginId = req.session.isCustomerLoggedIn;
        loginId = mongoose.Types.ObjectId(loginId);
        userData = await User.findOne({ _id: loginId });
        let count = await Cart.count({ user_id: loginId });
        global.productCount = count;
      }
      if (req.cookies.cartItems && !isUserLoggedIn) {
        global.productCount = req.cookies.cartItems.length;
      }
      let data = {
        status: "",
        message: "",
        isUserLoggedIn,
        userData,
      };
      if (req.session.status && req.session.message) {
        data.status = req.session.status;
        data.message = req.session.message;
        delete req.session.status, req.session.message;
      }
      let user = await User.findOne({ _id: user_id });
      let uploadCount = await Product.count({ user_id: user_id });
      data.user = user;
      data.count = uploadCount;
      res.render("user/authorProfile", data);
    } catch (error) {
      console.log("remove cart error", error);
    }
  };

  //*************** ADD ITEM INTO BOOKMARK ****************

  addToBookmark = async (req, res) => {
    try {
      let product_id = req.params.id;
      let user_id = req.session.isCustomerLoggedIn;
      user_id = mongoose.Types.ObjectId(user_id);
      let user = await Bookmark.findOne({
        user_id: user_id,
        product_id: product_id,
      });
      if (!user) {
        await Bookmark.create({ user_id: user_id, product_id: product_id });
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log("add to bookmark ", error);
      res.json({ success: false });
    }
  };

  //*************** REMOVE ITEM FROM BOOKMARK ****************

  removeBookmark = async (req, res) => {
    try {
      let product_id = req.params.id;
      let user_id = req.session.isCustomerLoggedIn;
      user_id = mongoose.Types.ObjectId(user_id);
      await Bookmark.deleteOne({ user_id: user_id, product_id: product_id });
      res.json({ success: true });
    } catch (error) {
      console.log("add to bookmark ", error);
      res.json({ success: false });
    }
  };

  //*************** CREATE ORDER BY STRIPE  ****************

  createOrder = async (req, res) => {
    try {
      let loginId = req.session.isCustomerLoggedIn;
      loginId = mongoose.Types.ObjectId(loginId);
      const body = req.body;
      let product_ids = await Cart.aggregate([
        {
          $match: { user_id: loginId },
        },
        {
          $lookup: {
            from: "products",
            let: { productId: "$product_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$productId", "$_id"] },
                },
              },
              { $project: { price: 1, _id: 0, user_id: 1 } },
            ],
            as: "product",
          },
        },
      ]);
      let orderId = "ORDER000" + Math.floor(Math.random() * 100) + Date.now();
      let currentDate = new Date()
        .toLocaleDateString(`fr-CA`)
        .split("/")
        .join("-");
      let orderData = {
        order_id: orderId,
        user_id: loginId,
        subtotal: parseFloat(body.subtotal),
        total: parseFloat(body.total),
        wallet_discount: parseFloat(body.wallet_discount),
        final_pay: parseFloat(body.final_pay),
        use_wallet: body.isUseWallet,
        payment_type: "stripe",
        payment_status: "incomplete",
        createdAt: new Date(`${currentDate}T00:00:00.00Z`),
      };
      let order = await Order.create(orderData);
      let seller_ids = [];
      if (order) {
        for (let i = 0; i < product_ids.length; i++) {
          let obj = {
            order_id: order.order_id,
            user_id: order.user_id,
            product_id: mongoose.Types.ObjectId(product_ids[i].product_id),
            quantity: "1",
            price: parseFloat(product_ids[i].product[0].price),
          };
          seller_ids.push({
            id: product_ids[i].product[0].user_id,
            price: product_ids[i].product[0].price,
          });
          let orderDetails = await OrderDetails.create(obj);
          console.log("orderDetails", orderDetails);
        }
        console.log("seller_ids", seller_ids);
        await Cart.deleteMany({ user_id: loginId });
      }
      const paymentResult = await stripe.paymentIntents.create({
        amount: parseFloat(body.final_pay) * 100,
        currency: "INR",
        payment_method_types: ["card"],
      });
      let stripeDetails = await stripe.paymentIntents.confirm(
        paymentResult.id,
        { payment_method: "pm_card_visa" }
      );
      // const customer = await stripe.customers.create({
      //     email: body.stripeEmail,
      //     source:body.stripeToken,
      // });
      if (stripeDetails.status) {
        stripeDetails.stripeEmail = body.stripeEmail;
        await Order.updateOne(
          { _id: order._id },
          {
            payment_status: stripeDetails.status,
            transaction_id: stripeDetails.id,
            payment_history: stripeDetails,
          }
        );
      }
      if ((stripeDetails.status = "succeeded")) {
        let admin_earning = parseFloat(order.subtotal) * parseFloat(0.17);
        let adminData = {
          user_id: order.user_id,
          order_id: order.order_id,
          order_amount: order.total,
          saving_amount: order.final_pay,
          earning: admin_earning.toFixed(2),
          type: "stripe",
        };
        await Admin_earning.create(adminData);
        for (let i = 0; i < seller_ids.length; i++) {
          let profit = parseFloat(seller_ids[i].price) * 0.9;

          await transaction.creditAccount(
            profit,
            seller_ids[i].id,
            loginId,
            stripeDetails.id
          );
        }
        if (body.isUseWallet == 1) {
          await transaction.debitAccount(
            body.wallet_discount,
            loginId,
            stripeDetails.id
          );
        }
      } else {
        req.session.status = "error";
        req.session.message = "something went wrong , please try again";
      }
      req.session.status = "success";
      req.session.message = "Hurray your order has been placed succefully";
      res.redirect(`/thank-you?order_id=${orderId}`);
    } catch (error) {
      console.log("Stripe payment error", error);
    }
  };

  //*************** CREATE ORDER BY  PAYPAL  ****************

  paypalTransaction = async (req, res) => {
    try {
      let loginId = req.session.isCustomerLoggedIn;
      loginId = mongoose.Types.ObjectId(loginId);
      const body = req.body;
      let product_ids = await Cart.aggregate([
        {
          $match: { user_id: loginId },
        },
        {
          $project: { _id: 1, product_id: 1 },
        },
        {
          $lookup: {
            from: "products",
            let: { productId: "$product_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$productId", "$_id"] },
                },
              },
              { $project: { price: 1, _id: 0 } },
            ],
            as: "product",
          },
        },
      ]);
      let orderId = "ORDER000" + Math.floor(Math.random() * 100) + Date.now();
      var payment = {
        intent: "authorize",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `http://localhost:3300/paypal/success?amount=${body.final_pay}&order_id=${orderId}&use_wallet=${body.use_wallet}`,
          cancel_url: `http://localhost:3300/paypal/cancel?order_id=${orderId}`,
        },
        transactions: [
          {
            amount: {
              total: body.final_pay,
              currency: "USD", // paypal does not accept indian currency
            },
            description: "you purchase a book/document",
          },
        ],
      };
      const transaction = await createPaypal.createPayment(payment);
      let currentDate = new Date()
        .toLocaleDateString(`fr-CA`)
        .split("/")
        .join("-");
      if (transaction) {
        let orderData = {
          order_id: orderId,
          user_id: loginId,
          subtotal: parseFloat(body.subtotal),
          total: parseFloat(body.total),
          wallet_discount: parseFloat(body.wallet_discount),
          final_pay: parseFloat(body.final_pay),
          use_wallet: body.use_wallet,
          payment_type: "paypal",
          payment_status: "incomplete",
          createdAt: new Date(`${currentDate}T00:00:00.00Z`),
        };
        let order = await Order.create(orderData);
        if (order) {
          for (let i = 0; i < product_ids.length; i++) {
            let obj = {
              order_id: order.order_id,
              user_id: order.user_id,
              product_id: mongoose.Types.ObjectId(product_ids[i].product_id),
              quantity: "1",
              price: parseFloat(product_ids[i].product[0].price),
            };
            // seller_ids.push({ id: product_ids[i].product[0].user_id, price: product_ids[i].product[0].price });
            let orderDetails = await OrderDetails.create(obj);
          }
          await Cart.deleteMany({ user_id: loginId });
        }
        var links = transaction.links;
        var counter = links.length;
        while (counter--) {
          if (links[counter].method == "REDIRECT") {
            // redirect to paypal where user approves the transaction
            res.json({ success: true, paypal_link: links[counter].href });
          }
        }
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log("paypal transaction error", error);
      res.send({ message: error });
    }
  };

  //*************** PAYPAL SUCCESS TRANSACTION  ****************

  paypalSuccess = async (req, res) => {
    try {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      const amount = req.query.amount;
      const order_id = req.query.order_id;
      const use_wallet = req.query.use_wallet;
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: amount,
            },
          },
        ],
      };
      let payment = await createPaypal.paymentExecute(
        paymentId,
        execute_payment_json
      );
      if (payment) {
        let order = await Order.findOne({ order_id });
        await Order.updateOne(
          { _id: order._id },
          {
            payment_status: "succeeded",
            transaction_id: payment.cart,
            payment_history: payment,
          }
        );
        let admin_earning = parseFloat(order.subtotal) * parseFloat(0.17);
        let adminData = {
          user_id: order.user_id,
          order_id: order.order_id,
          order_amount: order.total,
          saving_amount: order.final_pay,
          earning: admin_earning.toFixed(2),
          type: "paypal",
        };
        await Admin_earning.create(adminData);
        let saller = await OrderDetails.aggregate([
          // fetch selected data from both table
          {
            $match: { order_id: order_id },
          },
          {
            $project: { _id: 1, product_id: 1 },
          },
          {
            $lookup: {
              from: "products",
              let: { productId: "$product_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$$productId", "$_id"] },
                  },
                },
                { $project: { price: 1, _id: 0, user_id: 1 } },
              ],
              as: "product",
            },
          },
        ]);
        let seller_ids = [];
        for (let i = 0; i < saller.length; i++) {
          seller_ids.push({
            id: saller[i].product[0].user_id,
            price: saller[i].product[0].price,
          });
        }
        for (let i = 0; i < seller_ids.length; i++) {
          let profit = parseFloat(seller_ids[i].price) * 0.9;
          await transaction.creditAccount(
            profit,
            seller_ids[i].id,
            order.user_id,
            payment.cart
          );
        }
        if (use_wallet == 1) {
          await transaction.debitAccount(
            order.wallet_discount,
            order.user_id,
            payment.cart
          );
        }
        res.redirect(`/thank-you?order_id=${order_id}`);
      }
    } catch (error) {
      console.log("pyapal success error", error);
    }
  };

  paypalCancel = async (req, res) => {
    try {
      const order_id = req.query.order_id;
      let order = Order.findOne({ order_id });
      await Order.updateOne(
        { _id: order._id },
        {
          payment_status: "incomplete",
          transaction_id: "---",
        }
      );
      res.redirect(`/thank-you?order_id=${order_id}`);
    } catch (error) {
      console.log("paypal cancel route", error);
    }
  };

  //*************** WALLET TRANSACTION  ****************

  walletTransaction = async (req, res) => {
    try {
      let loginId = req.session.isCustomerLoggedIn;
      loginId = mongoose.Types.ObjectId(loginId);
      const body = req.body;
      let product_ids = await Cart.aggregate([
        {
          $match: { user_id: loginId },
        },
        {
          $lookup: {
            from: "products",
            let: { productId: "$product_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$productId", "$_id"] },
                },
              },
              { $project: { price: 1, _id: 0, user_id: 1 } },
            ],
            as: "product",
          },
        },
      ]);
      let orderId = "ORDER000" + Math.floor(Math.random() * 100) + Date.now();
      let currentDate = new Date()
        .toLocaleDateString(`fr-CA`)
        .split("/")
        .join("-");
      let orderData = {
        order_id: orderId,
        user_id: loginId,
        subtotal: parseFloat(body.subtotal),
        total: parseFloat(body.total),
        wallet_discount: parseFloat(body.wallet_discount),
        final_pay: parseFloat(body.final_pay),
        use_wallet: body.use_wallet,
        payment_type: "wallet",
        payment_status: "succeeded",
        transaction_id: v4(),
        createdAt: new Date(`${currentDate}T00:00:00.00Z`),
      };
      let order = await Order.create(orderData);
      let seller_ids = [];
      if (order) {
        for (let i = 0; i < product_ids.length; i++) {
          let obj = {
            order_id: order.order_id,
            user_id: order.user_id,
            product_id: mongoose.Types.ObjectId(product_ids[i].product_id),
            quantity: "1",
            price: parseFloat(product_ids[i].product[0].price),
          };
          seller_ids.push({
            id: product_ids[i].product[0].user_id,
            price: product_ids[i].product[0].price,
          });
          let orderDetails = await OrderDetails.create(obj);
          console.log("orderDetails", orderDetails);
        }
        console.log("seller_ids", seller_ids);
        await Cart.deleteMany({ user_id: loginId });
      }
      let admin_earning = parseFloat(order.subtotal) * parseFloat(0.17);
      let adminData = {
        user_id: order.user_id,
        order_id: order.order_id,
        order_amount: order.total,
        saving_amount: order.final_pay,
        earning: admin_earning.toFixed(2),
        type: "wallet",
      };
      await Admin_earning.create(adminData);
      for (let i = 0; i < seller_ids.length; i++) {
        let profit = parseFloat(seller_ids[i].price) * 0.9;
        await transaction.creditAccount(
          profit,
          seller_ids[i].id,
          loginId,
          order.transaction_id
        );
      }
      if (body.use_wallet == 1) {
        await transaction.debitAccount(
          body.wallet_discount,
          loginId,
          order.transaction_id
        );
      }
      req.session.status = "success";
      req.session.message = "Hurray your order has been placed succefully";
      res.json({ success: true, order });
    } catch (error) {
      console.log("wallet payment error", error);
      res.send({ message: error });
    }
  };

  // ************ THANKS FOR SHOPPING **************

  thankMessage = async (req, res) => {
    let isUserLoggedIn = false;
    let userData = "";
    global.productCount = 0;
    let orderId = req.query.order_id;
    if (req.session.isCustomerLoggedIn) {
      isUserLoggedIn = true;
      let loginId = req.session.isCustomerLoggedIn;
      loginId = mongoose.Types.ObjectId(loginId);
      userData = await User.findOne({ _id: loginId });
      let count = await Cart.count({ user_id: loginId });
      global.productCount = count;
      var order = await Order.findOne({ order_id: orderId });
    }
    if (req.cookies.cartItems && !isUserLoggedIn) {
      global.productCount = req.cookies.cartItems.length;
    }
    let data = {
      status: "",
      message: "",
      isUserLoggedIn,
      userData,
      order,
    };
    if (req.session.status && req.session.message) {
      data.status = req.session.status;
      data.message = req.session.message;
      delete req.session.status, req.session.message;
    }
    res.render("user/thankyou", data);
  };

  // ************ PRODUCT REVIEW **************

  review = async (req, res) => {
    try {
      let { rating, review, productId } = req.body;
      let loginId = req.session.isCustomerLoggedIn;
      loginId = mongoose.Types.ObjectId(loginId);
      productId = mongoose.Types.ObjectId(productId);
      let data = {
        user_id: loginId,
        product_id: productId,
        rating: rating,
        review: review,
      };
      await Review.create(data);
      res.json({ success: true });
    } catch (error) {
      console.log("Review error", error);
    }
  };
}

module.exports = new ProductController();
