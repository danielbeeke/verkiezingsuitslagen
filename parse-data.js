var fs = require('fs');
var parse = require('csv-parse/lib/sync');

var dataParser = {
    getYears: function () {
        var files = fs.readdirSync('./data/');
        var years = [];
        files.forEach((file) => {
            if (file.length == 8) {
                years.push(parseInt(file.substr(0, 4)));
            }
        });
        return years;
    },

    getTotals: function (year) {
        var totalsCsvBuffer = fs.readFileSync('./data/' + year + '.totals.csv');
        var totalsCsv = totalsCsvBuffer.toString();
        var totals = parse(totalsCsv, { columns: ['party', 'aggregation_party', 'votes', 'percentage', 'chairs'] });
        totals.shift();

        totals.forEach((totalsRow) => {
            if (totalsRow.aggregation_party) {
                throw new Error('Unexpected aggregation party');
            }
        });

        return totals;
    },

    getCityVotes: function (year) {
        var cityVotesCsvBuffer = fs.readFileSync('./data/' + year + '.csv');
        var cityVotesCsv = cityVotesCsvBuffer.toString();

        var cityVotesHeaders = parse(cityVotesCsv);
        cityVotesHeaders = cityVotesHeaders[0];

        cityVotesHeaders[0] = 'ams';
        cityVotesHeaders[1] = 'cbs';
        cityVotesHeaders[2] = 'city_name';
        cityVotesHeaders[3] = 'valid_votes';

        // The data sets differ a little bit. The newer ones have extra columns.
        // Old format.
        if (cityVotesHeaders[5] == 'Percentage ongeldige/blanco stemmen') {
            cityVotesHeaders[4] = 'invalid_votes';
            cityVotesHeaders[5] = false;
            cityVotesHeaders[6] = 'entitled_voters';
            cityVotesHeaders[7] = 'attendance';
            cityVotesHeaders[8] = false;
        }
        // Newer format.
        else {
            cityVotesHeaders[4] = 'invalid_votes';
            cityVotesHeaders[5] = false;
            cityVotesHeaders[6] = false;
            cityVotesHeaders[7] = 'entitled_voters';
            cityVotesHeaders[8] = 'attendance';
            cityVotesHeaders[9] = false;
        }

        var cityVotes = parse(cityVotesCsv, { columns: cityVotesHeaders });
        cityVotes.shift();

        var newCityVotes = [];

        cityVotes.forEach((row) => {
            var newRow = {
                parties: []
            };

            Object.keys(row).forEach((key, delta) => {
                if (delta > 6) {
                    newRow.parties.push({ name: key, votes: row[key] });
                }
                else {
                    newRow[key] = row[key];
                }
            });

            newCityVotes.push(newRow);
        });


        return newCityVotes;
    }
};

module.exports = dataParser;