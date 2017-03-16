class DivBar2 {

    series = [];

    constructor (series = []) {
        this.series = series;
    }

    renderToHTML () {
        var max = 0;
        this.series.forEach((serie) => {
            if (serie.percentage > max) {
                max = serie.percentage;
            }
        });

        this.height = (max / 100) * 300;

        var markup = '<div class="div-bar2" style="height:' + this.height + 'px;"><div class="div-bar2-inner">';

        var barCount = 0;

        this.series.forEach((serie) => {
            if (serie.percentage > 2) {
                markup += `<div class="bar" data-percentage="${Math.round(serie.percentage)}" data-party="${serie.label}" style="height: ${serie.percentage}%; background-color: ${serie.color};"></div>`;
                barCount++;
            }
        });

        this.width = barCount * 9;

        markup += '</div></div>';

        return markup;
    }

    getWidth () {
        return this.width;
    }

    getHeight () {
        return this.height;
    }
}

export default DivBar2;