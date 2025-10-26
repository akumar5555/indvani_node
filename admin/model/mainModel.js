const sqldb = require("../../config/dbconnect");
const dbutil = require(appRoot + "/utils/dbutils");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

// Model to verify username and password
exports.loginMdl = function (dataarr, callback) {
  var cntxtDtls = "in loginMdl";

  var QRY_TO_EXEC = `SELECT * FROM public.admins 
    WHERE user_name = '${dataarr.user_name}' AND password = '${dataarr.password}';`;

  console.log(QRY_TO_EXEC);
  dbutil.execQuery( 
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
        return callback(err, null);
      }

      if (results.length > 0) {
        callback(null, results[0]);
      } else {
        callback(null, null);
      }
    }
  );
};
// Customer management
exports.createCustomerMdl = function (data, callback) {
  const cntxtDtls = "in createCustomerMdl";

  const QRY_TO_EXEC = `
    INSERT INTO public.customers (
      name, phone, email, address, created_at, status
    )
    VALUES ($1, $2, $3, $4, NOW(), 0)
    RETURNING id;
  `;

  const values = [
    data.name,
    data.phone,
    data.email || '',
    data.address || ''
  ];

  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    values,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Customer insert error:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};
exports.assignRunnerToCustMdl = function (dataarr, callback) {
  const cntxtDtls = "in assignRunnerMdl";

  const QRY_TO_EXEC = `
    UPDATE customers
    SET runner_assigned = $1,
        status = $2
    WHERE id = $3
    RETURNING *;
  `;

  const values = [dataarr.runner_id, dataarr.status, dataarr.customer_id];

  console.log(cntxtDtls, "QRY_TO_EXEC:", QRY_TO_EXEC, "VALUES:", values);
  
  dbutil.execinsertQuerys(  // ← Make sure this is execinsertQuerys, not execQuery
    sqldb.PgConPool,
    QRY_TO_EXEC,
    values,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};

exports.customerdetailsMdl = function (dataarr, callback) {
  var cntxtDtls = "in customerdetailsMdl";
  // var QRY_TO_EXEC = `SELECT
  //     c.id,
  //     c.name,
  //     c.phone,
  //     c.email,
  //     c.address,
  //     c.created_at,
  //     s.id AS status_id,
  //     s.code AS status_code,
  //     s.label AS status_label
  //   FROM public.customers c
  //   LEFT JOIN public.statuses s ON c.status = s.id
  //   ORDER BY c.id ASC;`;
   var QRY_TO_EXEC = `SELECT
      c.*,
      s.id AS status_id,
      s.code AS status_code,
      s.label AS status_label
    FROM public.customers c
    LEFT JOIN public.statuses s ON c.status = s.id
    ORDER BY c.id ASC;`;
console.log("qry1",QRY_TO_EXEC);
  if (callback && typeof callback === "function") {
    dbutil.execQuery(
      sqldb.PgConPool,
      QRY_TO_EXEC,
      cntxtDtls,
      function (err, results) {
        if (err) {
          console.error("Database query error:", err);
        }
        callback(err, results);
      }
    );
  } else {
    return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
  }
};
exports.customerByidMdl = function (dataarr, callback) {
  var cntxtDtls = "in customerByidMdl";
  var QRY_TO_EXEC = `SELECT * FROM public.customers WHERE id = ${dataarr.customer_id};`;
  console.log(QRY_TO_EXEC);
  // First query: Fetch customer details
  if (callback && typeof callback === "function") {
    dbutil.execQuery(
      sqldb.PgConPool,
      QRY_TO_EXEC,
      cntxtDtls,
      function (err, results) {
        if (err) {
          console.error("Database query error:", err);
        }
        callback(err, results);
      }
    );
  } else {
    return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
  }
};

exports.customerdetailsByRunnerIdMdl = function (dataarr, callback) {
    var cntxtDtls = "in customerdetailsByRunnerIdMdl";
    
    const runnerId = parseInt(dataarr.runner_id);
    
    if (!runnerId) {
        return callback(new Error("Invalid runner_id"), null);
    }

    // Parameterized query with NULL condition
    var QRY_TO_EXEC = `SELECT
      c.id,
      c.name,
      c.phone,
      c.email,
      c.address,
      c.created_at,
      s.id AS status_id,
      s.code AS status_code,
      s.label AS status_label,
      c.runner_assigned
    FROM public.customers c
    LEFT JOIN public.statuses s ON c.status = s.id
    WHERE c.status in(1,3)
      AND (c.runner_assigned = $1)
    ORDER BY c.id ASC;`;
    console.log("qry",QRY_TO_EXEC);
    const values = [runnerId];

    dbutil.execinsertQuerys(
        sqldb.PgConPool,
        QRY_TO_EXEC,
        values,
        cntxtDtls,
        function (err, results) {
            if (err) {
                console.error("Database query error:", err);
            }
            callback(err, results);
        }
    );
};


// exports.updateCustomerStatusByIdMdl = function (dataarr, callback) {
//     var cntxtDtls = "in updateCustomerStatusByIdMdl";
    
//     // Sanitize inputs
//     const customerId = parseInt(dataarr.customer_id);
//     const status = parseInt(dataarr.status);
    
//     if (!customerId || isNaN(status)) {
//         return callback(new Error("Invalid customer_id or status"), null);
//     }

//     // Parameterized update query
//     var QRY_TO_EXEC = `UPDATE public.customers 
//     SET status = $1, updated_at = NOW() 
//     WHERE id = $2
//     RETURNING id, name, phone, status, updated_at;`;

//     const values = [status, customerId];

//     console.log("Executing query:", QRY_TO_EXEC);
//     console.log("With values:", values);

//     dbutil.execinsertQuerys(
//         sqldb.PgConPool,
//         QRY_TO_EXEC,
//         values,
//         cntxtDtls,
//         function (err, results) {
//             if (err) {
//                 console.error("Database update error:", err);
//                 return callback(err, null);
//             }
//             callback(null, results);
//         }
//     );
// };

//statuses

exports.updateCustomerStatusByIdMdl = function (dataarr, callback) {
    const cntxtDtls = "in updateCustomerStatusByIdMdl";

    // Extract and sanitize inputs
    const customerId = parseInt(dataarr.customer_id);
    const status = parseInt(dataarr.status);
    const follow_up_date = dataarr.follow_up_date || null;
    const comment = dataarr.comment || null;

    if (!customerId || isNaN(status)) {
        return callback(new Error("Invalid customer_id or status"), null);
    }

    let QRY_TO_EXEC;
    let values;

    // ✅ Case 1: Normal update (status 1 or 2)
    if (status !== 3) {
        QRY_TO_EXEC = `
            UPDATE public.customers 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2
            RETURNING id, name, phone, status, updated_at;
        `;
        values = [status, customerId];
    }
    // ✅ Case 2: Special update when status = 3
    else {
        QRY_TO_EXEC = `
            UPDATE public.customers 
            SET status = $1, updated_at = NOW(), followupdate = $3, comments = $4
            WHERE id = $2
            RETURNING id, name, phone, status, followupdate, comments, updated_at;
        `;
        values = [status, customerId, follow_up_date, comment];
    }

    console.log("🧩 Executing Query:", QRY_TO_EXEC);
    console.log("🧠 With Values:", values);

    dbutil.execinsertQuerys(
        sqldb.PgConPool,
        QRY_TO_EXEC,
        values,
        cntxtDtls,
        function (err, results) {
            if (err) {
                console.error("❌ Database update error:", err);
                return callback(err, null);
            }
            callback(null, results);
        }
    );
};

exports.getStatusesMdl = function (callback) {
  const cntxtDtls = "in getStatusesMdl";

  const QRY_TO_EXEC = `
    SELECT id, code, label
    FROM public.statuses
    ORDER BY id ASC;
  `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};
//runner 
exports.runnerdetailsMdl = function (callback) {
  const QRY = `
    SELECT id, name, phone, email, status
    FROM public.runners
    ORDER BY id ASC;
  `;

  dbutil.execQuery(sqldb.PgConPool, QRY, "in runnerdetailsMdl", function (err, results) {
    if (err) return callback(err, null);
    callback(null, results);
  });
};
exports.activeRunnerDtlsMdl = function (callback) {
  const QRY = `
    SELECT id, name, phone, email, status
    FROM public.runners where status='active'
    ORDER BY id ASC;
  `;

  dbutil.execQuery(sqldb.PgConPool, QRY, "in runnerdetailsMdl", function (err, results) {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

exports.runnerdetailsByIdMdl = function (dataarr, callback) {
    const cntxtDtls = "in runnerdetailsByIdMdl";
    
    // Sanitize the runner_id to prevent SQL injection
    const runnerId = parseInt(dataarr.runner_id);
    
    if (!runnerId) {
        return callback(new Error("Invalid runner_id"), null);
    }

    const QRY_TO_EXEC = `
        SELECT id, name, phone, email, status, created_at
        FROM public.runners 
        WHERE id = ${runnerId};
    `;

    console.log(QRY_TO_EXEC);

    if (callback && typeof callback === "function") {
        dbutil.execQuery(
            sqldb.PgConPool,
            QRY_TO_EXEC,
            cntxtDtls,
            function (err, results) {
                if (err) {
                    console.error("Database query error:", err);
                }
                callback(err, results);
            }
        );
    } else {
        return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
    }
};

exports.runnerdetailsByMobileMdl = function (dataarr, callback) {
    const cntxtDtls = "in runnerdetailsByMobileMdl";
    
    const mobile = dataarr.phone.trim();
    
    if (!mobile) {
        return callback(new Error("Invalid mobile number"), null);
    }

    const QRY_TO_EXEC = `
        SELECT id, name, phone, email, status, created_at
        FROM public.runners 
        WHERE phone = $1;
    `;

    const values = [mobile];

    dbutil.execinsertQuerys(
        sqldb.PgConPool,
        QRY_TO_EXEC,
        values,
        cntxtDtls,
        function (err, results) {
            if (err) {
                console.error("Database query error:", err);
            }
            callback(err, results);
        }
    );
};

// orders
exports.orderCustomerdetailsMdl = function (callback) {
    var cntxtDtls = "in orderCustomerdetailsMdl";
    
    var QRY_TO_EXEC = `SELECT
        o.order_id,
        o.order_date,
        o.payment_mode,
        o.status as order_status,
        o.total_earnings,
        o.cart_total,
        o.remaining_amount,
        o.cash_amount,
        o.black_hair_weight,
        o.grey_hair_weight,
        o.black_hair_price,
        o.grey_hair_price,
        o.total_hair_price,
        o.products_json,
        o.hair_images,
        o.receipt_images,
        o.created_at as order_created_at,
        o.updated_at as order_updated_at,
        
        -- Customer details
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        
        -- Runner details
        r.id as runner_id,
        r.name as runner_name,
        r.phone as runner_phone,
        r.email as runner_email
        
    FROM public.orders o
    LEFT JOIN public.customers c ON o.customer_id = c.id
    LEFT JOIN public.runners r ON o.runner_id = r.id
    ORDER BY o.order_date DESC, o.order_id DESC;`;
  console.log("qry",QRY_TO_EXEC);
    if (callback && typeof callback === "function") {
        dbutil.execQuery(
            sqldb.PgConPool,
            QRY_TO_EXEC,
            cntxtDtls,
            function (err, results) {
                if (err) {
                    console.error("Database query error:", err);
                }
                callback(err, results);
            }
        );
    } else {
        return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
    }
};
exports.insertOrderMdl = function (dataarr, callback) {
    var cntxtDtls = "in insertOrderMdl";
    
    // Prepare values array
    const values = [
        dataarr.customer_id,
        dataarr.runner_id,
        dataarr.payment_mode,
        dataarr.total_earnings,
        dataarr.cart_total || 0,
        dataarr.remaining_amount || 0,
        dataarr.cash_amount,
        dataarr.black_hair_weight,
        dataarr.grey_hair_weight,
        dataarr.black_hair_price,
        dataarr.grey_hair_price,
        dataarr.total_hair_price,
        JSON.stringify(dataarr.products_json), // Convert to JSON string
        dataarr.hair_images,
        dataarr.receipt_images,
        dataarr.status || 'pending'
    ];

    // Parameterized insert query
    var QRY_TO_EXEC = `INSERT INTO public.orders (
        customer_id,
        runner_id,
        payment_mode,
        total_earnings,
        cart_total,
        remaining_amount,
        cash_amount,
        black_hair_weight,
        grey_hair_weight,
        black_hair_price,
        grey_hair_price,
        total_hair_price,
        products_json,
        hair_images,
        receipt_images,
        status,
        created_at,
        updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
    RETURNING 
        order_id,
        customer_id,
        runner_id,
        order_date,
        payment_mode,
        status,
        total_earnings,
        cart_total,
        remaining_amount,
        cash_amount,
        black_hair_weight,
        grey_hair_weight,
        black_hair_price,
        grey_hair_price,
        total_hair_price,
        products_json,
        hair_images,
        receipt_images,
        created_at;`;

    console.log("Executing query:", QRY_TO_EXEC);
    console.log("With values:", values);

    dbutil.execinsertQuerys(
        sqldb.PgConPool,
        QRY_TO_EXEC,
        values,
        cntxtDtls,
        function (err, results) {
            if (err) {
                console.error("Database insert error:", err);
                // Handle foreign key violations
                if (err.code === '23503') {
                    if (err.constraint.includes('customer_id')) {
                        return callback(new Error("Customer not found"), null);
                    }
                    if (err.constraint.includes('runner_id')) {
                        return callback(new Error("Runner not found"), null);
                    }
                }
                return callback(err, null);
            }
            callback(null, results);
        }
    );
};
exports.scheduleBulkMdl = function (dataarr, callback) {
  const cntxtDtls = "in scheduleBulkMdl";
  const customer_ids = dataarr.customer_ids;

  if (!Array.isArray(customer_ids) || customer_ids.length === 0) {
    return callback(new Error("Invalid customer_ids array"), null);
  }

  const event_date = moment().utcOffset("+05:30").format("YYYY-MM-DD");
  let QRY_TO_EXEC = "";

  for (let i = 0; i < customer_ids.length; i++) {
    const id = customer_ids[i];
    QRY_TO_EXEC += `
            INSERT INTO customer_visits (customer_id, visit_status, visit_date)
            VALUES (${id}, 'scheduled', '${event_date}');
        `;
  }

  console.log(QRY_TO_EXEC);

  if (callback && typeof callback === "function") {
    dbutil.execQuery(
      sqldb.PgConPool,
      QRY_TO_EXEC,
      cntxtDtls,
      function (err, results) {
        if (err) {
          console.error("Database query error:", err);
        }
        callback(err, results);
      }
    );
  } else {
    return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
  }
};

// exports.assignRunnerMdl = function (dataarr, callback) {
//     var cntxtDtls = "in assignRunnerMdl";
//     console.log(dataarr.company_id);
//     var QRY_TO_EXEC = `update customer_visits SET runner_id = ${dataarr.runner_id} WHERE id IN (${dataarr.ids});`;
//     console.log(QRY_TO_EXEC);

//     if (callback && typeof callback === "function") {
//         dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls, function (err, results) {
//             if (err) {
//                 console.error("Database query error:", err);
//             }
//             callback(err, results);
//         });
//     } else {
//         return dbutil.execQuery(sqldb.PgConPool, QRY_TO_EXEC, cntxtDtls);
//     }
// };

exports.assignRunnerToCustMdl = function (dataarr, callback) {
  const cntxtDtls = "in assignRunnerMdl";

  const QRY_TO_EXEC = `
    UPDATE customers
    SET runner_assigned = $1,
        status = $2
    WHERE id = $3
    RETURNING *;
  `;

  const values = [dataarr.runner_id, dataarr.status, dataarr.customer_id];

  console.log(cntxtDtls, "QRY_TO_EXEC:", QRY_TO_EXEC, "VALUES:", values);
  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};
// exports.assignRunnerMdl = function (dataarr, callback) {
//   const cntxtDtls = "in assignRunnerMdl";

//   if (!Array.isArray(dataarr.ids) || dataarr.ids.length === 0) {
//     return callback(new Error("Invalid ids array"), null);
//   }

//   const idList = dataarr.ids
//     .map((id) => parseInt(id))
//     .filter(Boolean)
//     .join(","); // sanitize
//   const runnerId = parseInt(dataarr.runner_id);

//   if (!runnerId || !idList) {
//     return callback(new Error("Invalid runner_id or empty id list"), null);
//   }

//   const QRY_TO_EXEC = `
//         UPDATE customer_visits
//         SET runner_id = ${runnerId}
//         WHERE id IN (${idList});
//     `;

//   dbutil.execQuery(
//     sqldb.PgConPool,
//     QRY_TO_EXEC,
//     cntxtDtls,
//     function (err, results) {
//       if (err) {
//         console.error("Database query error:", err);
//       }
//       callback(err, results);
//     }
//   );
// };
exports.assignRunnerToCustMdl = function (data, callback) {
  const cntxtDtls = "in assignRunnerToCustMdl";
  const runner_id = data.runner_id;
  const status = data.status || 'assigned'; // optional default
  let customerIds = [];

  // ✅ Support single or multiple customers
  if (Array.isArray(data.customer_ids)) {
    customerIds = data.customer_ids;
  } else if (data.customer_id) {
    customerIds = [data.customer_id];
  }

  if (customerIds.length === 0) {
    return callback(new Error("No customer IDs provided"));
  }

  const QRY_TO_EXEC = `
    UPDATE customers
    SET runner_assigned = $1,
        status = $2
    WHERE id = ANY($3::int[]);
  `;

  console.log("🧩 QRY_TO_EXEC:", QRY_TO_EXEC);
  console.log("🧠 Params:", [runner_id, status, customerIds]);

  dbutil.execQuery(
    sqldb.PgConPool,
    { text: QRY_TO_EXEC, values: [runner_id, status, customerIds] },
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};



exports.postWeightCategoriesMdl = function (data, callback) {
  const cntxtDtls = "in postWeightCategoriesMdl";

  const weight = parseFloat(data.weight_in_grams);

  if (isNaN(weight)) {
    return callback(new Error("Invalid input data"), null);
  }

  const QRY_TO_EXEC = ` INSERT INTO public.weight_categories (unit, weight_in_grams, status)
        VALUES ('grams', ${weight}, 0); `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};

exports.getWeightCategoriesMdl = function (callback) {
  const cntxtDtls = "in getWeightCategoriesMdl";

  const QRY_TO_EXEC = `
        SELECT id, unit, weight_in_grams, status
        FROM public.weight_categories where status=0
        ORDER BY weight_in_grams ASC;
    `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};
exports.deleteWeightCategoriesMdl = function (data, callback) {
  const cntxtDtls = "in deleteWeightCategoriesMdl";
  const id = parseInt(data.id);

  if (!id) {
    return callback(new Error("Invalid or missing id"), null);
  }

  const QRY_TO_EXEC = `
        UPDATE public.weight_categories
        SET status = 1
        WHERE id = ${id};
    `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};

//order

exports.postOrderMdl = function (data, callback) {
  const cntxtDtls = "in postOrderMdl";

  const values = [
    data.sale_type,
    data.hair_id,
    data.hair_given_grams,
    data.hair_price,
    data.gift_id || 0,
    data.gift_price || 0,
    data.order_latitude,
    data.order_longitude,
    data.customer_id,
    data.phone_number,
    data.otp,
    data.delivery_address
  ];

  const QRY_TO_EXEC = `
    WITH valid_gift AS (
      SELECT id FROM public.gifts
      WHERE id = $5
        AND $1 = 'gift'
        AND available_stock > 0
    ),
    inserted_order AS (
      INSERT INTO public.orders (
        sale_type, hair_id, hair_given_grams, hair_price,
        gift_id, gift_price, order_latitude, order_longitude,
        customer_id, phone_number, order_date, order_status_id,
        order_status_name, otp, delivery_address, status
      )
      SELECT
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, NOW(), 1,
        'Order Placed', $11, $12, 0
      FROM valid_gift
      RETURNING id, gift_id, sale_type
    ),
    updated_gift AS (
      UPDATE public.gifts
      SET sold_stock = sold_stock + 1
      FROM inserted_order
      WHERE gifts.id = inserted_order.gift_id
        AND inserted_order.sale_type = 'gift'
      RETURNING gifts.id, gifts.sold_stock
    )
    SELECT * FROM inserted_order;
  `;

  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    values,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database insert error:", err);
        return callback(err);
      }

      // If no result returned, gift stock was invalid
      if (!results || results.length === 0) {
        return callback({ status: 400, message: "Gift not available (out of stock)" }, null);
      }

      callback(null, results);
    }
  );
};

// exports.postOrderMdl = function (data, callback) {
//   const cntxtDtls = "in postOrderMdl";

//   const QRY_TO_EXEC = `
//         INSERT INTO public.orders (
//             sale_type, hair_id, hair_given_grams, hair_price,
//             gift_id, gift_price, order_latitude, order_longitude,
//             customer_id, phone_number, order_date, order_status_id,
//             order_status_name, otp, delivery_address,status
//         )
//         VALUES (
//             '${data.sale_type}', ${data.hair_id}, ${data.hair_given_grams}, ${
//     data.hair_price
//   },
//             ${data.gift_id || 0}, ${data.gift_price || 0}, ${
//     data.order_latitude
//   }, ${data.order_longitude},
//             ${data.customer_id}, '${data.phone_number}', NOW(), 1,
//             'Order Placed', '${data.otp}','${data.delivery_address}',0)
//         RETURNING id;`;
//   console.log("QRY_TO_EXEC", QRY_TO_EXEC);
//   dbutil.execQuery(
//     sqldb.PgConPool,
//     QRY_TO_EXEC,
//     cntxtDtls,
//     function (err, results) {
//       if (err) {
//         console.error("Database insert error:", err);
//       }
//       callback(err, results);
//     }
//   );
// };

exports.assignRunnerMdl = function (data, callback) {
  const cntxtDtls = "in assignRunnerMdl";
  const orderIdList = data.order_ids.join(","); // e.g., 12,13,14

  const QRY_TO_EXEC = `
        UPDATE public.orders
        SET
            runner_id = ${data.runner_id},
            runner_assign_date = NOW(),
            order_status_id = 2,
            order_status_name = 'Runner Assigned'
        WHERE id IN (${orderIdList})
        RETURNING *;
    `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database update error:", err);
      }
      callback(err, results);
    }
  );
};
// post gifts
exports.insertGiftMdl = function (giftData, callback) {
  const cntxtDtls = "in insertGiftMdl";

  const QRY_TO_EXEC = `
        INSERT INTO public.gifts (
            name, description, image_url, sale_price,
            total_stock, sold_stock, created_at, status
        )
        VALUES ($1, $2, $3, $4, 0, 0, NOW(), 0)
        RETURNING id;
    `;
  console.log("QRY_TO_EXEC", QRY_TO_EXEC);
  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    giftData,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database insert error:", err);
      }
      callback(err, results);
    }
  );
};

