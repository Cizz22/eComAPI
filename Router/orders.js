const router = require("express").Router();
const Order = require("../Model/Order");
const midtransClient = require("midtrans-client");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: `${process.env.MIDTRANS_SERVER_KEY}`,
  clientKey: `${process.env.MIDTRANS_CLIENT_KEY}`,
});

router.post("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const newOrder = await new Order(req.body).save();

    const payLoad = {
      transaction_details: {
        order_id: newOrder._id,
        gross_amount: req.body.amount,
      },
    };

    const token = await snap.createTransactionToken(payLoad);
    const updatedOrder = await Order.findByIdAndUpdate(
      newOrder._id,
      {
        $set: {
          token,
        },
      },
      { new: true }
    );
    res.status(201).json(updatedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
