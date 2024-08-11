const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

let db;

const connectToDB = async () => {
  try {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

const upsertEvents = async () => {
  try {
    if (!db) {
      throw new Error('DB not initialized');
    }
    const events = [
      {
        title: "Datathon",
        description: "24-hour coding challenge",
        price: 40,
        availableSlots: 70,
        totalSlots: 70,
      },
      {
        title: "Data Science Quiz",
        description: "24-hour coding challenge",
        price: 140,
        availableSlots: 70,
        totalSlots: 100,
      },
      {
        title: "Speed Regex",
        description: "24-hour coding challenge",
        price: 50,
        availableSlots: 60,
        totalSlots: 60,
      },
      {
        title: "Idea Explorer",
        description: "24-hour coding challenge",
        price: 150,
        availableSlots: 200,
        totalSlots: 200,
      },
      {
        title: "Design Forge",
        description: "UI/UX Workshop & Competition",
        price: 100,
        availableSlots: 50,
        totalSlots: 50,
      },
      {
        title: "Data Visualization Challenge",
        description: "24-hour coding challenge",
        price: 120,
        availableSlots: 50,
        totalSlots: 70,
      },
    ];

    const operations = events.map(event => ({
      updateOne: {
        filter: { title: event.title },
        update: { $set: event },
        upsert: true
      }
    }));

    const result = await db.collection('events').bulkWrite(operations);
    console.log(`${result.upsertedCount} documents were inserted`);
    console.log(`${result.modifiedCount} documents were updated`);
  } catch (error) {
    console.error('Error upserting documents:', error.message);
  }
};

// Execute functions
const run = async () => {
  await connectToDB();
  await upsertEvents();
};

run();
