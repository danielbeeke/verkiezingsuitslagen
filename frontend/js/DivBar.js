class DivBar {

    series = [];

    constructor (series = []) {
        this.series = series;
    }

    renderToHTML () {
        var markup = '<div class="div-bar">';





        var maxItem = {
            percentage: 0
        };

        this.series.forEach((serie, delta) => {
            if (serie.percentage > maxItem.percentage) {
                maxItem = serie;
            }
        });

        this.series.forEach((serie) => {
            if (serie.percentage > 10) {
                markup += `<div class="bar" style="height: ${serie.percentage}%; background-color: ${serie.color};"><span class="party-label">${serie.label}<span class="percentage"> ${Math.round(serie.percentage, 0)}%</span></span></div>`;
            }
            else {
                markup += `<div class="bar" style="height: ${serie.percentage}%; background-color: ${serie.color};"></div>`;
            }
        });

        markup += '</div>';

        return markup;
    }
}

export default DivBar;