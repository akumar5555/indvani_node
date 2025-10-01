require('dotenv').config();

const http = require("https");
const fs = require('fs');
const getUploadHandler = require(appRoot + '/utils/multerConfig');
const appmdl = require('../model/mainModel');
const { body, validationResult } = require('express-validator');
const express = require('express');



// Login Controller
exports.loginCtrl = function (req, res) {
    var dataarr = req.body;

    // Call the model to verify username and password
    appmdl.loginMdl(dataarr, function (err, user) {
        if (err) {
            console.error("Error in loginMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (user) {
            // Login successful, return user details
            res.status(200).send({
                status: 200,
                msg: "Login successful",
                data: user
            });
        } else {
            // No user found or password doesn't match
            res.status(400).send({ status: 401, msg: "Invalid username or password" });
        }
    });
};
// Customer management
exports.createCustomerCtrl = function (req, res) {
  const data = req.body;

  // Basic validation
  if (!data.name || !data.phone) {
    return res.status(400).send({
      status: 400,
      msg: "Missing required fields: name or phone"
    });
  }

  // Prepare sanitized data
  const customerData = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    address: data.address?.trim() || null
  };

  appmdl.createCustomerMdl(customerData, function (err, result) {
    if (err) {
      console.error("Error inserting customer:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      message: "Customer created successfully",
      customer_id: result?.[0]?.id || null
    });
  });
};

exports.customerdetailsCtrl = function (req, res) {
    console.log("Received GET request with body:", req.body);

    // You may need to process data from req.body if needed
    var dataarr = req.body;

    appmdl.customerdetailsMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in customerdetailsMdl:", err);
            res.status(500).send({ "status": 500, "msg": "Server Error" });
            return;
        }

        console.log("Query results:", results);
        if (results.length > 0) {
            res.status(200).send({ 'status': 200, "msg": "Customer Details Retrieves Successfully...", 'data': results });
        } else {
            res.status(300).send({ 'status': 300, 'data': [] });
        }
    });
}

exports.customerByidCtrl = function (req, res) {
    console.log("Received POST request with body:", req.body);

    var dataarr = req.query;

    // Call the model to get customer and proposal details
    appmdl.customerByidMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in customerByidMdl:", err);
            return res.status(500).send({ "status": 500, "msg": "Server Error" });
        }

         if (results.length > 0) {
            res.status(200).send({ 'status': 200, "msg": "Customer Details Retrieves Successfully...", 'data': results });
        } else {
            res.status(300).send({ 'status': 300, 'data': [] });
        }
    });
};
exports.customerdetailsByRunnerIdCtrl = function (req, res) {
    console.log("Received GET request for customer details by runner ID with query:", req.query);

    const dataarr = req.query;

    // Validate that runner_id is provided
    if (!dataarr.runner_id) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Missing required parameter: runner_id" 
        });
    }

    appmdl.customerdetailsByRunnerIdMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in customerdetailsByRunnerIdMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (results.length > 0) {
            res.status(200).send({ 
                'status': 200, 
                "msg": "Customer Details Retrieved Successfully...", 
                'data': results 
            });
        } else {
            res.status(300).send({ 
                'status': 300, 
                'msg': 'No customers found for this runner',
                'data': [] 
            });
        }
    });
};

// status 

exports.statusdetailsCtrl = function (req, res) {
  appmdl.getStatusesMdl(function (err, results) {
    if (err) {
      console.error("Error fetching statuses:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    if (results.length > 0) {
      res.status(200).send({
        status: 200,
        msg: "Statuses fetched successfully",
        data: results
      });
    } else {
      res.status(204).send({ status: 204, msg: "No statuses found", data: [] });
    }
  });
};

//runner 

exports.runnerdetailsCtrl = function (req, res) {
  // Assuming no params needed, if needed you can adjust
  appmdl.runnerdetailsMdl(function (err, results) {
    if (err) {
      console.error("Error fetching runner details:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).send({
        status: 200,
        msg: "Runner details fetched successfully",
        data: results
      });
    } else {
      return res.status(204).send({ status: 204, msg: "No runner details found", data: [] });
    }
  });
};

exports.runnerdetailsByIdCtrl = function (req, res) {
    console.log("Received GET request for runner by ID with query:", req.query);

    const dataarr = req.query;

    // Validate that runner_id is provided
    if (!dataarr.runner_id) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Missing required parameter: runner_id" 
        });
    }

    appmdl.runnerdetailsByIdMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in runnerdetailsByIdMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (results.length > 0) {
            res.status(200).send({
                status: 200,
                msg: "Runner details retrieved successfully",
                data: results[0] // Return single object since we're querying by ID
            });
        } else {
            res.status(404).send({ 
                status: 404, 
                msg: "Runner not found", 
                data: null 
            });
        }
    });
};

