var db = require('./database');
var dataParser = require('./parse-data');
var config = require('./config');
var https = require('https');

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
                    db.query('INSERT INTO seats (year, party_alias_ID, number) VALUES (${year}, ${party_alias_ID}, ${number}) ON CONFLICT DO NOTHING', {
                        party_alias_ID: party.id,
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
                 db.query('INSERT INTO cities (cbs_ID, name) VALUES (${cbs_ID}, ${name}) ON CONFLICT DO NOTHING', {
                    cbs_ID: cityVotes.cbs,
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

                    }
                    else {
                        console.log(cityVotes)
                        throw new Error('Missing city ID for ' + cityVotes.name);
                    }
                });
            });
        });
    },

    geocodeCities () {
        db.query('SELECT * FROM cities WHERE geom ISNULL LIMIT 500').then((citiesWithoutGeom) => {
            if (citiesWithoutGeom.length) {
                citiesWithoutGeom.forEach((cityWithoutGeom) => {
                    dataImporter.geocodeCity(cityWithoutGeom.name, cityWithoutGeom.cbs_id);
                });
            }
        });
    },

    geocodeCity (city, cbs_ID) {
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

                    db.query("UPDATE cities SET geom = ST_GeomFromText('POINT(${lat} ${lon})', 4326) WHERE cbs_ID = ${cbs_ID}", {
                        cbs_ID: cbs_ID,
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

    getCityIdByCbs (cbs_ID) {
        cbs_ID = parseInt(cbs_ID);
        return db.query('SELECT id FROM cities c WHERE c.cbs_id = ${cbs_id}', {
            cbs_id: cbs_ID
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

dataImporter.insertCityYearInfo();

// db.query('SELECT * FROM cities').then((result) => {
//     console.log(result)
// });

// var percentage = parseFloat(total.percentage.replace(',', '.'));
// var chairs = parseInt(total.chairs);
//
// console.log(total.party)

module.exports = dataImporter;
