var db = require('./database');
var dataParser = require('./parse-data');

var years = dataParser.getYears();
// var years = [2012];

years.forEach((year) => {
    var totals = dataParser.getTotals(year);
    var cityVotes = dataParser.getCityVotes(year);
    var cityVotesPartyNames = cityVotes[0].parties.map((party) => party.name);
    var totalsPartyNames = totals.map((total) => total.party);

    if (JSON.stringify(totalsPartyNames) != JSON.stringify(cityVotesPartyNames)) {
        throw new Error('Party names are not the same for the totals and the city votes');
    }
});

// db.query('SELECT * FROM cities').then((result) => {
//     console.log(result)
// });

