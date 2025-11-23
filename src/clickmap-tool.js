import "./styles.scss";
import { 
  BaseComponent,
  DataNotes,
  DataWarning,
  ErrorMessage,
  LocaleService,
  LayoutService,
  TreeMenu,
  Dialogs,
  ButtonList,
  CapitalVizabiService,
  Repeater,
  versionInfo
} from "@vizabi/shared-components";
import { VizabiClickmap } from "./clickmap-cmp.js";

export default class ClickMap extends BaseComponent {

  constructor(config){

    const fullMarker = config.model.markers?.bubble;
    const fullMarkerLegend = config.model.markers?.legend;
    config.Vizabi.utils.applyDefaults(fullMarker?.config || {}, ClickMap.DEFAULT_MODEL.bubble);   
    config.Vizabi.utils.applyDefaults(fullMarkerLegend?.config || {}, ClickMap.DEFAULT_MODEL.legend);  

    const frameType = config.Vizabi.stores.encodings.modelTypes.frame;
    const { marker, splashMarker } = frameType.splashMarker(fullMarker);
    
    config.name = "clickmap";

    config.subcomponents = [{
      type: Repeater,
      placeholder: ".vzb-repeater",
      model: marker,
      options: {
        repeatedComponent: VizabiClickmap,
        repeatedComponentCssClass: "vzb-bubblemap"
      },
      name: "chart",
    },{
      type: TreeMenu,
      placeholder: ".vzb-treemenu",
      name: "tree-menu",
      model: marker
    },{
      type: DataWarning,
      placeholder: ".vzb-datawarning",
      options: {appendButtonHere: ".vzb-repeater"},
      model: marker,
      name: "data-warning"
    },{
      type: DataNotes,
      placeholder: ".vzb-datanotes",
      model: marker
    },{
      type: Dialogs,
      placeholder: ".vzb-dialogs",
      model: marker,
      name: "dialogs"
    },{
      type: ButtonList,
      placeholder: ".vzb-buttonlist",
      name: "buttons",
      model: marker
    },{
      type: ErrorMessage,
      placeholder: ".vzb-errormessage",
      model: marker,
      name: "error-message"
    }];

    config.template = `
      <div class="vzb-repeater"></div>
      <div class="vzb-sidebar">
        <div class="vzb-dialogs"></div>
        <div class="vzb-buttonlist"></div>
      </div>
      <div class="vzb-treemenu"></div>
      <div class="vzb-datawarning"></div>
      <div class="vzb-datanotes"></div>
      <div class="vzb-errormessage"></div>
    `;

    config.locale.Vizabi = config.Vizabi;
    config.layout.Vizabi = config.Vizabi;
    config.services = {
      Vizabi: new CapitalVizabiService({Vizabi: config.Vizabi}),
      locale: new LocaleService(config.locale),
      layout: new LayoutService(config.layout)
    };

    super(config);
    this.splashMarker = splashMarker;
  }
}
ClickMap.DEFAULT_UI = {
  "locale": { "id": "en", "shortNumberFormat": true },
  "layout": { "projector": false },

  "buttons": {
    "buttons": ["markercontrols", "colors", "moreoptions", "presentation", "sidebarcollapse", "fullscreen"]
  },
  "dialogs": {
    "dialogs": {
      "popup": ["colors", "markercontrols", "moreoptions"],
      "sidebar": ["colors", "markercontrols", "size"],
      "moreoptions": ["opacity", "speed", "size", "colors", "label", "technical", "repeat", "presentation", "about"]
    },
    "markercontrols": {
      "disableSlice": true,
      "disableAddRemoveGroups": true,
      "primaryDim": null,
      "drilldown": null,
      "shortcutForSwitch": false,
      "shortcutForSwitch_allow": null
    }
  },
  "marker-contextmenu": {
    "primaryDim": null,
    "drilldown": null,
  },
  "chart": {
    "showTitles": true,
    "timeInBackground": true,
    "showForecast": false,
    "showForecastOverlay": true,
    "pauseBeforeForecast": true,
    "endBeforeForecast": null, //value like "2022", auto-resolved to current time minus one frame step
    "opacityHighlight": 1.0,
    "opacitySelect": 1.0,
    "opacityHighlightDim": 0.1,
    "opacitySelectDim": 0.3,
    "opacityRegular": 0.8,
    "labels": {
      "enabled": true,
      "dragging": true,
      "removeLabelBox": false
    },
    "superhighlightOnMinimapHover": false,
    "map": {
      "path": null,
      "colorGeo": false,
      "preserveAspectRatio": false,
      "scale": 1,
      "rotate": [0, 0],
      "offset": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
      "projection": "mercator",
      "topology": {
        "path": "assets/shapes.json",
        "objects": {
          "areas": "shapes",
          "boundaries": "shapes",
        },
        "geoIdProperty": "id"
      }
    }
  },
  "data-warning": {
    "enable": false,
    "margin": {
      "LARGE": { "bottom": 90 },
      "MEDIUM": { "bottom": 70 },
      "SMALL": { "bottom": 50 }
    }
  },
  "tree-menu": {
    "showDataSources": false,
    "folderStrategyByDataset": {}
  }
};

ClickMap.DEFAULT_MODEL = {
  "bubble": {
    "requiredEncodings": ["lat", "lon", "size"],
    "encoding": {
      "show": {
        "modelType": "selection"
      },
      "selected": {
        "modelType": "selection"
      },
      "highlighted": {
        "modelType": "selection"
      },
      "size": {
        "data": { },
        "scale": {
          "modelType": "size",
          "allowedTypes": ["linear"],
        }
      },
      "lat": {
        "data": {
          "space": {},
          "concept": { "filter": { "concept": { "$in": ["latitude", "lat"] } } }
        }
      },
      "lon": {
        "data": {
          "space": {},
          "concept": { "filter": { "concept": { "$in": ["longitude", "lon", "lng"] } } }
        }
      },
      "color": {
        "data": { "constant": "_default" },
        "scale": {
          "modelType": "color"
        }
      },
      "label": { "data": { "modelType": "entityPropertyDataConfig" } },
      "frame": { "modelType": "frame", "speed": 200, "splash": true },
      "size_label": {
        "data": {
          "constant": "_default"
        },
        "scale": {
          "extent": [0, 0.22],
          "modelType": "size",
          "allowedTypes": ["linear", "point"],
        }
      },
      "order": { 
        "modelType": "order",
        "direction": "desc",
        "data": { 
          "ref": `markers.bubble.encoding.size.data.config`
        }
      },
      "repeat": {
        "modelType": "repeat",
        "allowEnc": ["size"]
      }
    }
  },
  "legend": {
    "data": {
      "ref": {
        "transform": "entityConceptSkipFilter",
        "path": "markers.bubble.encoding.color"
      }
    },
    "encoding": {
      "color": {
        "data": {
          "concept": { "ref": "markers.bubble.encoding.color.data.concept" },
          "constant": { "ref": "markers.bubble.encoding.color.data.constant" }
        },
        "scale": {
          "modelType": "color",
          "palette": { "ref": "markers.bubble.encoding.color.scale.palette" },
          "domain": null,
          "range": null,
          "type": null,
          "zoomed": null,
          "zeroBaseline": false,
          "clamp": false,
          "allowedTypes": null
        }
        //"scale": { "ref": "markers.bubble.encoding.color.scale" }
      },
      "name": { "data": { } },
      "order": {
        "modelType": "order",
        "direction": "asc",
        "data": { }
      },
      "map": { "data": { } }
    }
  }
};

ClickMap.versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS, sharedComponents: versionInfo};