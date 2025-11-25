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

exports.customerAssignDtlsCtrl = function (req, res) {
    console.log("Received GET request with body:", req.body);

    // You may need to process data from req.body if needed
    var dataarr = req.body;

    appmdl.customerAssignDtlsMdl(dataarr, function (err, results) {
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
exports.updateCustomerStatusByIdCtrl = function (req, res) {
    console.log("Received POST request to update customer status with body:", req.body);

    const dataarr = req.body;

    // Validate required parameters
    if (!dataarr.customer_id) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Missing required parameter: customer_id" 
        });
    }

    if (!dataarr.status) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Missing required parameter: status" 
        });
    }

    // Validate status is a number
    const status = parseInt(dataarr.status);
    const customerId = parseInt(dataarr.customer_id);
    console.log("Parsed status:", status, "Parsed customer_id:", customerId);
    if (isNaN(status)) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Invalid status value" 
        });
    }

    if (isNaN(customerId)) {
        return res.status(400).send({ 
            status: 400, 
            msg: "Invalid customer_id value" 
        });
    }

    appmdl.updateCustomerStatusByIdMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in updateCustomerStatusByIdMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (results && results.length > 0) {
            res.status(200).send({ 
                status: 200, 
                msg: "Customer status updated successfully", 
                data: results[0] 
            });
        } else {
            res.status(404).send({ 
                status: 404, 
                msg: 'Customer not found or no changes made',
                data: null 
            });
        }
    });
};
// exports.updateCustomerOrderStatusCtrl = function (req, res) {
//     console.log("Received POST:", req.body);

//     const dataarr = req.body;

//     // Validate required fields
//     if (!dataarr.order_id) {
//         return res.status(400).send({
//             status: 400,
//             msg: "Missing required parameter: order_id"
//         });
//     }

//     if (!dataarr.status) {
//         return res.status(400).send({
//             status: 400,
//             msg: "Missing required parameter: status"
//         });
//     }

//     const order_id = parseInt(dataarr.order_id);
//     if (isNaN(order_id)) {
//         return res.status(400).send({
//             status: 400,
//             msg: "Invalid order_id value"
//         });
//     }

//     appmdl.updateCustomerOrderStatusMdl(dataarr, function (err, results) {
//         if (err) {
//             console.error("Error updating order:", err);
//             return res.status(500).send({ status: 500, msg: "Server Error" });
//         }

//         if (results && results.length > 0) {
//             return res.status(200).send({
//                 status: 200,
//                 msg: "Order status updated successfully",
//                 data: results[0]
//             });
//         } else {
//             return res.status(404).send({
//                 status: 404,
//                 msg: "Order not found or no changes made",
//                 data: null
//             });
//         }
//     });
// };

