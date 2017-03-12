var db = require('./database');

var crud = {
    getAllCities (req, res, next) {
        var year = req.params.year;

        db.query(
            "SELECT c.name as city, json_agg(json_build_object('votes', votes, 'party_alias', pa.alias)) AS votes " +
            'FROM city_votes cv ' +
            'JOIN party_aliases pa ON cv.party_alias_id = pa.id ' +
            'JOIN cities c ON cv.city_id = c.id ' +
            'WHERE cv.year = ${year} ' +
            'GROUP BY c.name ' +
            'ORDER BY c.name LIMIT 100',
        {
            year: year
        })
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