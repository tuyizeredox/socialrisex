const Flutterwave = require('flutterwave-node-v3');
const User = require('../models/user.model');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.initiatePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'Account already activated' });
    }

    const payload = {
      tx_ref: `SRX-${Date.now()}-${userId}`,
      amount: "5000",
      currency: "RWF",
      redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
      customer: {
        email: user.email,
        name: user.fullName
      },
      customizations: {
        title: "SocialRise X Account Activation",
        description: "One-time account activation payment",
        logo: "https://your-logo-url.com/logo.png"
      }
    };

    const response = await flw.Charge.card(payload);
    res.json(response);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.query;
    
    const response = await flw.Transaction.verify({ id: transaction_id });
    
    if (response.data.status === "successful") {
      const txRef = response.data.tx_ref;
      const userId = txRef.split('-')[2];
      
      // Activate user account
      await User.findByIdAndUpdate(userId, {
        isActive: true,
        paymentStatus: 'completed'
      });

      // If user was referred, process referral bonus
      const user = await User.findById(userId);
      if (user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        referrer.earnings += 2800; // Direct referral bonus
        await referrer.save();
      }

      res.json({ message: 'Payment verified and account activated' });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { userId } = req.user;
    const { amount, paymentMethod, accountDetails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.earnings < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      paymentMethod,
      accountDetails,
      status: 'pending'
    });

    await withdrawal.save();
    
    // Deduct amount from user's earnings
    user.earnings -= amount;
    await user.save();

    res.json({ message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal request' });
  }
}; 