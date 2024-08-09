const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_yime1L5rinM9tw',
  key_secret: 'Kr15Ax0wH37CaKFx0Sm6Vmi2',
});

// Function to read data from JSON file
const readData = () => {
  if (fs.existsSync('orders.json')) {
    const data = fs.readFileSync('orders.json');
    return JSON.parse(data);
  }
  return [];
};

// Function to write data to JSON file
const writeData = (data) => {
  fs.writeFileSync('orders.json', JSON.stringify(data, null, 2));
};

// Initialize orders.json if it doesn't exist
if (!fs.existsSync('orders.json')) {
  writeData([]);
}

// Route to create a new order
app.post('/create-order', async (req, res) => {
    try {
      const { amount, currency, receipt, notes } = req.body;
  
      if (!amount || !currency || !receipt) {
        throw new Error("Missing required fields: amount, currency, or receipt");
      }
  
      const options = {
        amount: amount, // Amount in paise
        currency: currency,
        receipt: receipt,
        notes: notes || {},
      };
  
      console.log('Creating order with options:', options);
      const order = await razorpay.orders.create(options);
      console.log('Order created successfully:', order);
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).send(`Error creating order: ${error.message}`);
    }
  });
  

// Route to handle payment verification
app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = Razorpay.validateWebhookSignature(body, razorpay_signature, razorpay.key_secret);
    if (isValidSignature) {
      // Update the order with payment details
      const orders = readData();
      const order = orders.find(o => o.order_id === razorpay_order_id);
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        writeData(orders);
      }
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'verification_failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
