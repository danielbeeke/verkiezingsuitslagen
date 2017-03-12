var express = require('express');
var app = express();
var crud = require('./crud');

app.get('/api/cities', crud.getAllCities);

app.listen(3007);