exports.runnerdetailsByMobileCtrl = function (req, res) {
    console.log("Received GET request for runner by mobile with query:", req.query);

    const dataarr = req.query;

    // Validate that Runner Mobile parameter is provided
    if (!dataarr.phone) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Missing required parameter: Runner Mobile" 
        });
    }

    // Basic phone number validation
    const mobile = dataarr.phone.trim();
    if (mobile.length < 10) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Invalid mobile number format" 
        });
    }

    appmdl.runnerdetailsByMobileMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in runnerdetailsByMobileMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (results.length > 0) {
            res.status(200).send({
                status: 200,
                msg: "Runner details retrieved successfully",
                data: results[0]
            });
        } else {
            res.status(404).send({ 
                status: 404, 
                msg: "Runner not found with this mobile number", 
                data: null 
            });
        }
    });
};

// orders

exports.orderCustomerdetailsCtrl = function (req, res) {
    console.log("Received GET request with body:", req.body);

    // You may need to process data from req.body if needed
    var dataarr = req.body;

    appmdl.orderCustomerdetailsMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in orderCustomerdetailsMdl:", err);
            res.status(500).send({ "status": 500, "msg": "Server Error" });
            return;
        }

        console.log("Query results:", results);
        if (results.length > 0) {
            res.status(200).send({ 'status': 200, "msg": "Customer Details Retrieves Successfully...", 'data': results });
        } else {
            res.status(300).send({ 'status': 300, 'data': [] });
        }
    });
}

exports.scheduleBulkCtrl = function (req, res) {
    dataarr = req.body
 const customer_ids = dataarr.customer_ids;

if (!Array.isArray(dataarr.customer_ids) || dataarr.customer_ids.length === 0) {
return res.status(400).json({ error: 'customer_ids must be a non-empty array' });
}

appmdl.scheduleBulkMdl(dataarr, function (err, result) {
if (err) {
console.error('Error scheduling customers:', err);
return res.status(500).json({ error: 'Failed to schedule customer events' });
}
res.status(200).json({
  message: 'Customers scheduled successfully',
  inserted_count: customer_ids.length,
})
})
}

exports.assignRunnerCtrl = function (req, res) {
    const dataarr = req.body;

    if (!Array.isArray(dataarr.ids) || !dataarr.runner_id) {
        return res.status(400).send({ status: 400, msg: "Missing runner_id or ids array" });
    }

    appmdl.assignRunnerMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in Assign Runner", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({ message: 'Runner updated for selected visits' });
    });
};

