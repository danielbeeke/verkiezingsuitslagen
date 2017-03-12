SystemJS.config({
  paths: {
    "github:": "lib/github/",
    "npm:": "lib/npm/",
    "verkiezingsuitslagen/": "js/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "babel-runtime": "npm:babel-runtime@5.8.38",
      "core-js": "npm:core-js@1.2.7",
      "process": "npm:jspm-nodelibs-process@0.2.0",
      "fs": "npm:jspm-nodelibs-fs@0.2.0",
      "path": "npm:jspm-nodelibs-path@0.2.1",
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    },
    "packages": {
      "npm:babel-runtime@5.8.38": {
        "map": {}
      },
      "npm:core-js@1.2.7": {
        "map": {
          "systemjs-json": "github:systemjs/plugin-json@0.1.2"
        }
      }
    }
  },
  transpiler: "plugin-babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  map: {
    "babel": "npm:babel-core@5.8.38",
    "leaflet-hash": "github:mlevans/leaflet-hash@master",
    "fetch": "npm:whatwg-fetch@2.0.3",
    "PruneCluster": "github:SINTEF-9012/PruneCluster@1.1.0"
  },
  packages: {
    "verkiezingsuitslagen": {
      "main": "app.js"
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "leaflet-markercluster": "github:Leaflet/Leaflet.markercluster@1.0.3",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "leaflet": "github:Leaflet/Leaflet@1.0.3"
  },
  packages: {}
});
