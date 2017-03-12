import 'fetch';

class VerkiezingsApi {

    apiBase = '';

    constructor (apiBase) {
        this.apiBase = apiBase;
    }

    getCities () {
        return fetch(this.apiBase + 'cities')
        .then((response) => {
            return response.json();
        });
    }
}

export default VerkiezingsApi;