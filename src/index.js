import "./styles.scss";
import component from "./component";

const VERSION_INFO = { version: __VERSION, build: __BUILD };

//BAR CHART TOOL
const BubbleMap = Vizabi.Tool.extend("BubbleMap", {


  /**
   * Initializes the tool (Bar Chart Tool).
   * Executed once before any template is rendered.
   * @param {Object} placeholder Placeholder element for the tool
   * @param {Object} external_model Model as given by the external page
   */
  init(placeholder, external_model) {

    this.name = "bubblemap";

    //specifying components
    this.components = [{
      component,
      placeholder: ".vzb-tool-viz",
      model: ["state.time", "state.marker", "locale", "ui", "data"] //pass models to component
    }, {
      component: Vizabi.Component.get("timeslider"),
      placeholder: ".vzb-tool-timeslider",
      model: ["state.time", "state.marker", "ui"]
    }, {
      component: Vizabi.Component.get("dialogs"),
      placeholder: ".vzb-tool-dialogs",
      model: ["state", "ui", "locale"]
    }, {
      component: Vizabi.Component.get("buttonlist"),
      placeholder: ".vzb-tool-buttonlist",
      model: ["state", "ui", "locale"]
    }, {
      component: Vizabi.Component.get("treemenu"),
      placeholder: ".vzb-tool-treemenu",
      model: ["state.marker", "state.time", "locale"]
    }, {
      component: Vizabi.Component.get("datawarning"),
      placeholder: ".vzb-tool-datawarning",
      model: ["locale"]
    }, {
      component: Vizabi.Component.get("datanotes"),
      placeholder: ".vzb-tool-datanotes",
      model: ["state.marker", "locale"]
    }, {
      component: Vizabi.Component.get("steppedspeedslider"),
      placeholder: ".vzb-tool-stepped-speed-slider",
      model: ["state.time", "locale"]
    }
    ];

    //constructor is the same as any tool
    this._super(placeholder, external_model);
  },

  default_model: {
    state: {
      time: {
        "autoconfig": {
          "type": "time"
        }
      },
      entities: {
        "autoconfig": {
          "type": "entity_domain",
          "excludeIDs": ["tag"]
        }
      },
      entities_colorlegend: {
        "autoconfig": {
          "type": "entity_domain",
          "excludeIDs": ["tag"]
        }
      },
      marker: {
        limit: 5000,
        space: ["entities", "time"],
        hook_lat: {
          use: "property",
          "autoconfig": {
            index: 0,
            type: "measure"
          },
          _important: true
        },
        hook_lng: {
          use: "property",
          "autoconfig": {
            index: 1,
            type: "measure"
          },
          _important: true
        },
        label: {
          use: "property",
          "autoconfig": {
            "includeOnlyIDs": ["name"],
            "type": "string"
          }
        },
        size: {
          "autoconfig": {
              index: 2,
              type: "measure"
            }
        },
        color: {
          syncModels: ["marker_colorlegend"],
          "autoconfig": {}
        }
      },
      "marker_colorlegend": {
        "space": ["entities_colorlegend"],
        "label": {
          "use": "property",
          "which": "name"
        },
        "hook_rank": {
          "use": "property",
          "which": "rank"
        },
        "hook_geoshape": {
          "use": "property",
          "which": "shape_lores_svg"
        }
      }
    },
    locale: { },
    ui: {
      map: {
        path: null,
        colorGeo: false,
        preserveAspectRatio: true,
        scale: 0.95,
        offset: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        projection: "robinson",
        topology: {
          path: null,
          objects: {
            geo: "land",
            boundaries: "countries"
          },
          geoIdProperty: null,
        }
      },
      chart: {
        superhighlightOnMinimapHover: true,
        labels: {
          dragging: true
        }
      },
      datawarning: {
        doubtDomain: [],
        doubtRange: []
      },
      "buttons": ["colors", "find", "size", "moreoptions", "fullscreen", "presentation"],
      "dialogs": {
        "popup": ["colors", "find", "size", "moreoptions"],
        "sidebar": ["colors", "find", "size"],
        "moreoptions": ["opacity", "speed", "size", "colors", "presentation", "about"]
      },
      presentation: false
    }
  },

  versionInfo: VERSION_INFO
});

export default BubbleMap;
