const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Load environment variables
dotenv.config();
console.log("Secret Key:", process.env.ACESS_TOKEN_SECRET);  // Debugging

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

// Create a MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Connected to MongoDB successfully!");

    const blogsCollection = client.db('JobPortal').collection('blogscontent');

    // 🔹 Add a new blog post
    app.post("/blogs", async (req, res) => {
      const blogData = req.body;
      const result = await blogsCollection.insertOne(blogData);
      res.send(result);
    });

    // 🔹 Generate JWT token for authentication
    app.post('/jwt', async (req, res) => {
      const userEmail = req.body;
      console.log(userEmail);
      const token = jwt.sign(userEmail, process.env.ACESS_TOKEN_SECRETgit, { expiresIn: '365d' });
      res.send({ token });
    });

    // 🔹 Get all blog posts
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    // 🔹 Get a single blog post by ID
    app.get("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    // 🔹 Update a blog post by ID
    app.put("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const query = { _id: new ObjectId(id) };
      delete updatedData._id; // Ensure _id is not modified

      const update = { $set: updatedData };
      const result = await blogsCollection.updateOne(query, update);

      res.send({ message: "Blog post updated successfully", updatedData });
    });

    // 🔹 Delete a blog post by ID
    app.delete("/blogs/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });

    // 🔹 Server status check route
    app.get('/', async (req, res) => {
      res.send('Blog server is running!');
    });

  } finally {
    // Uncomment this if you want to close the connection after execution
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
