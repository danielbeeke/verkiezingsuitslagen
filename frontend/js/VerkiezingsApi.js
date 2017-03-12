import 'fetch';

class VerkiezingsApi {

    apiBase = '';

    constructor (apiBase) {
        this.apiBase = apiBase;
    }

    getCities (year) {
        return fetch(this.apiBase + 'cities/' + year)
        .then((response) => {
            return response.json();
        });
    }

    getParties (year) {
        return fetch(this.apiBase + 'parties/' + year)
        .then((response) => {
            return response.json();
        });
    }
}

export default VerkiezingsApi;