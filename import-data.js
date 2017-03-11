var db = require('./database');
var dataParser = require('./parse-data');

// Save parties to the party_aliases table
dataParser.getYears().forEach((year) => {
    var totals = dataParser.getTotals(year);
    var cityVotes = dataParser.getCityVotes(year);
    dataParser.validatePartyNames(totals, cityVotes);

    totals.forEach((total) => {
        // db.query('INSERT INTO party_aliases (alias, year) VALUES (${alias}, ${year})', {
        //     alias: total.party,
        //     year: year
        // });

        var percentage = parseFloat(total.percentage.replace(',', '.'));
        var chairs = parseInt(total.chairs);

        console.log(total.party)
    });
});

// db.query('SELECT * FROM cities').then((result) => {
//     console.log(result)
// });



    