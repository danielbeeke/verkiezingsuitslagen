var db = require('./database');
var dataParser = require('./parse-data');
var config = require('../config');
var https = require('https');

var cityNameOverrides = require('../data/city-overrides');

var dataImporter = {
    insertPartyAliases () {
        dataParser.getYears().forEach((year) => {
            var totals = dataParser.getTotals(year);
            var citiesVotes = dataParser.getCityVotes(year);
            dataParser.validatePartyNames(totals, citiesVotes);

            totals.forEach((total) => {
                db.query('INSERT INTO party_aliases (alias, year) VALUES (${alias}, ${year}) ON CONFLICT DO NOTHING', {
                    alias: total.party,
                    year: year
                });

            });
        });
    },

    insertSeats () {
        dataParser.getYears().forEach((year) => {
            var totals = dataParser.getTotals(year);
            var citiesVotes = dataParser.getCityVotes(year);
            dataParser.validatePartyNames(totals, citiesVotes);

            totals.forEach((total) => {
                dataImporter.getPartyByAliasAndYear(total.party, year).then((party) => {
                    db.query('INSERT INTO seats (year, party_alias_id, number) VALUES (${year}, ${party_alias_id}, ${number}) ON CONFLICT DO NOTHING', {
                        party_alias_id: party.id,
                        year: year,
                        number: parseInt(total.seats)
                    });
                });
            });
        });
    },

    insertCities () {
        dataParser.getYears().forEach((year) => {
            var totals = dataParser.getTotals(year);
            var citiesVotes = dataParser.getCityVotes(year);
            dataParser.validatePartyNames(totals, citiesVotes);

            citiesVotes.forEach((cityVotes) => {
                 db.query('INSERT INTO cities (cbs_id, name) VALUES (${cbs_id}, ${name}) ON CONFLICT DO NOTHING', {
                    cbs_id: cityVotes.cbs,
                    name: cityVotes.city_name,
                 });
            });
        });
    },

    insertCityYearInfo () {
        dataParser.getYears().forEach((year) => {
            var totals = dataParser.getTotals(year);
            var citiesVotes = dataParser.getCityVotes(year);
            dataParser.validatePartyNames(totals, citiesVotes);

            citiesVotes.forEach((cityVotes) => {
                dataImporter.getCityIdByCbs(cityVotes.cbs).then((cityId) => {
                    if (cityId) {
                        db.query('INSERT INTO city_votes_info (year, city_id, valid_votes, invalid_votes, entitled_voters, attendance) ' +
                            'VALUES (${year}, ${city_id}, ${valid_votes}, ${invalid_votes}, ${entitled_voters}, ${attendance}) ON CONFLICT DO NOTHING', {
                            cbs_id: cityVotes.cbs,
                            name: cityVotes.city_name,
                            year: year,
                            city_id: cityId,
                            valid_votes: cityVotes.valid_votes,
                            invalid_votes: cityVotes.invalid_votes,
                            entitled_voters: cityVotes.entitled_voters,
                            attendance: cityVotes.attendance
                        });
                    }
                    else {
                        console.log(cityVotes)
                        throw new Error('Missing city id for ' + cityVotes.name);
                    }
                });
            });
        });
    },

    insertCityYearVotes () {
        dataParser.getYears().forEach((year) => {
            var totals = dataParser.getTotals(year);
            var citiesVotes = dataParser.getCityVotes(year);
            dataParser.validatePartyNames(totals, citiesVotes);

            citiesVotes.forEach((cityVotes) => {
                dataImporter.getCityIdByCbs(cityVotes.cbs).then((cityId) => {
                    if (cityId) {
                        cityVotes.parties.forEach((partyVotes) => {
                            dataImporter.getPartyByAliasAndYear(partyVotes.name, year).then((partyAlias) => {
                                db.query('INSERT INTO city_votes (year, city_id, party_alias_id, votes) VALUES (${year}, ${city_id}, ${party_alias_id}, ${votes})', {
                                    year: year,
                                    city_id: cityId,
                                    party_alias_id: partyAlias.id,
                                    votes: parseInt(partyVotes.votes)
                                });
                            })
                        });
                    }
                    else {
                        console.log(cityVotes);
                        throw new Error('Missing city id for ' + cityVotes.name);
                    }
                });
            });
        });
    },

    geocodeCities () {
        db.query('SELECT * FROM cities WHERE geom ISNULL LIMIT 1').then((citiesWithoutGeom) => {
            if (citiesWithoutGeom.length) {
                citiesWithoutGeom.forEach((cityWithoutGeom) => {
                    dataImporter.geocodeCity(cityWithoutGeom.name, cityWithoutGeom.cbs_id);
                });
            }
        });
    },

    geocodeCity (city, cbs_id) {
        if (cityNameOverrides[city]) {
            city = cityNameOverrides[city];
        }
        else if (cityNameOverrides[cbs_id]) {
            city = cityNameOverrides[cbs_id];
        }

        var url = 'https://maps.google.com/maps/api/geocode/json?address=' + city + ', NL&key=' + config.google_access_token;

        https.get(url, function(res){
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                var response = JSON.parse(body);

                if (response.results[0]) {
                    var lat = response.results[0].geometry.location.lat;
                    var lon = response.results[0].geometry.location.lng;

                    db.query("UPDATE cities SET geom = ST_GeomFromText('POINT(${lat} ${lon})', 4326) WHERE cbs_id = ${cbs_id}", {
                        cbs_id: cbs_id,
                        lat: lat,
                        lon: lon
                    });
                }
                else {
                    console.log('Can not Fix: ' + city + "\n");
                    console.log(response)
                }
            });
        }).on('error', function(e){
            console.log(e);
            throw new Error('Got an error');
        });
    },

    getCityIdByCbs (cbs_id) {
        cbs_id = parseInt(cbs_id);
        return db.query('SELECT id FROM cities c WHERE c.cbs_id = ${cbs_id}', {
            cbs_id: cbs_id
        }).then((result) => {
            if (result && result[0] && result[0].id) {
                return result[0].id;
            }
        });
    },

    getPartyByAliasAndYear (alias, year) {
        return db.query('SELECT * FROM party_aliases pa WHERE pa.alias = ${alias} AND pa.year = ${year}', {
            alias: alias,
            year: year
        }).then((result) => {
            if (result) {
                return result[0];
            }
        });
    }
};

// Order:
// dataImporter.insertPartyAliases();
// dataImporter.insertCities();
// dataImporter.insertSeats();
// dataImporter.insertCityYearInfo();
// dataImporter.insertCityYearVotes();
// dataImporter.geocodeCities();

module.exports = dataImporter;
