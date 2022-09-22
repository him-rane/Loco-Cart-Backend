const express = require("express");
const Product = require("../model/Product.js");
const env = require("dotenv");
const product = express.Router();
const expressAsyncHandler = require("express-async-handler");

product.post(
  "/addproduct",
  expressAsyncHandler(async (req,res)=>{
    console.log(req.body);
    const productName = req.body.productName;
    const productCategory = req.body.productCategory;
    const sellerPrice = req.body.sellerPrice;
    const sellerDescription = req.body.sellerDescription;
    const sellerQuantity = req.body.sellerQuantity;
    const sellerId = req.body.sellerId;
    const sellerImage = req.body.sellerImage;

    const product = await Product.findOne({Name: productName});

    if(product){
      const sellerMap = product.Sellers;
      console.log(sellerMap)
      if(sellerMap.has(sellerId)){
        const previousQuantity = sellerMap.get(sellerId).Quantity;
        sellerMap.set(sellerId, {
          SellerPrice: sellerPrice,
          Description: sellerDescription,
          SellerId: sellerId,
          Quantity: Number(previousQuantity) + Number(sellerQuantity),
          Image: sellerImage,
          Rating: sellerMap.get(sellerId).Rating,
          comments: sellerMap.get(sellerId).comments,
        });
      }else{
        sellerMap.set(sellerId,{
          SellerPrice: sellerPrice,
          Description: sellerDescription,
          SellerId: sellerId,
          Quantity: sellerQuantity,
          Image: sellerImage,
          Rating: 0,
          comments: [],
        });
      }
      const updatedProduct = await Product.updateOne({Name: productName},{
        $set:{
          Sellers: sellerMap
        }
      });
      return res.status(200).send({message: "Success", product: updatedProduct});
    }else{
      const sellerMap = new Map();
      sellerMap.set(sellerId,{
        SellerPrice: sellerPrice,
        Description: sellerDescription,
        SellerId: sellerId,
        Quantity: sellerQuantity,
        Image: sellerImage,
        Rating: 0,
        comments: [],
      });

      const newProduct = new Product({
        Name: productName,
        Category: productCategory,
        Sellers: sellerMap
      });

      const createdProduct = await newProduct.save();

      return res.status(200).send({message: "Success", product: createdProduct});
    }
  })
)

product.post("/search", (req, res) => {
  const productName = req.body.name;
  let namePattern = new RegExp(productName, "i");
  Product.find({ Name: namePattern }).exec((err, products) => {
    if (err) {
      return res.status(422).json({ error: err });
    }
    return res.json({ products });
  });
});

product.post("/searchbyid", (req, res) => {
  const productId = req.body.id;
  Product.findOne({ _id: productId }).exec((err, products) => {
    if (err) {
      return res.status(422).json({ error: err });
    }
    return res.json({ products });
  });
});

product.post("/allproducts", (req, res) => {
  Product.find({}).exec((err, products) => {
    if (err) {
      return res.status(422).json({ error: err });
    }
    return res.json({ products });
  });
});

module.exports = product;
