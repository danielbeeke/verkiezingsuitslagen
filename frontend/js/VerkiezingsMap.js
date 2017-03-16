import L from 'leaflet';
import 'leaflet-hash';
import 'leaflet-markercluster';
import DivBar from './DivBar';
import SvgPie from './SvgPie';
import DivBar2 from './DivBar2';

class VerkiezingsMap {

    leafletMap = false;
    circles = [];

    constructor (id) {
        L.Icon.Default.imagePath = '/images/';
        this.leafletMap = L.map(id, { attributionControl: false }).setView([52.1444, 5.7870], 9);
        new L.Hash(this.leafletMap);
        L.tileLayer('https://tilemill.studiofonkel.nl/style/{z}/{x}/{y}.png?id=tmstyle:///home/administrator/styles/verkiezingsuitslagen.tm2').addTo(this.leafletMap);
        this.cluster = L.markerClusterGroup({
            singleMarkerMode: true,
            maxClusterRadius: 160,
            showCoverageOnHover: false,
            iconCreateFunction: (cluster) => {
                return this.clusterIcon(cluster);
            },
        });
        this.leafletMap.addLayer(this.cluster);

        this.leafletMap.on('mousemove', (e) => {
            if (e.originalEvent.originalTarget && e.originalEvent.originalTarget.matches && e.originalEvent.originalTarget.matches('.bar')) {
                var data = e.originalEvent.originalTarget.dataset;
                var marker = e.originalEvent.originalTarget.parentNode.parentNode.parentNode;
                var label = marker.querySelector('.hover-label');
                label.innerHTML = data.party + ' ' + data.percentage + '%';
            }
        });
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

    setParties (parties) {
        this.parties = parties;
    }

    prepareCluster (aggregatedData) {
        var series = [];

        Object.keys(aggregatedData.votes).forEach((party) => {
            series.push({
                label: party,
                percentage: (100 / aggregatedData.entitled_voters * aggregatedData.votes[party]),
                color: this.parties.filter((item) => item.name == party)[0].color
            });
        });

        return series;
    }

    clusterIcon (cluster) {
        var aggregatedData = this.aggregateCluster(cluster);
        var chartData = this.prepareCluster(aggregatedData);
        var chart = new DivBar2(chartData);
        var renderedChart = chart.renderToHTML();
        var label;

        if (aggregatedData.city.length > 4) {
            label = aggregatedData.city.slice(0, 3).join(', ') + '<span class="visible-cities-end"> en ' + (aggregatedData.city.length - 3) + ' meer.</span>';
            label += '<span class="hidden-cities">, ' + aggregatedData.city.slice(4).join(', ') + '</span>'
        }
        else {
            label = aggregatedData.city.join(', ');
        }

        var moreClass = aggregatedData.city.length > 4 ? 'more-than-four' : '';

        var divIcon = new L.DivIcon({
            html: renderedChart + '<div class="cluster-label ' + moreClass + '"><div class="cluster-label-inner"><span class="city-label">' + label + '</span><span class="hover-label"></span></div></div>',
            iconSize: [chart.getWidth(), chart.getHeight()],
            iconAnchor: [chart.getWidth() / 2, chart.getHeight() / 2]
        });


        //
        // if (cluster instanceof L.MarkerCluster) {
        //     if (!cluster._weAddedEvents) {
        //         cluster._weAddedEvents = true;
        //
        //         cluster.on('add', () => {
        //             var radius = 1000 * this.leafletMap.getZoom();
        //
        //             cluster.circle = L.circle(cluster._cLatLng, {
        //                 radius: radius
        //             });
        //
        //             cluster.circle.addTo(this.leafletMap);
        //         });
        //
        //         cluster.on('remove', () => {
        //             if (cluster.circle) {
        //                 this.leafletMap.removeLayer(cluster.circle);
        //                 delete cluster.circle;
        //             }
        //         });
        //     }
        // }

        return divIcon;
    }

    addCityMarkers (cities) {
        cities.forEach((city) => {
            var cityMarker = L.marker([city.lat, city.lon]);
            // cityMarker.bindTooltip(city.city);
            cityMarker.data = city;
            this.cluster.addLayer(cityMarker);
        });
    }
}

export default VerkiezingsMap;
