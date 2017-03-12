import VerkiezingsMap from './VerkiezingsMap';
import VerkiezingsApi from './VerkiezingsApi';
import VerkiezingsLegend from './VerkiezingsLegend';

var verkiezingsAPI = new VerkiezingsApi('http://localhost:3007/api/');
var verkiezingsMap = new VerkiezingsMap('map');

verkiezingsAPI.getParties(2012).then((parties) => {
    verkiezingsAPI.getCities(2012).then((cities) => {
        verkiezingsMap.setParties(parties);
        // var verkiezingsLegend = new VerkiezingsLegend('legend', parties);

        verkiezingsMap.addCityMarkers(cities);
    });
});