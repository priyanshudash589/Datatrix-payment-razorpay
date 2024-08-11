const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Participant = require('./Models/participants');
const Event = require('./Models/events');
const razorpay = require('./razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
require("./db");
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Route to create a new order
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;
        if (!amount || !currency || !receipt) {
            throw new Error("Missing required fields: amount, currency, or receipt");
        }

        const options = {
            amount: amount * 100, 
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
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
      const expectedSignature = crypto.createHmac('sha256', razorpay.key_secret)
          .update(body.toString())
          .digest('hex');

      if (expectedSignature === razorpay_signature) {
          const {
              participantName,
              participantEmail,
              participantPhone,
              participantCollege,
              participantEvent, // This is the event title
              amount
          } = req.body;


          // Save the participant with the event's ObjectId
          const newParticipant = new Participant({
              name: participantName,
              email: participantEmail,
              phone: participantPhone,
              college: participantCollege,
              eventTitle: participantEvent, // Storing event title
              paymentAmount: amount,
              paymentStatus: 'paid'
          });

          await newParticipant.save();
      } else {
          // Signature is invalid, return failure response
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
