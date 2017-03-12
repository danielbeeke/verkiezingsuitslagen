var db = require('./database');

var crud = {
    getAllCities (req, res, next) {
        db.query('select name, ST_X(geom) as lat, ST_Y(geom) as lon from cities ORDER by name')
        .then(function (data) {
            res.status(200)
            .json(data);
        })
        .catch(function (err) {
            return next(err);
        });

    }
};

module.exports = crud;