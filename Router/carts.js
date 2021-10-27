const router = require("express").Router();
const Cart = require("../Model/Cart");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

router.post("/", verifyTokenAndAuthorization, async (req, res) => {
  const newCart = new Cart(req.body);
  try {
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// router.get("/find/:id", async (req, res) => {
//   try {
//     const Cart = await Cart.findById(req.params.id);
//     res.status(200).json(Cart);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });

// router.get("/", async (req, res) => {
//   const qNew = req.query.new;
//   const qCategory = req.query.category;
//   try {
//     const Carts = qNew
//       ? await Cart.find().sort({ createdAt: -1 }).limit(5)
//       : qCategory
//       ? await Cart.find({
//           categories: {
//             $in: [qCategory],
//           },
//         })
//       : await Cart.find();
    
//     res.status(200).json(Carts)
//   } catch (error) {
//       res.json(500).json(error)
//   }
// });

module.exports = router;
