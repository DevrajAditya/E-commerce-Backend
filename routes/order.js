const router = require("express").Router();
const Order = require("../models/Order");

const {
  verifyToken,
  verifyTokenAndAuthentication,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// CREATE

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE
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
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been Deleted... ");
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET USER ORDERS

router.get("/find/:userId", verifyTokenAndAuthentication,async (req, res) => {
  try {
    const orders = await Order.find({userId: req.params.userId});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});

 // GET ALL 

 router.get("/", verifyTokenAndAdmin, async (req, res)=>{
  try {
    const orders = await Order.find()
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
 })


//  GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async(req, res)=>{
    const date = new Date();
    const lastMonth = new Date(date.setDate(date.getMonth()-1));
    const previousMonth = new Date(new Date().setDate(lastMonth.getMonth()-1));
    
    try {
        const income = await Order.aggregate([
            { $match: {createdAt:{$gte:previousMonth}}},
            {
                $project:{
                    month: {$month : "createdAt"},
                    sales: "$amount",
                },
            },
                {
                    $group:{
                        _id:$month,
                        total:{$sum: $sales}
                    },
                },
            
        ]);
        res.status(200).json(income);
    }
     catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;