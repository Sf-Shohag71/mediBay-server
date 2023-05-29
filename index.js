
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ti096zd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    //create collection in database
    const featuredToyCollection = client
      .db("toyTronix")
      .collection("featuredToys");
    const userToysCollection = client.db("toyTronix").collection("usersToys");

    //for searching operations
    // const indexKeys = { name: 1, sub_category: 1 };
    // const indexOptions = { name: "searchByName" };
    // const result = await userToysCollection.createIndex(
    //   indexKeys,
    //   indexOptions
    // );
    // console.log(result);

    app.get("/searchToy/:text", async (req, res) => {
      const searchData = req.params.text;
      const result = await userToysCollection
        .find({
          $or: [
            { name: { $regex: searchData, $options: "i" } },
            { sub_category: { $regex: searchData, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    //get usersToys data from database
    app.get("/allMedicines", async (req, res) => {
      const cursor = userToysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allMedicines/:subCategory", async(req,res)=>{
      const subCategory = req.params.subCategory;
      // console.log(subCategory);
      if (subCategory == "OTC-Medicines" || subCategory == "Vitamins & Supplements" || subCategory == "Personal Care") {
        const result = await userToysCollection.find({sub_category: subCategory}).toArray();
        // console.log(result);
        res.send(result);
      }
      // const result = await userToysCollection.find({}).toArray();
      // res.send(result);
    })

    app.get("/medicine/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userToysCollection.findOne(query);
      res.send(result);
    });
    app.get("/myMedicines", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await userToysCollection
        .find(query)
        .sort({ price: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userToysCollection.findOne(query);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toy = {
        $set: {
          name: updatedToy.name,
          s_name: updatedToy.s_name,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          ratings: updatedToy.ratings,
          picture: updatedToy.picture,
          sub_category: updatedToy.sub_category,
          description: updatedToy.description,
        },
      };

      const result = await userToysCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.post("/addMedicine", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);

      const result = await userToysCollection.insertOne(newToy);
      res.send(result);
    });

    app.delete("/myMedicines/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userToysCollection.deleteOne(query);
      res.send(result);
    });

    //get featured data from database
    app.get("/featuredToys", async (req, res) => {
      const cursor = featuredToyCollection.find().limit(9);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/featuredToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await featuredToyCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

//basic server setup to getting response
app.get("/", (req, res) => {
  res.send("ToyTronix server is running...");
});
app.listen(port, () => {
  console.log(`ToyTronix server is running port: ${port}`);
});