const User = require('../models/User');
const PayOS = require('@payos/node');
const {
  createProEndDate,
  isFuture,
  syncExpiredSubscription,
  toClientSubscription,
} = require("../utils/subscriptionUtils");

// Khởi tạo PayOS
const payos = new PayOS(
  '15d8eadb-4b7c-447e-8885-0dbbb5a164b7',
  'b2b607ff-1de0-415f-9bd1-d68da4d5c36c',
  'd35f4ba82dde7d6af2c2fff0cadae640f904efa76bd658f67bf023a94e2b0425'
);

exports.createPaymentLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    await syncExpiredSubscription(user);

    const orderCode = Number(String(Date.now()).slice(-6));
    
    // GẮN CỨNG LINK LOCAL CHO FRONTEND ĐỂ TEST Ở MÁY
    const domain = 'http://localhost:5173';

    const requestData = {
      orderCode: orderCode,
      amount: 59000,
      description: "Nang cap Pro",
      returnUrl: `${domain}/subscription?status=success`,
      cancelUrl: `${domain}/subscription?cancel=true`
    };

    const paymentLink = await payos.createPaymentLink(requestData);
    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upgradeToPro = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    await syncExpiredSubscription(user);

    const currentEnd = user?.subscription?.endDate ? new Date(user.subscription.endDate) : null;
    const baseDate =
      user?.subscription?.plan === "pro" && isFuture(currentEnd) ? currentEnd : new Date();

    const endDate = createProEndDate(baseDate);
    user.subscription = {
      ...(user.subscription || {}),
      plan: "pro",
      endDate,
    };
    await user.save();

    res.json({ 
        message: "Nâng cấp Pro thành công!", 
        user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
            subscription: toClientSubscription(user),
        }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downgradeToFree = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

      user.subscription = {
        ...(user.subscription || {}),
        plan: "free",
        endDate: null,
      };
      await user.save();
  
      res.json({ 
          message: "Đã hủy gói Pro", 
          user: {
              _id: user._id,
              email: user.email,
              role: user.role,
              profile: user.profile,
              subscription: toClientSubscription(user),
          }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
