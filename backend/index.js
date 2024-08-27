const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser');

const axios = require('axios'); // Make sure axios is imported here

const jwt = require('jsonwebtoken');
const app = express();
const AWS = require('aws-sdk');

const multer = require('multer');
const path = require('path');

const uploadForm = multer();


const PORT = 8080;
const mongo_uri = process.env.MONGO_URI || 'mongodb+srv://teja:teja@cluster0.bgdbs80.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Middleware to parse JSON and URL-encoded data

app.use(express.urlencoded({ extended: true }));


const crypto = require('crypto');

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
}

AWS.config.update({
  accessKeyId: 'AKIAZQ3DQXGKAL3AK34A',
  secretAccessKey: '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',
  region: 'ap-south-1',
});

const s3 = new AWS.S3();

const SECRET_KEY_AGENT = '12345'

const SECRET_KEY = '1234'

const SECRET_KEY_BUYER = '123456'

const agent_info = require('../backend/model/deliveryAgent.js');
const User = require('../backend/model/user_info.js');
const Coupon = require('../backend/model/vouchers.js');
const Product = require('../backend/model/productSchema.js');
const user_info = require('../backend/model/user_info.js');
const reCommerceOrders = require('../backend/model/re_commerce.js');
const ScrapOrders = require('../backend/model/orders.js');
const RecyclingMaterial = require('../backend/model/recyclingMaterials.js');

const Inventory = require('../backend/model/materialsInventory.js'); // Update the path as needed

const DeliveryAgency = require('../backend/model/deliveryAgencies.js');

const DeliveryTracking = require('../backend/model/deliveryTracking.js');
const PickupTracking = require('../backend/model/pickupTracking.js');

const DeliveryManagement = require('../backend/model/deliveryManagement.js');

const Seller = require('../backend/model/sellerSchema.js');

const ScrapBuyer = require('../backend/model/scrapBuyers.js');


mongoose.connect(mongo_uri)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((e) => {
    console.log("Error connecting to the database:", e);
  });



// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
});


// Utility function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers

  // Convert latitude and longitude from strings to numbers
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
}



// Your Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ3NhaXRlamEwMDEiLCJhIjoiY2x5a3MyeXViMDl3NjJqcjc2OHQ3NTVoNiJ9.b5q6xpWN2yqeaKTaySgcBQ';

// app.get('/api/mapbox/:resource', async (req, res) => {
//   const { resource } = req.params;
//   const { z, x, y } = req.query; // If you're using tiles, these might be z, x, y

//   try {
//     const response = await axios.get(
//       `https://api.mapbox.com/${resource}?access_token=${MAPBOX_TOKEN}`,
//       { params: { ...req.query } }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching data from Mapbox:', error);
//     res.status(500).json({ error: 'Error fetching data from Mapbox' });
//   }
// });

app.get('/api/mapbox/styles/v1/*', async (req, res) => {
  const resourcePath = req.params[0]; // Capture the entire path after /api/mapbox/styles/v1/
  const query = req.query; // Capture query parameters if any

  try {
    // Log the request being made to Mapbox for debugging
    console.log(`Requesting from Mapbox: https://api.mapbox.com/styles/v1/${resourcePath}`, { params: { ...query, access_token: MAPBOX_TOKEN } });

    const mapboxResponse = await axios.get(
      `https://api.mapbox.com/styles/v1/${resourcePath}`, {
        params: { ...query, access_token: MAPBOX_TOKEN } // Forward query parameters and access token
      }
    );

    res.json(mapboxResponse.data);
  } catch (error) {
    // Log full error response for debugging
    console.error('Error fetching data from Mapbox:', error.response ? error.response.data : error.message);

    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Error fetching data from Mapbox',
      details: error.response ? error.response.data : error.message 
    });
  }
});







app.post('/upload', upload.single('image'), (req, res) => {
  const params = {
    Bucket: "gadupathi",
    Key: `${Date.now().toString()}_${req.file.originalname}`,
    Body: req.file.buffer,
   
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ imageUrl: data.Location });
  });
});

// Function to generate a unique ID for the agency
const generateUniqueagencyId = () => {
  const timestamp = Date.now();
  return `agency${timestamp}`;
};

