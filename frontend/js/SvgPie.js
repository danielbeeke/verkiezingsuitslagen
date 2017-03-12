class SvgPie {

    series = [];

    constructor (series = []) {
        this.series = series;
    }

    renderToHTML () {
        var serializer = new XMLSerializer();
        return serializer.serializeToString(this.createMarkup());
    }

    getCoordinatesForPercent (percent) {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }

    createMarkup () {
        var pieSVG = document.createElement('svg');
        pieSVG.setAttributeNS(null, 'class', 'pie-chart');
        pieSVG.setAttributeNS(null, 'viewBox', '-1 -1 2 2');

        var cumulativePercent = 0;

        this.series.forEach((slice, delta) => {
            var [startX, startY] = this.getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += slice.percentage;
            var [endX, endY] = this.getCoordinatesForPercent(cumulativePercent);
            var largeArcFlag = slice.percentage > .5 ? 1 : 0;
            var pathData = [
                `M ${startX} ${startY}`, // Move
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                `L 0 0`, // Line
            ].join(' ');

            var path = document.createElement('path');
            path.setAttributeNS(null, 'd', pathData);
            path.setAttributeNS(null, 'fill', slice.color);
            pieSVG.appendChild(path);
        });

        var midCircle = document.createElement('circle');
        midCircle.setAttributeNS(null, 'cx', 0);
        midCircle.setAttributeNS(null, 'cy', 0);
        midCircle.setAttributeNS(null, 'r', .6);
        midCircle.setAttributeNS(null, 'fill', '#fff');

        pieSVG.appendChild(midCircle);

        return pieSVG;
    }
}

export default SvgPie;