exports.postWeightCategoriesCtrl = function (req, res) {
    const data = req.body;

    if ( !data.weight_in_grams) {
        return res.status(400).send({ status: 400, msg: "Missing required field: weight_in_grams" });
    }

    appmdl.postWeightCategoriesMdl(data, function (err, results) {
        if (err) {
            console.error("Error in Insert Weight Category", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({ message: 'Weight category inserted successfully' });
    });
};

exports.getWeightCategoriesCtrl = function (req, res) {
    appmdl.getWeightCategoriesMdl(function (err, results) {
        if (err) {
            console.error("Error fetching weight categories:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({
            status: 200,
            msg: "Weight categories fetched successfully",
            data: results
        });
    });
};

exports.deleteWeightCategoriesCtrl = function (req, res) {
    const data = req.body;

    if (!data.id) {
        return res.status(400).send({ status: 400, msg: "Missing weight category id" });
    }

    appmdl.deleteWeightCategoriesMdl(data, function (err, results) {
        if (err) {
            console.error("Error deleting weight category:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({ message: 'Weight category deleted Successfully...' });
    });
};

exports.deleteGiftsCtrl_WIP = function (req, res) {
    const data = req.body;

    if (!data.id) {
        return res.status(400).send({ status: 400, msg: "Missing weight category id" });
    }

    appmdl.deleteWeightCategoriesMdl(data, function (err, results) {
        if (err) {
            console.error("Error deleting weight category:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({ message: 'Weight category deleted Successfully...' });
    });
};
//order

exports.postOrderCtrl = function (req, res) {
  const data = req.body;

  if (!data.customer_id || !data.phone_number) {
    return res.status(400).send({ status: 400, msg: "Missing required fields" });
  }

  appmdl.postOrderMdl(data, function (err, results) {
    if (err) {
      if (err.status === 400) {
        return res.status(400).send({ status: 400, msg: err.message });
      }

      console.error("Error inserting order:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      message: "Order inserted successfully",
      data: results
    });
  });
};

// exports.postOrderCtrl = function (req, res) {
//     const data = req.body;

//     // Basic required validation (add more as needed)
//     if (!data.customer_id || !data.phone_number) {
//         return res.status(400).send({ status: 400, msg: "Missing required fields" });
//     }

//     appmdl.postOrderMdl(data, function (err, results) {
//         if (err) {
//             console.error("Error inserting order:", err);
//             return res.status(500).send({ status: 500, msg: "Server Error" });
//         }

//         return res.status(200).json({ message: "Order inserted successfully", data: results });
//     });
// };

exports.assignRunnerCtrl = function (req, res) {
    const data = req.body;

    if (!data.order_id || !data.runner_id) {
        return res.status(400).send({ status: 400, msg: "Missing order_id or runner_id" });
    }

    // Normalize to array even if single ID
    const orderIds = Array.isArray(data.order_id) ? data.order_id : [data.order_id];

    appmdl.assignRunnerMdl({ runner_id: data.runner_id, order_ids: orderIds }, function (err, results) {
        if (err) {
            console.error("Error assigning runner:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({
            message: "Runner assigned successfully",
            updated_orders: results
        });
    });
};

//post gifts
exports.insertGiftCtrl = function (req, res) {
  const upload = getUploadHandler("gift_images");

  upload(req, res, function (err) {
    if (err) {
      console.error("Gift image upload error:", err);
      return res.status(500).json({ status: 500, msg: "Gift image upload failed" });
    }

    const data = req.body;
    const description = req.body.description;
const image_url = `${req.protocol}://${req.get("host")}/uploads/gift_images/${req.file.filename}`;
    //const image_url = req.file?.filename;

    if (!data.name || !data.sale_price || !image_url) {
      return res.status(400).send({ status: 400, msg: "Missing required fields" });
    }

    const giftData = [
      data.name,
      data.description || '',
      image_url,
      //data.weight_category_id,
      data.sale_price
    ];

    appmdl.insertGiftMdl(giftData, function (err, results) {
      if (err) {
        console.error("Gift insert error:", err);
        return res.status(500).send({ status: 500, msg: "Server Error" });
      }

      return res.status(200).json({
        message: "Gift inserted successfully",
        gift_id: results[0].id,
        image_url: `${image_url}`
      });
    });
  });
};

exports.getGiftsCtrl = function (req, res) {
    appmdl.getGiftsMdl(function (err, results) {
        if (err) {
            console.error("Error fetching Gifts:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({
            status: 200,
            msg: "Gift Details fetched successfully",
            data: results
        });
    });
};

exports.deleteGiftsCtrl = function (req, res) {
    const data = req.body;

    if (!data.gift_id) {
        return res.status(400).send({ status: 400, msg: "Missing gift id" });
    }

    appmdl.deleteGiftsMdl(data, function (err, results) {
        if (err) {
            console.error("Error deleting Gifts:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        return res.status(200).json({ message: 'Gifts deleted Successfully...' });
    });
};
//gifts stock add
exports.insertGiftStockCtrl = function (req, res) {
  const data = req.body;

  if (!data.gift_id || !data.quantity_added || !data.price) {
    return res.status(400).send({ status: 400, msg: "Missing required fields" });
  }

  const stockData = [data.gift_id, data.quantity_added, data.price];

  appmdl.insertGiftStockMdl(stockData, function (err, results) {
    if (err) {
      console.error("Error inserting gift stock:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      status: 200,
      message: "Gift stock added successfully",
      data: results,
    });
  });
};


//upload collection image
exports.updateCollectionCtrl = function (req, res) {
  const upload = getUploadHandler("collection_images");

  upload(req, res, function (err) {
    if (err) {
      console.error("Collection image upload error:", err);
      return res.status(500).json({ status: 500, msg: "Collection image upload failed" });
    }
    
    const { order_id } = req.body;
     const description = req.body.description;
     const collection_gin = JSON.stringify(req.body.collection_gin);
const image_url = `${req.protocol}://${req.get("host")}/uploads/collection_images/${req.file.filename}`;
    //const image_url = req.file?.filename;

    if (!order_id || !image_url) {
      return res.status(400).send({ status: 400, msg: "Missing order_id or image" });
    }

    const data = { order_id, image_url,collection_gin };

    appmdl.updateCollectionMdl(data, function (err, result) {
      if (err) {
        console.error("Collection update DB error:", err);
        return res.status(500).send({ status: 500, msg: "Update failed" });
      }

      return res.status(200).json({
        message: "Collection image updated successfully",
        image_url: `${image_url}`
      });
    });
  });
};