exports.getGiftsMdl = function (callback) {
  const cntxtDtls = "in getGiftsMdl";

  const QRY_TO_EXEC = `SELECT 
  g.id AS gift_id,
  g.name AS gift_name,
  g.description,
  g.sale_price,
  g.image_url
FROM gifts g
WHERE g.status = 0
ORDER BY g.id ASC;`;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};

exports.deleteGiftsMdl = function (data, callback) {
  const cntxtDtls = "in deleteGiftsMdl";
  const id = parseInt(data.gift_id);

  if (!id) {
    return callback(new Error("Invalid or missing gift_id"), null);
  }

  const QRY_TO_EXEC = `
        UPDATE public.gifts
        SET status = 1
        WHERE id = ${id};
    `;

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Database query error:", err);
      }
      callback(err, results);
    }
  );
};

//add gifts stock
exports.insertGiftStockMdl = function (stockData, callback) {
  const cntxtDtls = "in insertGiftStockMdl";

  const QRY_TO_EXEC = `
    WITH inserted AS (
      INSERT INTO public.gift_stock (gift_id, quantity_added, price, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING gift_id, quantity_added
    )
    UPDATE gifts
    SET total_stock = gifts.total_stock + inserted.quantity_added
    FROM inserted
    WHERE gifts.id = inserted.gift_id
    RETURNING gifts.id, gifts.total_stock;
  `;

  console.log("QRY_TO_EXEC", QRY_TO_EXEC);
  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    stockData, // [gift_id, quantity_added, price]
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Insert+Update error:", err);
      }
      callback(err, results);
    }
  );
};

