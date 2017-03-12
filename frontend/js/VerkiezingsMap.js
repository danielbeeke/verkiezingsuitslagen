import L from 'leaflet';
import 'leaflet-hash';
import 'leaflet-markercluster';
import SvgPie from './SvgPie';

class VerkiezingsMap {

    leafletMap = false;

    constructor (id) {
        L.Icon.Default.imagePath = '/images/';
        this.leafletMap = L.map(id, { attributionControl: false }).setView([52.1444, 5.7870], 9);
        new L.Hash(this.leafletMap);
        L.tileLayer('https://tilemill.studiofonkel.nl/style/{z}/{x}/{y}.png?id=tmstyle:///home/administrator/styles/verkiezingsuitslagen.tm2').addTo(this.leafletMap);
        this.cluster = L.markerClusterGroup({
            singleMarkerMode: true,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                return this.clusterIcon(cluster);
            },
        });
        this.leafletMap.addLayer(this.cluster);
    }

    aggregateCluster (cluster) {
        var aggregatedData = {};

        if (cluster.getAllChildMarkers) {
            cluster.getAllChildMarkers().forEach((childMarker) => {
                Object.keys(childMarker.data).forEach((key) => {
                    if (key == 'lat' || key == 'lon') { return; }

                    if (typeof childMarker.data[key] == 'number') {
                        if (!aggregatedData[key]) { aggregatedData[key] = 0; }
                        aggregatedData[key] = aggregatedData[key] + childMarker.data[key];
                    }

                    if (typeof childMarker.data[key] == 'string') {
                        if (!aggregatedData[key]) { aggregatedData[key] = []; }
                        aggregatedData[key].push(childMarker.data[key]);
                    }

                    if (typeof childMarker.data[key] == 'object') {
                        if (!aggregatedData[key]) { aggregatedData[key] = {}; }

                        Object.keys(childMarker.data[key]).forEach((innerKey) => {
                            if (typeof childMarker.data[key][innerKey] == 'number') {
                                if (!aggregatedData[key][innerKey]) { aggregatedData[key][innerKey] = 0; }
                                aggregatedData[key][innerKey] = aggregatedData[key][innerKey] + childMarker.data[key][innerKey];
                            }
                        })
                    }
                })
            })
        }

        return aggregatedData;
    }

    randomColor () {
      return '#'+ Math.floor(Math.random() * 16777215).toString(16);
    }

    prepareSvgPie (aggregatedData) {
        var series = [];

        Object.keys(aggregatedData.votes).forEach((party) => {
            series.push({
                label: party,
                percentage: (100 / aggregatedData.entitled_voters * aggregatedData.votes[party]) / 100,
                color: party.color
            });
        });

        return series;
    }

    clusterIcon (cluster) {
        var aggregatedData = this.aggregateCluster(cluster);
        var pieData = this.prepareSvgPie(aggregatedData);
        var pie = new SvgPie(pieData);
        var renderedPie = pie.renderToHTML();

        return new L.DivIcon({
            html: renderedPie,
            iconSize: [40, 40]
        })
    }

    addCityMarkers (cities) {
        cities.forEach((city) => {
            var cityMarker = L.marker([city.lat, city.lon]);
            cityMarker.data = city;
            this.cluster.addLayer(cityMarker);
        });
    }
}

export default VerkiezingsMap;
