import L from 'leaflet';
import 'leaflet-hash';

var map = L.map('map').setView([51.505, -0.09], 13);
var hash = new L.Hash(map);

L.tileLayer('https://tilemill.studiofonkel.nl/style/{z}/{x}/{y}.png?id=tmstyle:///home/administrator/styles/verkiezingsuitslagen.tm2').addTo(map);