// status 
exports.updateCustomerOrderStatusCtrl = function (req, res) {
    appmdl.updateCustomerOrderStatusMdl(req.body, function (err, data) {
        if (err) {
            console.error("❌ Controller Error:", err);
            return res.status(500).send({ status: 0, message: err.message });
        }

        return res.status(200).send({
            msg: "Order status updated successfully",
            data: data
        });
    });
};

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
exports.activeRunnerDtlsCtrl = function (req, res) {
  // Assuming no params needed, if needed you can adjust
  appmdl.activeRunnerDtlsMdl(function (err, results) {
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
// exports.insertCustomerdetailsCtrl = function (req, res) {
//   const upload = getUploadHandler("hair_images").array("hair_images", 5);

//   upload(req, res, function (err) {
//     if (err) {
//       console.error("Hair image upload error:", err);
//       return res.status(500).json({ status: 500, msg: "Image upload failed" });
//     }

//     const dataarr = req.body;
//     console.log("Received POST request:", dataarr);

//     // ✅ Validate required params
//     const requiredFields = ["customer_id", "runner_id", "payment_mode", "total_earnings"];
//     for (let field of requiredFields) {
//       if (!dataarr[field]) {
//         return res.status(400).send({ status: 400, msg: `Missing parameter: ${field}` });
//       }
//     }

//     // ✅ Validate payment mode
//     const validModes = ["cash", "items", "mixed"];
//     if (!validModes.includes(dataarr.payment_mode)) {
//       return res.status(400).send({
//         status: 400,
//         msg: "Invalid payment_mode. Must be: cash, items, or mixed"
//       });
//     }

//     // ✅ Handle hair image uploads / existing URLs
//     let hairImageUrls = [];

//     if (req.files && req.files.length > 0) {
//       // Uploaded new images
//       hairImageUrls = req.files.map(
//         (file) => `${req.protocol}://${req.get("host")}/uploads/hair_images/${file.filename}`
//       );
//     } else if (dataarr.hair_images) {
//       // Received pre-existing image info from frontend
//       try {
//         const parsed = Array.isArray(dataarr.hair_images)
//           ? dataarr.hair_images
//           : JSON.parse(dataarr.hair_images);

//         // Keep only valid URLs (not null, undefined, or empty)
//         hairImageUrls = parsed.filter((img) => img && img !== "null" && img !== "undefined");
//       } catch (e) {
//         console.warn("Invalid hair_images format:", dataarr.hair_images);
//         hairImageUrls = [];
//       }
//     }

//     // ✅ Calculate remaining amount safely
//     const totalEarnings = parseFloat(dataarr.total_earnings) || 0;
//     const cartTotal = parseFloat(dataarr.cart_total) || 0;
//     const cashAmount = parseFloat(dataarr.cash_amount) || 0;

//     const remainingAmount = totalEarnings - (cartTotal + cashAmount);

//     // ✅ Build final order data
//     const orderData = {
//       customer_id: parseInt(dataarr.customer_id),
//       runner_id: parseInt(dataarr.runner_id),
//       payment_mode: dataarr.payment_mode,
//       total_earnings: totalEarnings,
//       cart_total: cartTotal,
//       remaining_amount: remainingAmount >= 0 ? remainingAmount : 0,
//       cash_amount: cashAmount,

//       // Hair details
//       black_hair_weight: parseFloat(dataarr.black_hair_weight) || 0,
//       grey_hair_weight: parseFloat(dataarr.grey_hair_weight) || 0,
//       black_hair_price: parseFloat(dataarr.black_hair_price) || 0,
//       grey_hair_price: parseFloat(dataarr.grey_hair_price) || 0,
//       total_hair_price: parseFloat(dataarr.total_hair_price) || 0,

//       // Product data
//       products_json: dataarr.products_json
//         ? JSON.parse(dataarr.products_json)
//         : [],

//       // ✅ Image arrays
//       hair_images: hairImageUrls,
//       receipt_images: dataarr.receipt_images || [],

//       // Status
//       status: dataarr.status || "delivered",
//     };

//     // ✅ Sanity check: prevent NaN insertion
//     for (const [key, value] of Object.entries(orderData)) {
//       if (typeof value === "number" && isNaN(value)) {
//         orderData[key] = 0;
//       }
//     }

//     console.log("Final order data to insert:", orderData);

//     // ✅ Insert order into DB
//     appmdl.insertOrderMdl(orderData, function (err, results) {
//       if (err) {
//         console.error("DB Error in insertOrderMdl:", err);
//         return res.status(500).send({ status: 500, msg: "Server Error" });
//       }

//       if (results?.length > 0) {
//         return res.status(201).send({
//           status: 201,
//           msg: "Order created successfully",
//           data: results[0],
//         });
//       }

//       res.status(500).send({
//         status: 500,
//         msg: "Failed to create order",
//         data: null,
//       });
//     });
//   });
// };


// exports.insertCustomerdetailsCtrl = function (req, res) {
//     console.log("Received POST request to create order with body:", req.body);

//     const dataarr = req.body;

//     // Validate required parameters
//     const requiredFields = ['customer_id', 'runner_id', 'payment_mode', 'total_earnings'];
//     for (let field of requiredFields) {
//         if (!dataarr[field]) {
//             return res.status(400).send({ 
//                 status: 400, 
//                 msg: `Missing required parameter: ${field}` 
//             });
//         }
//     }

//     // Validate payment_mode
//     const validPaymentModes = ['cash', 'items', 'mixed'];
//     if (!validPaymentModes.includes(dataarr.payment_mode)) {
//         return res.status(400).send({ 
//             status: 400, 
//             msg: "Invalid payment_mode. Must be: cash, items, or mixed" 
//         });
//     }

//     // Calculate remaining_amount
//     const remaining_amount = parseFloat(dataarr.total_earnings) - parseFloat(dataarr.cart_total) - (parseFloat(dataarr.cash_amount) || 0);

//     // Prepare order data
//     const orderData = {
//         customer_id: parseInt(dataarr.customer_id),
//         runner_id: parseInt(dataarr.runner_id),
//         payment_mode: dataarr.payment_mode,
//         total_earnings: parseFloat(dataarr.total_earnings),
//         cart_total: parseFloat(dataarr.cart_total)|| 0,
//         remaining_amount: remaining_amount || 0,
//         cash_amount: parseFloat(dataarr.cash_amount) || 0,
        
//         // Hair details
//         black_hair_weight: parseFloat(dataarr.black_hair_weight) || 0,
//         grey_hair_weight: parseFloat(dataarr.grey_hair_weight) || 0,
//         black_hair_price: parseFloat(dataarr.black_hair_price) || 0,
//         grey_hair_price: parseFloat(dataarr.grey_hair_price) || 0,
//         total_hair_price: parseFloat(dataarr.total_hair_price) || 0,
        
//         // Products JSON
//         products_json: dataarr.products_json || [],
        
//         // File uploads
//         hair_images: dataarr.hair_images || [],
//         receipt_images: dataarr.receipt_images || [],
        
//         // Status
//         status: dataarr.status || 'delivered'
//     };

//     // Validate hair details if provided
//     if (orderData.black_hair_weight < 0 || orderData.grey_hair_weight < 0) {
//         return res.status(400).send({ 
//             status: 400, 
//             msg: "Hair weight cannot be negative" 
//         });
//     }

//     appmdl.insertOrderMdl(orderData, function (err, results) {
//         if (err) {
//             console.error("Error in insertOrderMdl:", err);
//             return res.status(500).send({ status: 500, msg: "Server Error" });
//         }

//         if (results && results.length > 0) {
//             res.status(201).send({ 
//                 status: 201, 
//                 msg: "Order created successfully", 
//                 data: results[0] 
//             });
//         } else {
//             res.status(500).send({ 
//                 status: 500, 
//                 msg: 'Failed to create order',
//                 data: null 
//             });
//         }
//     });
// };

exports.insertCustomerdetailsCtrl = function (req, res) {
    const upload = getUploadHandler("hair_images");

    upload(req, res, function (err) {
        if (err) {
            console.error("Hair image upload error:", err);
            return res.status(500).json({ status: 500, msg: "Hair image upload failed" });
        }

        const dataarr = req.body;
        console.log("Received POST body:", dataarr);
        console.log("Received file:", req.file);

        // Check if file was uploaded
        const uploadedHairImages = req.file 
            ? `${req.protocol}://${req.get("host")}/uploads/hair_images/${req.file.filename}`
            : null;

        // Required fields
        const requiredFields = ['customer_id', 'runner_id', 'payment_mode', 'total_earnings'];
        for (let field of requiredFields) {
            if (!dataarr[field]) {
                return res.status(400).send({
                    status: 400,
                    msg: `Missing required parameter: ${field}`
                });
            }
        }

        // Validate payment mode
        const validModes = ['cash', 'items', 'mixed'];
        if (!validModes.includes(dataarr.payment_mode)) {
            return res.status(400).send({
                status: 400,
                msg: "Invalid payment_mode. Must be: cash, items, or mixed"
            });
        }

        // Parse products_json if it's a string
        let productsJson = [];
        if (dataarr.products_json) {
            try {
                // If it's already a string, parse it to get the actual array
                productsJson = typeof dataarr.products_json === 'string' 
                    ? JSON.parse(dataarr.products_json) 
                    : dataarr.products_json;
                
                // Validate it's an array
                if (!Array.isArray(productsJson)) {
                    console.error("products_json is not an array:", productsJson);
                    productsJson = [];
                }
            } catch (e) {
                console.error("Error parsing products_json:", e);
                return res.status(400).send({
                    status: 400,
                    msg: "Invalid products_json format"
                });
            }
        }

        console.log("Parsed products_json:", productsJson);

        // Validate products_json structure (only if not empty)
        if (Array.isArray(productsJson) && productsJson.length > 0) {
            for (let product of productsJson) {
                if (!product.product_id || !product.product_name || 
                    !product.product_price || !product.quantity || !product.total_price) {
                    return res.status(400).send({
                        status: 400,
                        msg: "Invalid product structure in products_json. Required: product_id, product_name, product_price, quantity, total_price"
                    });
                }
            }
        }

        // // Parse receipt_images
        // let receiptImages = [];
        // if (dataarr.receipt_images) {
        //     try {
        //         receiptImages = typeof dataarr.receipt_images === 'string' 
        //             ? JSON.parse(dataarr.receipt_images) 
        //             : dataarr.receipt_images;
                
        //         if (!Array.isArray(receiptImages)) {
        //             receiptImages = [];
        //         }
        //     } catch (e) {
        //         console.error("Error parsing receipt_images:", e);
        //         receiptImages = [];
        //     }
        // }

        // // Parse hair_images
        // let hairImages = [];
        // if (dataarr.hair_images) {
        //     try {
        //         hairImages = typeof dataarr.hair_images === 'string' 
        //             ? JSON.parse(dataarr.hair_images) 
        //             : dataarr.hair_images;
                
        //         if (!Array.isArray(hairImages)) {
        //             hairImages = [];
        //         }
        //     } catch (e) {
        //         console.error("Error parsing hair_images:", e);
        //         hairImages = [];
        //     }
        // }

        // Calculate remaining amount
        const totalEarnings = parseFloat(dataarr.total_earnings) || 0;
        const cartTotal = parseFloat(dataarr.cart_total) || 0;
        const cashAmount = parseFloat(dataarr.cash_amount) || 0;
        const remaining_amount = totalEarnings - cartTotal - cashAmount;

        // Prepare final order object - Pass arrays directly, NOT stringified
        const orderData = {
            customer_id: parseInt(dataarr.customer_id),
            runner_id: parseInt(dataarr.runner_id),
            payment_mode: dataarr.payment_mode,
            total_earnings: totalEarnings,
            cart_total: cartTotal,
            remaining_amount: remaining_amount,
            cash_amount: cashAmount,

            black_hair_weight: parseFloat(dataarr.black_hair_weight) || 0,
            grey_hair_weight: parseFloat(dataarr.grey_hair_weight) || 0,
            black_hair_price: parseFloat(dataarr.black_hair_price) || 0,
            grey_hair_price: parseFloat(dataarr.grey_hair_price) || 0,
            total_hair_price: parseFloat(dataarr.total_hair_price) || 0,

            // Pass as array - model will handle stringification
            products_json: productsJson,

            // Use uploaded hair image
            hair_photo_url: uploadedHairImages,

            // Pass as arrays - model will handle stringification
            // receipt_images: receiptImages,
            // hair_images: hairImages,

            status: dataarr.status || 'Waiting for approval'
        };

        console.log("Prepared order data:", JSON.stringify(orderData, null, 2));

        appmdl.insertOrderMdl(orderData, function (err, results) {
            if (err) {
                console.error("insertOrderMdl error:", err);
                return res.status(500).send({ 
                    status: 500, 
                    msg: "Server Error",
                    error: err.message 
                });
            }

            if (results?.length > 0) {
                res.status(200).send({
                    status: 200,
                    msg: "Order created successfully",
                    images: uploadedHairImages,
                    data: results[0]
                });
            } else {
                res.status(500).send({
                    status: 500,
                    msg: "Failed to create order"
                });
            }
        });
    });
};


exports.orderCustomerdetailsCtrl = function (req, res) {
    console.log("Received GET request for order customer details with query:", req.query);

    appmdl.orderCustomerdetailsMdl(function (err, results) {
        if (err) {
            console.error("Error in orderCustomerdetailsMdl:", err);
            return res.status(500).send({ status: 500, msg: "Server Error" });
        }

        if (results.length > 0) {
            res.status(200).send({ 
                'status': 200, 
                "msg": "Order details retrieved successfully", 
                'data': results 
            });
        } else {
            res.status(404).send({ 
                'status': 404, 
                'msg': 'No orders found',
                'data': [] 
            });
        }
    });
};

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

// exports.assignRunnerToCustCtrl = async function (req, res) {
//   const dataarr = req.body;
//   console.log("Assign Runner Request Body:", dataarr);
  
//   if (!dataarr.status || !dataarr.runner_id || !dataarr.customer_id) {
//     return res.status(400).send({ status: 400, msg: "Missing runner_id or status or customer_id" });
//   }

//   try {
//     // Wrap the callback-based function in a Promise
//     const result = await new Promise((resolve, reject) => {
//       appmdl.assignRunnerToCustMdl(dataarr, (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(results);
//         }
//       });
//     });

//     return res.status(200).json({ 
//       status: 200,
//       message: 'Runner Assigned Successfully', 
//       data: result 
//     });
//   } catch (err) {
//     console.error("Error in Assign Runner:", err);
//     return res.status(500).send({ status: 500, msg: "Server Error" });
//   }
// };

exports.assignRunnerToCustCtrl = function (req, res) {
  const data = req.body;
  console.log("📦 Assign Runner Request Body:", data);

  // ✅ Validation
  if (!data.runner_id || (!data.customer_id && !Array.isArray(data.customer_ids))) {
    return res.status(400).send({
      status: 400,
      msg: "Missing runner_id or customer_id(s)"
    });
  }

  // Call model
  appmdl.assignRunnerToCustMdl(data, function (err, results) {
    if (err) {
      console.error("❌ Error in Assign Runner:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      status: 200,
      message: "✅ Runner assigned successfully",
      data: results
    });
  });
};

exports.changeRunnerToCustCtrl = function (req, res) {
  const data = req.body;
  console.log("📦 Assign Runner Request Body:", data);

  // ✅ Validation
  if (!data.runner_id || (!data.customer_id && !Array.isArray(data.customer_ids))) {
    return res.status(400).send({
      status: 400,
      msg: "Missing runner_id or customer_id(s)"
    });
  }

  // Call model
  appmdl.changeRunnerToCustMdl(data, function (err, results) {
    if (err) {
      console.error("❌ Error in Assign Runner:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      status: 200,
      message: "✅ Runner assigned successfully",
      data: results
    });
  });
};
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

exports.updateGiftPriceCtrl = function (req, res) {
  const data = req.body;

  if (!data.gift_id || !data.sale_price) {
    return res.status(400).send({
      status: 400,
      msg: "Missing required fields: gift_id or sale_price",
    });
  }

  const giftData = [
    data.gift_id,
    data.sale_price
  ];

  appmdl.updateGiftPriceMdl(giftData, function (err, results) {
    if (err) {
      console.error("Gift Price Update error:", err);
      return res.status(500).send({
        status: 500,
        msg: "Server Error",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Gift Price updated successfully",
      gift_id: results[0].id,
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

//runner
exports.postRunnerDetailsCtrl = function (req, res) {
  const data = req.body;

  // Basic validation
  if (!data.name || !data.phone) {
    return res.status(400).send({
      status: 400,
      msg: "Missing required fields: name or phone"
    });
  }

  // Prepare sanitized data
  const runnerData = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    status: data.status?.trim() || 'active',
    password: data.password?.trim() || '1234',
    role: data.role?.trim(),
    location: data.location?.trim() || 0
  };

  appmdl.postRunnerDetailsMdl(runnerData, function (err, result) {
    if (err) {
      console.error("Error inserting runner:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      message: "Runner created successfully",
      runner_id: result?.[0]?.id || null
    });
  });
};

exports.updateRunnerByIdCtrl = function (req, res) {
  const data = req.body;

  // Basic validation
  if (!data.id) {
    return res.status(400).send({
      status: 400,
      msg: "Missing required field: id"
    });
  }

  // Prepare sanitized data
  const updateData = {
    id: parseInt(data.id),
    name: data.name?.trim() || '',
    phone: data.phone?.trim() || '',
    email: data.email?.trim() || '',
    status: data.status?.trim() || 'active'
  };

  appmdl.updateRunnerByIdMdl(updateData, function (err, result) {
    if (err) {
      console.error("Error updating runner:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    if (!result || result.length === 0) {
      return res.status(404).send({ status: 404, msg: "Runner not found" });
    }

    return res.status(200).json({
      message: "Runner details updated successfully",
      runner: result[0]
    });
  });
};

exports.getMastersCtrl = function (req, res) {
  const masterId = req.query.id; // optional

  appmdl.getMastersMdl(masterId, function (err, results) {
    if (err) {
      console.error("Get masters error:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    if (masterId && results.length === 0) {
      return res.status(404).json({ status: 404, msg: "Master not found" });
    }

    return res.status(200).json({
      status: 200,
      data: results
    });
  });
};

// exports.updateMasterCtrl = function (req, res) {
//   const upload = getUploadHandler("master_images");

//   upload(req, res, function (err) {
//     if (err) {
//       console.error("Master image upload error:", err);
//       return res.status(500).json({ status: 500, msg: "Image upload failed" });
//     }

//     const { id, name, price } = req.body;

//     if (!id) {
//       return res.status(400).json({ status: 400, msg: "Missing master ID" });
//     }

//     // Build image URL safely
//     const image_url = req.file
//       ? `${req.protocol}://${req.get("host")}/uploads/master_images/${req.file.filename}`
//       : req.body.image_url || null;

//     const updateData = [name, price, image_url, id];

//     appmdl.updateMasterMdl(updateData, function (err, result) {
//       if (err) {
//         console.error("Master update error:", err);
//         return res.status(500).json({ status: 500, msg: "Server Error" });
//       }

//       if (!result || result.length === 0) {
//         return res.status(404).json({ status: 404, msg: "Master not found" });
//       }

//       return res.status(200).json({
//         status: 200,
//         message: "Master updated successfully",
//         data: result[0], // returning updated record
//       });
//     });
//   });
// };

exports.updateMasterCtrl = function (req, res) {
  const upload = getUploadHandler("master_images");

  upload(req, res, function (err) {
    if (err) {
      console.error("Master image upload error:", err);
      return res.status(500).json({ status: 500, msg: "Image upload failed" });
    }

    const { id, name, price, image_url } = req.body;

    if (!id) {
      return res.status(400).json({ status: 400, msg: "Missing master ID" });
    }

    let finalImageUrl;

    if (req.file) {
      // ✅ Case 1: Uploaded a new image
      finalImageUrl = `${req.protocol}://${req.get("host")}/uploads/master_images/${req.file.filename}`;
    } else if (image_url === "" || image_url === "clear") {
      // ✅ Case 2: Clear image if explicitly requested
      finalImageUrl = null;
    } else if (image_url === null || image_url === "null" || typeof image_url === "undefined") {
      // 🚫 Case 3: Ignore image update — keep existing image
      finalImageUrl = undefined;
    } else {
      // ✅ Case 4: Reuse provided image_url
      finalImageUrl = image_url;
    }

    // Build dynamic update data
    const updateData = { id };
    if (typeof name !== "undefined" && name !== "") updateData.name = name;
    if (typeof price !== "undefined" && price !== "") updateData.price = price;
    if (typeof finalImageUrl !== "undefined") updateData.image = finalImageUrl; // only add if should change

    appmdl.updateMasterMdl(updateData, function (err, result) {
      if (err) {
        console.error("Master update error:", err);
        return res.status(500).json({ status: 500, msg: "Server Error" });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ status: 404, msg: "Master not found" });
      }

      return res.status(200).json({
        status: 200,
        message: "Master updated successfully",
        data: result[0]
      });
    });
  });
};

//inventory
exports.postInventoryCtrl = function (req, res) {
  const data = req.body;

  // Basic validation
  if (!data.gift_id || !data.gift_name || !data.quantity) {
    return res.status(400).send({
      status: 400,
      msg: "Missing required fields: gift_id, gift_name, quantity"
    });
  }

  // Prepare sanitized data
  const invData = {
    gift_id: parseInt(data.gift_id),
    gift_name: data.gift_name.trim(),
    quantity: parseInt(data.quantity),
    price: parseFloat(data.price) || 0
  };

  // Call model
  appmdl.postInventoryMdl(invData, function (err, result) {
    if (err) {
      console.error("Error inserting inventory:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      message: "Inventory added successfully",
      updated_for_gift: result?.[0]?.gift_id || null,
      new_total_stock: result?.[0]?.total_stock || null
    });
  });
};

exports.getInventoryByGiftIdCtrl = function (req, res) {
  const giftId = req.params.gift_id || req.query.gift_id;

  if (!giftId) {
    return res.status(400).send({
      status: 400,
      msg: "gift_id is required"
    });
  }

  appmdl.getInventoryByGiftIdMdl(giftId, function (err, results) {
    if (err) {
      console.error("Error fetching inventory:", err);
      return res.status(500).send({ status: 500, msg: "Server Error" });
    }

    return res.status(200).json({
      status: 200,
      msg: "Inventory details fetched successfully",
      data: results
    });
  });
};

exports.getGiftStockStatusCtrl = function (req, res) {
  appmdl.getGiftStockStatusMdl(function (err, results) {
    if (err) {
      return res.status(500).send({
        status: 500,
        msg: "Server Error"
      });
    }

    return res.status(200).json({
      status: 200,
      msg: "Gift stock data fetched successfully",
      data: results
    });
  });
};

exports.updateInventoryCtrl = function (req, res) {
  const data = req.body;

  if (!data.id || !data.quantity || !data.price) {
    return res.status(400).json({
      status: 400,
      msg: "Missing required fields: id, quantity, price"
    });
  }

  const invData = [
    data.id,        // $1 inventory row ID
    data.quantity,  // $2
    data.price      // $3
  ];

  appmdl.updateInventoryMdl(invData, function (err, results) {
    if (err) {
      console.error("Inventory update error:", err);
      return res.status(500).json({
        status: 500,
        msg: "Server Error"
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Inventory updated successfully",
      updated: results[0]
    });
  });
};

exports.deleteInventoryCtrl = function (req, res) {
  const id = req.body.id;

  if (!id) {
    return res.status(400).json({
      status: 400,
      msg: "Missing required field: id"
    });
  }

  const idData = [id];

  appmdl.deleteInventoryMdl(idData, function (err, results) {
    if (err) {
      console.error("Delete Inventory error:", err);
      return res.status(500).json({
        status: 500,
        msg: "Server Error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: 404,
        msg: "Inventory item not found"
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Inventory item deleted successfully",
      deleted_id: results[0].id
    });
  });
};

exports.transactionDtlsCtrl = function (req, res) {
    console.log("Received GET request with body:", req.body);

    // You may need to process data from req.body if needed
    var dataarr = req.body;

    appmdl.transactionDtlsMdl(dataarr, function (err, results) {
        if (err) {
            console.error("Error in transactionDtlsMdl:", err);
            res.status(500).send({ "status": 500, "msg": "Server Error" });
            return;
        }

        console.log("Query results:", results);
        if (results.length > 0) {
            res.status(200).send({ 'status': 200, "msg": "Runner Details Retrieves Successfully...", 'data': results });
        } else {
            res.status(300).send({ 'status': 300, 'data': [] });
        }
    });
}