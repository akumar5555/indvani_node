var express = require('express');
var app = express();

var postgres = require('pg');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
const cors = require('cors');


const fs = require("fs");
const https = require("https");

path = require('path');
appRoot = __dirname;


app.use(useragent.express());
app.use(bodyParser.json({ limit: '210mb' }));
app.use(bodyParser.urlencoded({ limit: '210mb', extended: true })); // support encoded bodies
app.use(cors())
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token,usr_id,clnt_id,appname');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use(logErrors);
// app.use('/nodeapp', require('./routes/routes'));
app.use('/admin', require('./admin/routes/routes'));
// app.use('/company', require('./company/routes/routes'));
// app.use('/customer', require('./customer/routes/routes'));
// to show images
app.use('/uploads/gift_images', express.static(path.join(__dirname, 'uploads/gift_images')));


function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
var server = app.listen(3100, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`INDVANI API Server is listening at http://${host}:${port}`);
});


app.get('/', function(req, res) {

    res.send("Indvani Api Local Server");
});



