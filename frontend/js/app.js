import VerkiezingsMap from './VerkiezingsMap';
import VerkiezingsApi from './VerkiezingsApi';

var verkiezingsAPI = new VerkiezingsApi('http://localhost:3007/api/');
var verkiezingsMap = new VerkiezingsMap('map');

verkiezingsAPI.getCities(2012).then((cities) => {
    verkiezingsMap.addCityMarkers(cities);
});
