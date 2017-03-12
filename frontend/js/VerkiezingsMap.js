import L from 'leaflet';
import 'leaflet-hash';
import 'PruneCluster/dist/PruneCluster';

class VerkiezingsMap {

    leafletMap = false;
    pruneCluster = false;

    constructor (id) {
        L.Icon.Default.imagePath = '/images/';
        this.leafletMap = L.map(id, { attributionControl: false }).setView([52.1444, 5.7870], 9);
        new L.Hash(this.leafletMap);
        L.tileLayer('https://tilemill.studiofonkel.nl/style/{z}/{x}/{y}.png?id=tmstyle:///home/administrator/styles/verkiezingsuitslagen.tm2').addTo(this.leafletMap);

        this.pruneCluster = new PruneClusterForLeaflet();
        this.leafletMap.addLayer(this.pruneCluster);
    }

    addCityMarkers (cities) {
        cities.forEach((city) => {
            var marker = new PruneCluster.Marker(city.lat, city.lon);
            this.pruneCluster.RegisterMarker(marker);
        });
    }
}

export default VerkiezingsMap;
