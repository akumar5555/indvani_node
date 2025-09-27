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
exports.customerdetailsMdl = function (dataarr, callback) {
  var cntxtDtls = "in customerdetailsMdl";
  var QRY_TO_EXEC = `SELECT * FROM public.customers order by id asc;`;

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
// orders
exports.orderCustomerdetailsMdl = function (dataarr, callback) {
  var cntxtDtls = "in orderCustomerdetailsMdl";
  var QRY_TO_EXEC = `SELECT
  c.id,
  c.name,
  c.phone,
  c.address,
  cv.visit_status,
  cv.reschedule_date,
  cv.visit_date
FROM public.customers c
LEFT JOIN (
  SELECT DISTINCT ON (customer_id) *
  FROM public.customer_visits
  ORDER BY customer_id, visit_date DESC
) cv ON cv.customer_id = c.id;`;

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

exports.assignRunnerMdl = function (dataarr, callback) {
  const cntxtDtls = "in assignRunnerMdl";

  if (!Array.isArray(dataarr.ids) || dataarr.ids.length === 0) {
    return callback(new Error("Invalid ids array"), null);
  }

  const idList = dataarr.ids
    .map((id) => parseInt(id))
    .filter(Boolean)
    .join(","); // sanitize
  const runnerId = parseInt(dataarr.runner_id);

  if (!runnerId || !idList) {
    return callback(new Error("Invalid runner_id or empty id list"), null);
  }

  const QRY_TO_EXEC = `
        UPDATE customer_visits
        SET runner_id = ${runnerId}
        WHERE id IN (${idList});
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
