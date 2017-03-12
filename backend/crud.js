var db = require('./database');

var crud = {
    getAllCities (req, res, next) {
        var year = req.params.year;

        db.query(
            "SELECT c.name as city, ST_X(geom) as lat, ST_Y(geom) as lon, valid_votes, invalid_votes, entitled_voters, attendance, json_agg(json_build_object('party', pa.alias, 'votes', votes)) AS votes " +
            'FROM city_votes cv ' +
            'JOIN party_aliases pa ON cv.party_alias_id = pa.id ' +
            'JOIN cities c ON cv.city_id = c.id ' +
            'JOIN city_votes_info cvi ON cvi.city_id = c.id AND cv.year = cvi.year ' +
            'WHERE cv.year = ${year}' +
            'GROUP BY (c.name, c.geom, valid_votes, invalid_votes, entitled_voters, attendance) ' +
            'ORDER BY c.name',
        {
            year: year
        })
        .then(function (data) {

            // TODO move this to postgres.
            // A bit of cleaning up, so the data over the line is a little less.
            data.forEach((row) => {
                if (row.votes) {
                    var tempVotes = {};

                    row.votes.forEach((partyVotes) => {
                        tempVotes[partyVotes.party] = partyVotes.votes;
                    });

                    row.votes = tempVotes;
                }
            });

            res.status(200)
            .json(data);
        })
        .catch(function (err) {
            return next(err);
        });

    }
};

module.exports = crud;