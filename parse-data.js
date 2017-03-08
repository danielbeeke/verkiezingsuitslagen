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
    }
};

module.exports = dataParser;