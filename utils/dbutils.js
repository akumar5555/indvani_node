exports.execQuery = function (ConPool, Qry, cntxtDtls, callback) {
    if (callback && typeof callback == "function") {
        ConPool.connect((err, client, release) => { // get connection from Connection Pool
            if (err) {
                console.error(err);
                callback(err, null);
                return err;
            }

            // Execute the query
            client.query(Qry, (err, result) => {
                release(); // Release connection back to Pool
                if (err) {
                    console.error(err);
                    callback(true, null);
                    return;
                }
                callback(false, result.rows); // Send the results back
            });
        });

    } else {
        return new Promise((resolve, reject) => {
            ConPool.connect((err, client, release) => { // get connection from Connection Pool
                if (err) {
                    console.error(err);
                    reject({ "err_status": 500, "err_message": "internal server" });
                } else {
                    // Execute the query
                    client.query(Qry, (err, result) => {
                        release(); // Release connection back to Pool
                        if (err) {
                            console.error(err);
                            reject({ "err_status": 500, "err_message": "internal server" });
                        } else {
                            resolve(result.rows); // Send the results back
                        }
                    });
                }
            });
        });
    }
};

exports.execinsertQuerys = function (ConPool, Qry, data, cntxtDtls, callback) {
    console.log(Qry);
    console.log(data);
    if (callback && typeof callback == "function") {
        ConPool.connect((err, client, release) => { // get connection from Connection Pool
            if (err) {
                console.error(err);
                callback(err, null);
                return err;
            }

            // Execute the query
            client.query(Qry, data, (err, result) => {
                release(); // Release connection back to Pool
                if (err) {
                    console.error(err);
                    callback(true, null);
                    return;
                }
                callback(false, result.rows); // Send the results back
            });
        });

    } else {
        return new Promise((resolve, reject) => {
            ConPool.connect((err, client, release) => { // get connection from Connection Pool
                if (err) {
                    console.error(err);
                    reject({ "err_status": 500, "err_message": "internal server" });
                } else {
                    // Execute the query
                    client.query(Qry, data, (err, result) => {
                        release(); // Release connection back to Pool
                        if (err) {
                            console.error(err);
                            reject({ "err_status": 500, "err_message": "internal server" });
                        } else {
                            resolve(result.rows); // Send the results back
                        }
                    });
                }
            });
        });
    }
};