// Get all delivery agencies
app.get('/api/deliveryAgencies', async (req, res) => {
  try {
    const agencies = await DeliveryAgency.find();
    res.json(agencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update a delivery agency
app.post('/api/deliveryAgencies', async (req, res) => {
  let { id, ...data } = req.body;
  try {
    if (!id) {
      id = generateUniqueagencyId();
    }
    let agency = await DeliveryAgency.findOneAndUpdate({ id }, { id, ...data }, { new: true, upsert: true });
    res.status(201).json(agency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Endpoint to delete a delivery agency
app.delete('/api/deliveryAgencies/:id', (req, res) => {
  const { id } = req.params;
  const agencyIndex = deliveryAgencies.findIndex(agency => agency.id === id);

  if (agencyIndex !== -1) {
    deliveryAgencies.splice(agencyIndex, 1);
    res.status(200).json({ message: 'Agency deleted successfully' });
  } else {
    res.status(404).json({ message: 'Agency not found' });
  }
});




// Update settings endpoint
app.put('/api/agents/:id/settings', async (req, res) => {
  const { id } = req.params;
  const { agentStatus, type } = req.body;

  try {
    const agent = await agent_info.findOneAndUpdate(
      { id },
      {
        $set: {
          agentStatus,
          type,
        }
      },
      { new: true }
    );

    if (!agent) {
      return res.status(404).send('Agent not found');
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update location endpoint
app.put('/api/agents/:id/location', async (req, res) => {
  const { id } = req.params;
  const { latitudes, longitudes } = req.body;
  console.log('Received data - id:', id, 'latitudes:', latitudes, 'longitudes:', longitudes);

  try {
    // Ensure location is an object
    const agent = await agent_info.findOneAndUpdate(
      { id },
      { 
        $set: { 
          'location': { latitudes, longitudes }
        } 
      },
      { new: true, upsert: true }
    );

    if (!agent) {
      console.error('Agent not found');
      return res.status(404).send('Agent not found');
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Fetch agent info endpoint
app.get('/api/agents/:id', async (req, res) => {
  try {
    const agent = await agent_info.findOne({ id: req.params.id });
    if (!agent) {
      return res.status(404).send('Agent not found');
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});





app.get('/api/deliveryAgents', async (req, res) => {
  try {
    const agents = await agent_info.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/deliveryAgents/:id', async (req, res) => {
  try {
    const agent = await agent_info.findOne({ id: req.params.id });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    await agent_info.deleteOne({ id: req.params.id });
    res.json({ message: 'Agent removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `agent${timestamp}${randomNum}`;
};



app.post('/api/deliveryAgents', async (req, res) => {
  const { id, ...data } = req.body;
  try {
    let agent;
    if (id) {
      agent = await agent_info.findOneAndUpdate({ id }, data, { new: true });
    } else {
      agent = new agent_info({ id: generateUniqueId(), ...data });
      await agent.save();
    }
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




app.post('/api/agent_login', async (req, res) => {
  const { username, password } = req.body;

  const agent = await agent_info.findOne({ 'loginCredentials.username': username, 'loginCredentials.password': password  });
  if (agent) {
    const token = jwt.sign({ username }, SECRET_KEY_AGENT, { expiresIn: '1h' });
    const { id } = agent;
    res.json({ token, id });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});


app.post('/api/agent_signup', async (req, res) => {
  const { id, name, age, contactNumber, username, password, aadharId, vehicleNumber, vehicleCapacity, location } = req.body;

  if (!id || !name || !contactNumber || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newAgent = new agent_info({
    id,
    name,
    age,
    contactNumber,
    loginCredentials: [{ username, password }],
    aadharId,
    vehicleNumber,
    vehicleCapacity,
    location,
  });

  try {
    await newAgent.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error });
  }
});


// app.put('/api/update-coupon-ids', async (req, res) => {
//   try {
//     const coupons = await Coupon.find(); // Fetch all coupons

//     // Iterate over each coupon and update the 'id' field
//     const updatePromises = coupons.map(coupon => {
//       const newId = `voucherId${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
//       return Coupon.findByIdAndUpdate(coupon._id, { id: newId });
//     });

//     // Wait for all updates to complete
//     await Promise.all(updatePromises);

//     res.status(200).json({ message: 'Coupon IDs updated successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



// PUT endpoint to update a coupon by ID
app.put('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;  // Extract the ID from the request parameters
  const updatedData = req.body;  // Extract the updated data from the request body

  try {
    // Find the coupon by ID and update it with the new data
    const updatedCoupon = await Coupon.findOneAndUpdate({ id }, updatedData, { new: true });

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE endpoint to delete a coupon by ID
app.delete('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;  // Extract the ID from the request parameters

  try {
    // Find the coupon by ID and delete it
    const deletedCoupon = await Coupon.findOneAndDelete({ id });

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




app.post('/api/upload-coupons', async (req, res) => {
  try {
    const categories = req.body;
    const coupons = [];
    for (const category in categories) {
      if (categories.hasOwnProperty(category)) {
        const categoryCoupons = categories[category].map(coupon => ({ ...coupon, category }));
        coupons.push(...categoryCoupons);
      }
    }
    await Coupon.insertMany(coupons);
    res.status(200).json({ message: 'Coupons uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update existing recycling material
app.put('/api/recycling-materials/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const updatedItem = req.body;

    // Find the material by itemId
    const material = await RecyclingMaterial.findOne({
      'items.itemId': materialId
    });

    if (!material) {
      return res.status(404).json({ message: 'Recycling material not found!' });
    }

    // Update the specific item
    const item = material.items.find(item => item.itemId === materialId);
    if (item) {
      item.name = updatedItem.name || item.name;
      item.price = updatedItem.price !== undefined ? updatedItem.price : item.price;
      item.imageUrl = updatedItem.imageUrl !== undefined ? updatedItem.imageUrl : item.imageUrl;
      
      // Since imageUrl is no longer required, we don't need to check its presence
    }

    await material.save();
    res.status(200).json({ message: 'Recycling material updated successfully!' });
  } catch (error) {
    console.error('Error updating recycling material:', error);
    res.status(500).json({ error: error.message });
  }
});



// Add new endpoint to upload recycling materials
app.post('/api/upload-recycling-materials', async (req, res) => {
  try {
    const materials = req.body;
    const categories = Object.keys(materials);

    for (const category of categories) {
      const items = materials[category].map(item => ({ ...item }));
      const recyclingMaterial = new RecyclingMaterial({ category, items });
      await recyclingMaterial.save();
    }

    res.status(200).json({ message: 'Recycling materials uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint to get recycling materials
app.get('/api/recycling-materials', async (req, res) => {
  try {
    const materials = await RecyclingMaterial.find();
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// // Add new endpoint to upload products
// app.post('/api/products', async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     await product.save();
//     res.status(200).json({ message: 'Product uploaded successfully!' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Add new endpoint to get products
// app.get('/api/products', async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Function to generate a random ID based on date and time
// function generateRandomId(prefix) {
//   const timestamp = Date.now(); // Get the current timestamp
//   const randomNum = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
//   return `${prefix}${timestamp}${randomNum}`;
// }

// app.put('/api/update-recycling-materials', async (req, res) => {
//   try {
//     // Fetch all categories
//     const categories = await RecyclingMaterial.find();

//     for (const category of categories) {
//       // Generate a new category ID
//       category.id = generateRandomId('recylCate');

//       // Update each item in the category
//       category.items = category.items.map(item => ({
//         ...item.toObject(),
//         itemId: generateRandomId('recylItem'),
//         imageUrl: '' // Set imageUrl to an empty string
//       }));

//       // Save the updated category
//       await category.save();
//     }

//     res.status(200).json({ message: 'All recycling materials updated successfully!' });
//   } catch (error) {
//     console.error('Error updating recycling materials:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


// // Function to generate a unique scrapBuyerId based on current time and date
// const generateUniqueScrapBuyerId = () => {
//   const date = new Date();
//   const uniqueId = `ScrapBuyerId${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000)}`;
//   return uniqueId;
// };

// // Endpoint to upload sample data
// app.post('/api/upload-sample-buyers', async (req, res) => {
//   const sampleBuyers = req.body;

//   try {
//       // Clear existing data (optional)
//       await ScrapBuyer.deleteMany({});

//       // Insert sample data with generated scrapBuyerId
//       const buyersWithIds = sampleBuyers.map(buyer => {
//           return {
//               ...buyer,
//               scrapBuyerId: generateUniqueScrapBuyerId()
//           };
//       });

//       await ScrapBuyer.insertMany(buyersWithIds);

//       res.status(200).json({ message: 'Sample buyers uploaded successfully!' });
//   } catch (error) {
//       console.error('Error uploading sample buyers:', error);
//       res.status(500).json({ error: 'Failed to upload sample buyers' });
//   }
// });


// POST endpoint to create a new postedOffer
app.post('/scrap-buyer/:scrapBuyerId/post-offer', async (req, res) => {
  const { scrapBuyerId } = req.params;
  const {
    materialType,
    quantityAvailable,
    pricePerUnit,
    description,
    contactInfo,
    location,
    images,
  } = req.body;

  // Generate a unique offerId
  const offerId = `PostedOfferId${Date.now()}`;

  const newOffer = {
    offerId,
    materialType,
    quantityAvailable,
    pricePerUnit,
    location: {
      address: location.address,
      latitude: location.latitude || null,
      longitude: location.longitude || null,
    },
    description,
    images: images || [], // Assuming images are passed as an array of URLs or filenames
    contactInfo,
    status: 'Active',
    postedDate: new Date(),
  };

  console.log('newOffer', newOffer);

  try {
    const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId });

    if (!scrapBuyer) {
      return res.status(404).json({ message: 'Scrap Buyer not found' });
    }

    scrapBuyer.postedOffers.push(newOffer);
    await scrapBuyer.save();

    res.status(201).json({ message: 'Offer posted successfully', offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET endpoint to fetch all postedOffers for a specific scrapBuyerId
app.get('/scrap-buyer/:scrapBuyerId/posted-offers', async (req, res) => {
  const { scrapBuyerId } = req.params;

  try {
    const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId });

    if (!scrapBuyer) {
      return res.status(404).json({ message: 'Scrap Buyer not found' });
    }

    res.status(200).json(scrapBuyer.postedOffers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



// GET /api/scrap-buyers/:scrapBuyerId
app.get('/api/scrap-buyers/:scrapBuyerId', async (req, res) => {
  const { scrapBuyerId } = req.params;

  try {
    // Find the scrap buyer by ID
    const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId });

    if (!scrapBuyer) {
      return res.status(404).json({ message: 'Scrap Buyer not found' });
    }

    // Send the scrap buyer data in the response
    res.status(200).json(scrapBuyer);
  } catch (error) {
    console.error('Error fetching scrap buyer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// app.get('/api/scrap-buyers/orders', async (req, res) => {
//   const scrapBuyerId = req.query.scrapBuyerId; // Retrieve scrapBuyerId from query parameters

//   if (!scrapBuyerId) {
//     return res.status(400).json({ message: 'Scrap Buyer ID is required' });
//   }

//   try {
//     const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId }).populate('currentOrders').populate('completedOrders');

//     if (!scrapBuyer) {
//       return res.status(404).json({ message: 'Scrap buyer not found' });
//     }

//     res.json({
//       currentOrders: scrapBuyer.currentOrders,
//       completedOrders: scrapBuyer.completedOrders,
//     });
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



// Endpoint to update currentOrders in ScrapBuyer
app.post('/scrapBuyer/:id/updateCurrentOrders', async (req, res) => {
  const { id } = req.params;
  const { orderId, pickupDate, status } = req.body;

  try {
    const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId: id });

    if (!scrapBuyer) {
      return res.status(404).send('Scrap Buyer not found');
    }

    // Update currentOrders
    scrapBuyer.currentOrders.push({
      orderId,
      pickupDate,
      status,
    });

    await scrapBuyer.save();

    res.status(200).send('Current orders updated successfully');
  } catch (error) {
    console.error('Error updating current orders:', error);
    res.status(500).send('Server error');
  }
});


// Create a new Scrap Buyer
app.post('/api/scrap-buyers', async (req, res) => {
  try {
    const newScrapBuyer = new ScrapBuyer(req.body);
    await newScrapBuyer.save();
    res.status(201).json({ message: 'Scrap Buyer created successfully', scrapBuyer: newScrapBuyer });
  } catch (error) {
    console.error('Error creating scrap buyer:', error);
    res.status(500).json({ error: 'Failed to create scrap buyer' });
  }
});


// Update an existing Scrap Buyer by scrapBuyerId
app.put('/api/scrap-buyers/:id', async (req, res) => {
  try {
    const scrapBuyerId = req.params.id;
    const updatedData = req.body;

    const updatedScrapBuyer = await ScrapBuyer.findOneAndUpdate({ scrapBuyerId }, updatedData, { new: true });

    if (!updatedScrapBuyer) {
      return res.status(404).json({ error: 'Scrap Buyer not found' });
    }

    res.status(200).json({ message: 'Scrap Buyer updated successfully', scrapBuyer: updatedScrapBuyer });
  } catch (error) {
    console.error('Error updating scrap buyer:', error);
    res.status(500).json({ error: 'Failed to update scrap buyer' });
  }
});



// Delete a Scrap Buyer by scrapBuyerId
app.delete('/api/scrap-buyers/:id', async (req, res) => {
  try {
    const scrapBuyerId = req.params.id;

    const deletedScrapBuyer = await ScrapBuyer.findOneAndDelete({ scrapBuyerId });

    if (!deletedScrapBuyer) {
      return res.status(404).json({ error: 'Scrap Buyer not found' });
    }

    res.status(200).json({ message: 'Scrap Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting scrap buyer:', error);
    res.status(500).json({ error: 'Failed to delete scrap buyer' });
  }
});



// Get all scrap buyers
app.get('/api/scrap-buyers', async (req, res) => {
  try {
    const scrapBuyers = await ScrapBuyer.find();
    res.json(scrapBuyers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scrap buyers' });
  }
});


// // Helper function to adjust price by 10% randomly
// const adjustPriceRandomly = (price) => {
//   const adjustmentFactor = Math.random() > 0.3 ? 1.1 : 0.8;
//   return Math.round(price * adjustmentFactor);
// };

// // The endpoint to update acceptedMaterials
// app.put('/update-accepted-materials', async (req, res) => {
//   try {
//       // Use the data provided in req.body
//       const categoriesData = req.body;

//       // Check if the request body is an array
//       if (!Array.isArray(categoriesData)) {
//           return res.status(400).json({ message: 'Invalid data format. Expected an array of categories.' });
//       }

//       // Retrieve all scrap buyers
//       const scrapBuyers = await ScrapBuyer.find();

//       // Iterate over each buyer
//       for (const buyer of scrapBuyers) {
//           // Update acceptedMaterials for each buyer
//           buyer.acceptedMaterials = categoriesData.map(category => {
//               return {
//                   category: category.category,
//                   items: category.items.map(item => ({
//                       itemId: item.itemId,
//                       imageUrl: item.imageUrl,
//                       name: item.name,
//                       buyerPrice: adjustPriceRandomly(item.price), // Adjust price by 10%
//                   })),
//               };
//           });

//           // Save the updated buyer
//           await buyer.save();
//       }

//       res.status(200).json({ message: 'Accepted materials updated successfully for all buyers' });
//   } catch (error) {
//       console.error('Error updating accepted materials:', error);
//       res.status(500).json({ message: 'Failed to update accepted materials' });
//   }
// });



// Update buyerPrice for an item in acceptedMaterials
app.post('/api/scrap-buyers/update-price', async (req, res) => {
  const { itemId, buyerPrice } = req.body;

  try {
    // Find the ScrapBuyer who has this item in their acceptedMaterials
    const scrapBuyer = await ScrapBuyer.findOne({ 'acceptedMaterials.items.itemId': itemId });

    if (!scrapBuyer) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the buyerPrice for the specific item
    const materialIndex = scrapBuyer.acceptedMaterials.findIndex(material =>
      material.items.some(item => item.itemId === itemId)
    );

    if (materialIndex === -1) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const itemIndex = scrapBuyer.acceptedMaterials[materialIndex].items.findIndex(item => item.itemId === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the buyerPrice
    scrapBuyer.acceptedMaterials[materialIndex].items[itemIndex].buyerPrice = buyerPrice;

    // Save the updated ScrapBuyer document
    await scrapBuyer.save();

    return res.status(200).json({ message: 'Buyer price updated successfully', scrapBuyer });
  } catch (error) {
    console.error('Error updating buyer price:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});





// Login API
app.post('/api/buyerLogin', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
      const scrapBuyer = await ScrapBuyer.findOne({ 'contact.phone': phoneNumber });
      if (!scrapBuyer) {
          return res.status(400).json({ message: 'Invalid phone number' });
      }

      const token = jwt.sign({ scrapBuyerId: scrapBuyer.scrapBuyerId }, SECRET_KEY_BUYER, { expiresIn: '1h' });

      return res.json({ token, scrapBuyerId: scrapBuyer.scrapBuyerId });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
  }
});

// Signup API
app.post('/api/buyerSignup', async (req, res) => {
  const { name, phone, businessName, acceptedMaterials, pricing, operationalHours } = req.body;

  try {
      const existingBuyer = await ScrapBuyer.findOne({ 'contact.phone': phone });
      if (existingBuyer) {
          return res.status(400).json({ message: 'Phone number already in use' });
      }

      const newScrapBuyer = new ScrapBuyer({
          name,
          contact: { phone },
          businessName,
          acceptedMaterials,
          pricing,
          operationalHours,
          scrapBuyerId: `SB${Date.now()}`,
      });

      await newScrapBuyer.save();

      const token = jwt.sign({ scrapBuyerId: newScrapBuyer._id }, SECRET_KEY, { expiresIn: '1h' });

      return res.status(201).json({ token, scrapBuyerId: newScrapBuyer._id });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
  }
});


const updateInventory = async (scrapBuyerId, updatedItems) => {
  try {
    // Fetch the ScrapBuyer by ID
    const scrapBuyer = await ScrapBuyer.findOne({ scrapBuyerId });

    if (!scrapBuyer) {
      throw new Error('Scrap Buyer not found');
    }

    // Initialize inventory if it doesn't exist
    if (!scrapBuyer.inventory) {
      scrapBuyer.inventory = [];
    }

    updatedItems.forEach((item) => {
      const searchResult = scrapBuyer.acceptedMaterials.find(material => 
        material.items.some(materialItem => materialItem.itemId === item.itemId)
      );

      if (searchResult) {
        const { category } = searchResult;
      
        // Find the category in the inventory
        let inventoryCategory = scrapBuyer.inventory.find(inv => inv.category === category);
      
        if (!inventoryCategory) {

          // If the category does not exist in the inventory, create and add it
          inventoryCategory = {
            category: category,
            items: [{ itemId: item.itemId, name: item.name, quantity: item.quantity }],
          };
          scrapBuyer.inventory.push(inventoryCategory);
        } else {

          // If the category exists, find the item in the inventory
          let inventoryItem = inventoryCategory.items.find(invItem => invItem.itemId === item.itemId);
      
          if (!inventoryItem) {
            
            // If the item does not exist in the inventory, add it
            inventoryCategory.items.push({ itemId: item.itemId, name: item.name, quantity: item.quantity });
          } else {
            
            // If the item exists, update the quantity
            inventoryItem.quantity = Number(inventoryItem.quantity) + Number(item.quantity);
          }
        }
      } else {
        console.log(`Item with ID ${item.itemId} not found in accepted materials`);
      }
    });
    
    // Save the updated ScrapBuyer document
    await scrapBuyer.save();

  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Complete Order Endpoint
app.put('/scrap-buyer/completepickup', async (req, res) => {
  const { id, status, items } = req.body;

  try {
    console.log('Completing order with ID:', id);
    
    // Update order status in scrap-buyers
    const scrapBuyer = await ScrapBuyer.findOneAndUpdate(
      { 'currentOrders.orderId': id },
      { $set: { 'currentOrders.$.status': status } },
      { new: true }
    );

    if (!scrapBuyer) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found, updating inventory...');
    
    // Update inventory based on the completed order items
    await updateInventory(scrapBuyer.scrapBuyerId, items);

    console.log('Order completed and inventory updated successfully');
    
    // Respond with success message
    res.status(200).json({ message: 'Order completed successfully', order: scrapBuyer });
  } catch (error) {
    console.error('Error completing the order:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});



// GET /api/scrap-buyers/nearby/:latitude:longitude
app.get('/api/scrap-buyers/nearby/:latitude/:longitude', async (req, res) => {
  const latitude = req.params.latitude;
  const longitude = req.params.longitude;
  console.log(latitude,"HIUH",longitude)

  // Check if latitude and longitude are provided
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    // Fetch all scrap buyers from the database
    const scrapBuyers = await ScrapBuyer.find();

    // Filter and map the results to include distance and only the required fields
    const nearbyBuyers = scrapBuyers
      .map(buyer => {
        const distance = calculateDistance(latitude, longitude, buyer.location.latitude, buyer.location.longitude);

        console.log("jc",latitude)

        // Ensure that acceptedMaterials is correctly formatted
        const processedAcceptedMaterials = buyer.acceptedMaterials.map(material => ({
          category: material.category,
          items: material.items.map(item => ({
            itemId: item.itemId,
            imageUrl: item.imageUrl,
            name: item.name,
            buyerPrice: item.buyerPrice,
          })),
        }));

        return {
          scrapBuyerId: buyer.scrapBuyerId,
          name: buyer.name,
          businessName: buyer.businessName,
          location: buyer.location,
          acceptedMaterials: processedAcceptedMaterials,
          availableStatus: buyer.availableStatus,
          distance: distance,
        };
      })
      .filter(buyer => buyer.distance <= 50); // Filter buyers within a 50 km radius

    // Sort buyers by distance (nearest first)
    nearbyBuyers.sort((a, b) => a.distance - b.distance);

    // Return the list of nearby scrap buyers
    res.json(nearbyBuyers);
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: 'Error fetching nearby scrap buyers', error });
  }
});





app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sellers', async (req, res) => {
  const seller = new Seller(req.body);
  try {
    const newSeller = await seller.save();
    res.status(201).json(newSeller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload sample sellers
app.post('/api/upload-sample-data', async (req, res) => {
  try {
    await Seller.deleteMany({}); // Clear existing data
    const newSellers = await Seller.insertMany(req.body);
    res.status(201).json(newSellers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Add new endpoint to update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ message: 'Product updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Add new endpoint to delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint to upload products
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(200).json({ message: 'Product uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint to get products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const uploadData = async () => {
  try {
    for (const category in data) {
      if (data.hasOwnProperty(category)) {
        const products = data[category].map(product => ({
          ...product,
          category,
        reviews: [
          { user: "Default User 1", rating: 5, comment: "Default review 1", date: "2024-01-01" },
          { user: "Default User 2", rating: 4, comment: "Default review 2", date: "2024-01-02" }
        ],
        discount: 10,
        stock: 100 // Set default stock value
        }));
        await Product.insertMany(products);
      }
    }
    console.log("Data uploaded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error uploading data:", error);
    process.exit(1);
  }
};

// PUT endpoint to update reviews for all products
// app.put('/update-reviews', async (req, res) => {
//   try {
//     // New reviews to be added
//     const newReviews = [
//       { user: "Default User 1", rating: 5, comment: "Default review 1", date: "2024-01-01" },
//       { user: "Default User 2", rating: 4, comment: "Default review 2", date: "2024-01-02" }
//     ];

//     // Update all products by adding the new reviews to the existing reviews array
//     const updateResult = await Product.updateMany(
//       {}, // Update all products
//       { $push: { reviews: { $each: newReviews } } } // Add new reviews to the existing reviews array
//     );

//     res.status(200).json({
//       message: 'Reviews updated successfully for all products',
//       modifiedCount: updateResult.nModified
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while updating the reviews' });
//   }
// });




app.get("/uploadData", async (req, res) => {
  try {
    await uploadData();
    res.status(200).json({ message: "Data uploaded successfully" });
    console.error("data:", res);
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/", async (req, res) => {
  try {
    res.send("hello user");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/placereCommerceOrder", async (req, res) => {
  try {
    if (req.body) {
      const order = new reCommerceOrders(req.body);
      await order.save();
      res.status(201).json({ message: "Order placed successfully", order });
    } else {
      res.status(400).json({ error: "Invalid request data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





app.get("/getreCommerceOrders", async (req, res) => {
  const { date } = req.query;
  try {
    let orderslist;
    if (date) {
      orderslist = await reCommerceOrders.find({ date: date });
    } else {
      orderslist = await reCommerceOrders.find({});
    }
    res.status(200).json({ orderslist });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





app.post('/api/order', async (req, res) => {
  try {
    if (req.body) {
      const order = new reCommerceOrders(req.body);
      await order.save();
      res.status(201).json({ message: "Order placed successfully", order });
    } else {
      res.status(400).json({ error: "Invalid request data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // Set of user IDs to be randomly assigned
// const userIds = [
//   'user17225409828415155',
//   'user172281377038590',
//   'user17228138310394836',
//   'user17228138663814174',
//   'user17228138983324247'
// ];

// // Function to get a random userId from the set
// const getRandomUserId = () => userIds[Math.floor(Math.random() * userIds.length)];

// // Endpoint to update userId for all orders
// app.put('/api/orders/update-userIds', async (req, res) => {
//   try {
//     const orders = await reCommerceOrders.find();
    
//     if (!orders || orders.length === 0) {
//       console.log('No orders found in the database.');
//       return res.status(404).json({ message: 'No orders found' });
//     }

//     console.log(`Total orders fetched: ${orders.length}`);
//     const updatedOrders = [];

//     for (const order of orders) {
//       // Check if 'userId' property exists, if not, create it
//       if (!order.userId) {
//         const randomUserId = getRandomUserId();
//         order.userId = randomUserId;
//         console.log(`Assigned userId ${randomUserId} to order ${order.id}`);
//       } else {
//         // If 'userId' already exists, reassign a random userId
//         const randomUserId = getRandomUserId();
//         order.userId = randomUserId;
//         console.log(`Reassigned userId ${randomUserId} to order ${order.id}`);
//       }
//       await order.save();
//       updatedOrders.push(order);
//     }

//     res.json({
//       message: 'User IDs updated successfully',
//       updatedOrders
//     });
//   } catch (error) {
//     console.error('Error updating user IDs:', error);
//     res.status(500).send('Server error');
//   }
// });







// app.put('/api/products/update-ids', async (req, res) => {
//   try {
//     const products = await Product.find();
//     const updatedProducts = [];
//     let counter = 0;

//     for (const product of products) {
//       const newId = `productid${Date.now()}${counter++}`;
//       product.id = newId;
//       console.log(`Updating product ID for: ${product.name} to ${newId}`);

//       // Ensure required fields are provided
//       if (!product.status) {
//         product.status = 'default_status'; // Provide a default value
//       }
//       if (!product.weight) {
//         product.weight = 'default_weight'; // Provide a default value
//       }
//       if (!product.shipping || !product.shipping.weight) {
//         product.shipping = product.shipping || {};
//         product.shipping.weight = 'default_shipping_weight'; // Provide a default value
//       }

//       await product.save();
//       updatedProducts.push(product);
//     }

//     res.json({
//       message: 'Product IDs updated successfully',
//       updatedProducts
//     });
//   } catch (error) {
//     console.error('Error updating product IDs:', error);
//     res.status(500).send('Server error');
//   }
// });


// Increment product views
app.put('/api/products/:id/update-performance', async (req, res) => {
  try {
    const { id, performance } = req.body;
    const product = await Product.findOne({ id: req.params.id });

    if (!product) {
      console.error('Product not found');
      return res.status(404).send('Product not found');
    }

    // Ensure product.performance exists and update its views
    if (!product.performance) {
      product.performance = { views: 0 };
    }
    product.id = id;
    product.performance.views = performance.views;

    // Include required fields if they are not already present
    if (!product.weight) {
      product.weight = 'default_weight'; // Replace with actual default or calculated value
    }
    if (!product.status) {
      product.status = 'default_status'; // Replace with actual default or calculated value
    }

    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error updating product performance:', error);
    res.status(500).send('Server error');
  }
});


// POST /api/scrap-buyers/update-order-status
app.post('/api/scrap-buyers/update-order-status', async (req, res) => {
  const { orderId, status } = req.body;

  try {
    // Find the scrap buyer with the order and update the status
    const scrapBuyer = await ScrapBuyer.findOneAndUpdate(
      { 'currentOrders.orderId': orderId },
      { $set: { 'currentOrders.$.status': status } },
      { new: true }
    );

    if (!scrapBuyer) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', scrapBuyer });
  } catch (error) {
    console.error('Error updating order status in currentOrders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.put("/scrap-buyer/completepickup", async (req, res) => {
  const { id, status, items } = req.body;

  try {
    const updatedOrder = await reCommerceOrders.findOneAndUpdate(
      { Id: id },
      { status: status, items: items },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated to completed", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// POST /api/scrap-orders/update-status
app.post('/api/scrap-orders/update-status', async (req, res) => {
  const { id, status, updatedItems } = req.body;

  try {
    // Find the order by ID and update the status and cart
    const order = await ScrapOrders.findOneAndUpdate(
      { Id: id },
      { 
        $set: { 
          status: status, 
          cart: updatedItems // Update the cart with the updated items
        } 
      },
      { new: true } // Return the updated document
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status and cart updated successfully', order });
  } catch (error) {
    console.error('Error updating order status and cart in scrap_orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post("/startDelivery", async (req, res) => {
  const { id, status } = req.body;

  try {
    const updatedOrder = await reCommerceOrders.findOneAndUpdate(
      { id: id }, // Use the custom id field
      { status: status },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Endpoint to create a new delivery tracking entry
app.post('/api/deliveryTracking', async (req, res) => {
  try {
    const trackingData = req.body;
    const newTracking = new DeliveryTracking(trackingData);
    await newTracking.save();
    res.status(201).send({ message: 'Delivery tracking entry created successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error creating delivery tracking entry', error });
  }
});


// Endpoint to get all delivery tracking entries
app.get('/api/deliveryTracking', async (req, res) => {
  try {
    const trackingEntries = await DeliveryTracking.find();
    res.status(200).send(trackingEntries);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching delivery tracking entries', error });
  }
});


// Update delivery tracking information 
app.post('/deliveryTracking/:trackingId', async (req, res) => {
  try {
    const { deliveryAgentId, status } = req.body;
    const deliveryTracking = await DeliveryTracking.findOneAndUpdate(
      { trackingId: req.params.trackingId },
      { deliveryAgentId, status, updatedAt: Date.now() },
      { new: true }
    );
    res.json(deliveryTracking);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});


// PUT endpoint to assign a delivery agent to a pickup
app.put('/api/pickuptracking/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { deliveryAgentId, status } = req.body;

    // Find the pickup by trackingId
    const pickup = await PickupTracking.findOne({ trackingId });

    if (pickup) {
      // Update the pickup with the new agent ID and status
      pickup.agentId = deliveryAgentId;
      pickup.status = status;

      // Save the updated pickup information
      await pickup.save();

      // Respond with the updated pickup information
      res.status(200).json(pickup);
    } else {
      // If no pickup is found with the given trackingId, respond with a 404
      res.status(404).json({ message: 'Pickup not found' });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get all pickup tracking info
app.get('/api/pickuptracking', async (req, res) => {
  try {
    const pickupTracking = await PickupTracking.find();
    res.json(pickupTracking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new pickup tracking info
app.post('/api/pickuptracking', async (req, res) => {
  const trackingId = `trackingId${Date.now()}`; // Generate a unique trackingId
  const pickupTracking = new PickupTracking({
    trackingId,
    pickupInfo: req.body.pickupInfo,
    agentId: req.body.agentId,
    location: req.body.location,
    status: req.body.status,
    nearestInventoryId: req.body.nearestInventoryId,
    estimatedPickupTime: req.body.estimatedPickupTime,
    actualPickupTime: req.body.actualPickupTime,
  });

  try {
    const newPickupTracking = await pickupTracking.save();
    res.status(201).json(newPickupTracking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// GET all data
app.get('/api/delivery-management', async (req, res) => {
  try {
      const data = await DeliveryManagement.find();
      res.status(200).json(data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// GET by ID
app.get('/api/delivery-management/:id', async (req, res) => {
  try {
      const data = await DeliveryManagement.findById(req.params.id);
      if (!data) {
          return res.status(404).json({ message: 'Data not found' });
      }
      res.status(200).json(data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// POST new data
app.post('/api/delivery-management', async (req, res) => {
  try {
      const newData = new DeliveryManagement(req.body);
      await newData.save();
      res.status(201).json(newData);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// PUT update by ID
app.put('/api/delivery-management/:id', async (req, res) => {
  try {
      const updatedData = await DeliveryManagement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!updatedData) {
          return res.status(404).json({ message: 'Data not found' });
      }
      res.status(200).json(updatedData);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// DELETE by ID
app.delete('/api/delivery-management/:id', async (req, res) => {
  try {
      const deletedData = await DeliveryManagement.findByIdAndDelete(req.params.id);
      if (!deletedData) {
          return res.status(404).json({ message: 'Data not found' });
      }
      res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.post("/completeorder", async (req, res) => {
  const { id, status, items } = req.body;

  try {
    const updatedOrder = await reCommerceOrders.findByIdAndUpdate(
      id,
      { status: status, items: items },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated to completed", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/placeorder", async (req, res) => {
  try {
    if (req.body) {
      const order = new ScrapOrders(req.body);
      await order.save();
      res.status(201).json({ message: "Pickup placed successfully", order });
    } else {
      res.status(400).json({ error: "Invalid request data" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/startpickup", async (req, res) => {
  const { id, status } = req.body;

  try {
    const updatedOrder = await ScrapOrders.findByIdAndUpdate(
      id,
      { status: status },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.status(200).json({ message: "Pickup status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/approvepickup", async (req, res) => {
  const { id, status, items } = req.body;

  try {
    const updatedOrder = await ScrapOrders.findOneAndUpdate(
      { Id: id },
      { status: status, items: items },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.status(200).json({ message: "Pickup status updated to 'pickupApproved'", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.put("/completepickup", async (req, res) => {
  const { id, status, items } = req.body;

  try {
    const updatedOrder = await ScrapOrders.findOneAndUpdate(
      { Id: id }, // Use the custom 'Id' field
      { status: status, cart: items },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.status(200).json({ message: "Pickup status updated to completed", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/getorders", async (req, res) => {
  const { date } = req.query;
  try {
    let orderslist;
    if (date) {
      orderslist = await ScrapOrders.find({ schedulePickup: date });
    } else {
      orderslist = await ScrapOrders.find({});
    }
    res.status(200).json({ orderslist });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Backend: index.js or relevant file
app.get('/getorderbyid/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await ScrapOrders.findOne({ Id: id });
    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/signup", async (req, res) => {
  try {
    const userinfo = new user_info(req.body);
    await userinfo.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const userinfo = await user_info.findOne({ email: req.body.email, password: req.body.password });

    if (userinfo) {
      res.status(200).json({ message: "User logged in successfully" });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});
// Add or update user
app.post('/api/users', async (req, res) => {
  try {
    const { id, name, contactNumber, loginCredentials, pickupHistory, reCommerceOrderHistory, couponsHistory, greenpoints, wallet } = req.body;
    
    let user;
    if (id) {
      user = await User.findOneAndUpdate({ id }, { name, contactNumber, loginCredentials, pickupHistory, reCommerceOrderHistory, couponsHistory, greenpoints, wallet }, { new: true });
    } else {
      user = new User({ id, name, contactNumber, loginCredentials, pickupHistory, reCommerceOrderHistory, couponsHistory, greenpoints, wallet });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error adding/updating user' });
  }
});
// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});
// Profile endpoint
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id, name, contactNumber, pickupHistory,loginCredentials,pickupSavedCart,shoppingSavedCart, reCommerceOrderHistory, couponsHistory, greenpoints, wallet } = user;
    res.json({ id, name, contactNumber, pickupHistory,loginCredentials,pickupSavedCart,shoppingSavedCart, reCommerceOrderHistory, couponsHistory, greenpoints, wallet });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to save shopping cart
app.post('/api/saveCart', authenticateToken, async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.shoppingSavedCart = cart;
    await user.save();

    res.json({ message: 'Cart saved successfully!' });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, age, contactNumber, loginCredentials } = req.body;
    const user = new User({ name, age, contactNumber, loginCredentials });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': username, 'loginCredentials.password': password });
    if (user) {
      const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/addwalletpoints", async (req, res) => {
  try {
    const userinfo = await user_info.findOne({ email: req.body.email });

    if (userinfo) {
      userinfo.wallet += req.body.wallet;
      userinfo.greenpoints += req.body.greenpoints;
      await userinfo.save();

      res.status(200).json({ message: "Wallet points added successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all inventories

app.get('/api/inventories', async (req, res) => {
  try {
    const inventories = await Inventory.find();
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching inventories.' });
  }
});


// get inventory by ID
app.get('/api/inventories/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the inventory.' });
  }
});


//  find by inventory id
app.get('/api/inventoryid/:id', async (req, res) => {
  try {
    // Assuming `id` is a custom field in your inventory schema
    const inventory = await Inventory.findOne({ id: req.params.id });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the inventory.' });
  }
});

// get inventories by type
app.get('/api/inventories/type/:type', async (req, res) => {
  try {
    const inventories = await Inventory.find({ type: req.params.type });
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching inventories.' });
  }
});

//POST Create New Inventory
// app.post('/api/inventories', async (req, res) => {
//   try {
//     const newInventory = new Inventory(req.body);
//     await newInventory.save();
//     res.status(201).json({ message: 'Inventory created successfully', inventory: newInventory });
//   } catch (error) {
//     res.status(400).json({ error: 'An error occurred while creating the inventory.' });
//   }
// });


// Utility function to get a random value from an array
const getRandomValue = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Endpoint to update all products with random inventory data
// app.put('/update-all-products', async (req, res) => {
//   try {
//     // Define the possible values for inventoryId, stockLevel, and thirdPartySellerId
//     const inventoryIds = ['INV002', 'INV003', 'INV005'];
//     const stockLevels = Array.from({ length: 51 }, (_, i) => i + 50); // Generates numbers from 50 to 100
//     const thirdPartySellerIds = ['1', '2', '3', '4', '5', '6'];

//     // Fetch all products from the database
//     const products = await Product.find();

//     // Loop through each product and update the availableAtInventories field
//     for (const product of products) {
//       const randomInventoryData = [];

//       // You can decide how many inventory entries each product should have (e.g., 1 to 3 inventories)
//       const numberOfInventories = Math.floor(Math.random() * 3) + 1;

//       for (let i = 0; i < numberOfInventories; i++) {
//         randomInventoryData.push({
//           inventoryId: getRandomValue(inventoryIds),
//           stockLevel: getRandomValue(stockLevels),
//           thirdPartySellerId: getRandomValue(thirdPartySellerIds)
//         });
//       }

//       // Update the product's availableAtInventories field with the generated random data
//       product.availableAtInventories = randomInventoryData;

//       // Save the updated product back to the database
//       await product.save();
//     }

//     res.status(200).json({ message: 'All products have been updated with random inventory data.' });
//   } catch (error) {
//     console.error('Error updating products:', error);
//     res.status(500).json({ error: 'An error occurred while updating the products.' });
//   }
// });



// POST endpoint to accept an array of inventory objects
app.post('/api/inventories/bulk', async (req, res) => {
  const inventories = req.body;

  if (!Array.isArray(inventories)) {
    return res.status(400).json({ error: 'Expected an array of inventory objects.' });
  }

  let successCount = 0;
  let failureCount = 0;
  let errors = [];

  for (const inventoryData of inventories) {
    try {
      // Validate the 'type' field and required data based on the type
      const { type, scrap, e_commerce, totalCapacity, totalCapacityFilled } = inventoryData;

      if (type === 'scrap' && !scrap) {
        throw new Error("'scrap' data is required for inventory type 'scrap'.");
      }

      if (type === 'e_commerce' && !e_commerce) {
        throw new Error("'e_commerce' data is required for inventory type 'e_commerce'.");
      }

      if (type === 'both') {
        if (!scrap || !e_commerce) {
          throw new Error("'scrap' and 'e_commerce' data are required for inventory type 'both'.");
        }
        if (!totalCapacity || !totalCapacityFilled) {
          throw new Error("'totalCapacity' and 'totalCapacityFilled' are required for inventory type 'both'.");
        }
      }

      // Manually construct the new inventory object
      const newInventory = new Inventory({
        id: inventoryData.id || undefined,
        name: inventoryData.name || undefined,
        inventoryManager: inventoryData.inventoryManager || undefined,
        type: inventoryData.type || undefined,
        location: inventoryData.location || undefined,
        scrap: type === 'scrap' || type === 'both' ? scrap : undefined,
        e_commerce: type === 'e_commerce' || type === 'both' ? e_commerce : undefined,
        totalCapacity: type === 'both' ? totalCapacity : undefined,
        totalCapacityFilled: type === 'both' ? totalCapacityFilled : undefined,
        totalInventoryValue: inventoryData.totalInventoryValue || 0,
        remarks: inventoryData.remarks || undefined,
        lastUpdated: Date.now(), // Automatically set the lastUpdated field
      });

      // Save the new inventory document to the database
      await newInventory.save();
      successCount++;
    } catch (error) {
      console.error('Error creating inventory:', error.message);
      failureCount++;
      errors.push({ inventoryData, error: error.message });
    }
  }

  // Send a summary response
  res.status(201).json({
    message: `Bulk insert operation completed. ${successCount} inventories created successfully, ${failureCount} failed.`,
    errors,
  });
});

// PUT Update an Inventory
app.put('/api/inventories/:id', async (req, res) => {
  try {
    const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedInventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json({ message: 'Inventory updated successfully', inventory: updatedInventory });
  } catch (error) {
    res.status(400).json({ error: 'An error occurred while updating the inventory.' });
  }
});


// DELETE an inventory
app.delete('/api/inventories/:id', async (req, res) => {
  try {
    const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!deletedInventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the inventory.' });
  }
});
// Get all inventory items
app.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory data', error });
  }
});

// Get a specific inventory item by ID
app.get('/inventory/:id', async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory item', error });
  }
});

// Add a new inventory item
app.post('/inventory', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: 'Error adding inventory item', error });
  }
});

// Update an existing inventory item by ID
app.put('/inventory/:id', async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating inventory item', error });
  }
});


app.post('/addcompletedorders', async (req, res) => {
  try {
    const orders = req.body.orders;

    const items = orders.flatMap(order => 
      order.cart.map(item => ({
        itemid: order.Id,
        name: item.name,
        weight: item.quantity,
        price: item.price,
        totalPrice: item.paidAmnt
      }))
    );

    const totalInventoryValue = items.reduce((acc, item) => acc + item.totalPrice, 0);

    const newInventory = new Inventory({
      items,
      category: 'Completed Orders',
      categoryValue: 'completed',
      totalInventoryValue,
      lastUpdated: new Date()
    });

    await newInventory.save();
    res.status(201).json({ message: 'Inventory updated successfully' });
  } catch (error) {
    console.error("Error adding completed orders to inventory:", error);
    res.status(500).json({ message: 'Error adding completed orders to inventory', error });
  }
});


// Add this endpoint to the existing backend code
app.get('/getinventory', async (req, res) => {
  try {
    const inventoryData = await Inventory.find();
    res.status(200).json({ inventory: inventoryData });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/addPurchasedVoucher", async (req, res) => {
  try {
    const { orderId, name, price, dateOfPurchase, expiryDate } = req.body;
    const voucher = {
      id: orderId,
      name,
      price,
      dateOfPurchase,
      expiryDate,
      status: "Not Redeemed"
    };

    let order = await  reCommerceOrders.findById(orderId);

    if (order) {
      order.giftCards.push(voucher);
      order.totalPrice = voucher.price; // Ensure totalPrice is updated
    } else {
      order = new  reCommerceOrders({
        _id: orderId,
        giftCards: [voucher],
        name: "teja",
        contact: "9390438443",
        cart: [],
        location: "zxcvbnLatLng(17.520491, 78.389196)",
        date: new Date().toLocaleDateString(),
        totalPrice: price, // Set the totalPrice field
        status: "Not Redeemed",
      });
    }

    await order.save();
    res.status(201).json({ message: "Purchased voucher added successfully", order });
  } catch (error) {
    console.error("Error adding purchased voucher:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getPurchasedVouchers", async (req, res) => {
  try {
    const vouchers = await reCommerceOrders.find({}, 'giftCards');
    const allVouchers = vouchers.reduce((acc, order) => {
      return acc.concat(order.giftCards.map(voucher => ({
        orderId: order._id,
        ...voucher
      })));
    }, []);
    res.status(200).json({ vouchers: allVouchers });
  } catch (error) {
    console.error("Error fetching purchased vouchers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Endpoint to update wallet balance
app.post('/api/updateWallet', authenticateToken, async (req, res) => {
  try {
    const { wallet } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.wallet = wallet;
    await user.save();
    res.status(200).json({ message: 'Wallet balance updated successfully', wallet: user.wallet });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint to update green points
app.post('/api/updateGreenPoints', authenticateToken, async (req, res) => {
  try {
    const { greenpoints } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.greenpoints = greenpoints;
    await user.save();
    res.status(200).json({ message: 'Green points updated successfully', greenpoints: user.greenpoints });
  } catch (error) {
    console.error('Error updating green points:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get PickUP-order status
app.get('/api/order-status/:Id', authenticateToken, async (req, res) => {
  const { Id } = req.params;
  try {
    const order = await ScrapOrders.findOne({ Id: Id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete PickUP-order status
app.delete('/api/order/:Id', authenticateToken, async (req, res) => {
  const { Id } = req.params;
  try {
    const deletedOrder = await ScrapOrders.findOneAndDelete({ Id: Id });
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/updateReCommerceOrderHistory', authenticateToken, async (req, res) => {
  try {
    const { id, totalPrice, date, greenpoints } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.reCommerceOrderHistory.push({ id, totalPrice, date, greenpoints });
    await user.save();
    res.status(200).json({ message: 'ReCommerce order history updated successfully' });
  } catch (error) {
    console.error('Error updating reCommerce order history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/updatePickupHistory', authenticateToken, async (req, res) => {
  try {
    const { id, cart } = req.body;
    const user = await User.findOne({ 'loginCredentials.username': req.user.username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.pickupHistory.push({ id, cart });
    await user.save();
    res.status(200).json({ message: 'Pickup history updated successfully' });
  } catch (error) {
    console.error('Error updating pickup history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
