const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config()

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());


mongoose.connect(process.env.MONGO_CONNECTION)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(error => console.error("Failed to connect:", error));


const PricingSchema = new mongoose.Schema({
  currencyCode: String,
  tierMinimumUnits: Number,
  retailPrice: Number,
  unitPrice: Number,
  armRegionName: String,
  location: String,
  effectiveStartDate: Date,
  effectiveEndDate: Date,
  meterId: String,
  meterName: String,
  productId: String,
  skuId: String,
  productName: String,
  skuName: String,
  serviceName: String,
  serviceId: String,
  serviceFamily: String,
  unitOfMeasure: String,
  type: String,
  isPrimaryMeterRegion: Boolean,
  armSkuName: String
});

const Pricing = mongoose.model("Pricing", PricingSchema);

async function fetchAzureData() {
  try {
    const response = await axios.get('https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview');
    const items = response.data.Items;

    await Pricing.deleteMany({});
    await Pricing.insertMany(items);
    console.log('Data fetched and stored successfully');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

app.get('/api/pricing', async (req, res) => {
  try {
    const data = await Pricing.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});


setInterval(fetchAzureData, 1800000);

app.listen(5000, () => {
  console.log("Server running on port 5000");
  fetchAzureData();
});
