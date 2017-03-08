var db = require('./database');
var dataParser = require('./parse-data');

var years = dataParser.getYears();

var totals = dataParser.getTotals(years[0]);

console.log(totals)

// db.query('SELECT * FROM cities').then((result) => {
//     console.log(result)
// });