//upload collection
exports.updateCollectionMdl = function (data, callback) {
  const cntxtDtls = "in updateCollectionMdl";

  const QRY_TO_EXEC = `
    UPDATE public.orders
    SET 
      collection_image_url = '${data.image_url}',
      collection_timestamp = NOW(),
      order_status_id = 3,
      order_status_name = 'Item Collected',
      collection_gin = '${data.collection_gin}'
    WHERE id = ${data.order_id}
    RETURNING id;
  `;
  console.log("QRY_TO_EXEC", QRY_TO_EXEC);

  dbutil.execQuery(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    cntxtDtls,
    function (err, result) {
      if (err) {
        console.error("DB update error:", err);
      }
      callback(err, result);
    }
  );
};
//runner
exports.postRunnerDetailsMdl = function (data, callback) {
  const cntxtDtls = "in postRunnerDetailsMdl";

  const QRY_TO_EXEC = `
    INSERT INTO public.runners (
      name, phone, email, status, created_at, password
    )
    VALUES ($1, $2, $3, $4, NOW(), $5)
    RETURNING id;
  `;

  const values = [
    data.name,
    data.phone,
    data.email || '',
    data.status || 'active',
    data.password || '1234'
  ];

  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    values,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Runner insert error:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};

exports.updateRunnerByIdMdl = function (data, callback) {
  const cntxtDtls = "in updateRunnerByIdMdl";

  const QRY_TO_EXEC = `
    UPDATE public.runners
    SET
      name = $1,
      phone = $2,
      email = $3,
      status = $4
    WHERE id = $5
    RETURNING id, name, phone, email, status;
  `;

  const values = [
    data.name,
    data.phone,
    data.email,
    data.status,
    data.id
  ];

  dbutil.execinsertQuerys(
    sqldb.PgConPool,
    QRY_TO_EXEC,
    values,
    cntxtDtls,
    function (err, results) {
      if (err) {
        console.error("Runner update error:", err);
        return callback(err);
      }
      callback(null, results);
    }
  );
};

