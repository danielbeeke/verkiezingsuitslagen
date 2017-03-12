var express = require('express');
var app = express();
var crud = require('./crud');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/cities/:year', crud.getAllCities);
app.get('/api/parties/:year', crud.getPartyInfo);

app.listen(3007);