import "./styles.scss";
import { 
  BaseComponent,
  TimeSlider,
  DataNotes,
  DataWarning,
  LocaleService,
  LayoutService,
  TreeMenu,
  SteppedSlider,
  Dialogs,
  ButtonList,
  CapitalVizabiService,
  Repeater,
  versionInfo
} from "VizabiSharedComponents";
import { VizabiBubblemap } from "./component.js";

export default class BubbleMap extends BaseComponent {

  constructor(config){

    const markerName = config.options.markerName || "bubble";
    const fullMarker = config.model.markers[markerName];
    config.Vizabi.utils.applyDefaults(fullMarker.config, BubbleMap.DEFAULT_CORE(markerName));
      
    const frameType = config.Vizabi.stores.encodings.modelTypes.frame;
    const { marker, splashMarker } = frameType.splashMarker(fullMarker);

    config.model.markers[markerName] = marker;

    config.name = "bubblemap";

    config.subcomponents = [{
      type: Repeater,
      placeholder: ".vzb-repeater",
      model: marker,
      options: {
        ComponentClass: VizabiBubblemap,
        componentCssName: "vzb-bubblemap"
      },
      name: "chart",
    },{
      type: TimeSlider,
      placeholder: ".vzb-timeslider",
      name: "time-slider",
      model: marker
    },{
      type: SteppedSlider,
      placeholder: ".vzb-speedslider",
      name: "speed-slider",
      model: marker
    },{
      type: TreeMenu,
      placeholder: ".vzb-treemenu",
      name: "tree-menu",
      model: marker
    },{
      type: DataWarning,
      placeholder: ".vzb-datawarning",
      options: {button: ".vzb-datawarning-button"},
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
    }];

    config.template = `
      <div class="vzb-repeater vzb-bubblemap"></div>
      <div class="vzb-animationcontrols">
        <div class="vzb-timeslider"></div>
        <div class="vzb-speedslider"></div>
      </div>
      <div class="vzb-sidebar">
        <div class="vzb-dialogs"></div>
        <div class="vzb-buttonlist"></div>
      </div>
      <div class="vzb-treemenu"></div>
      <div class="vzb-datawarning"></div>
      <div class="vzb-datanotes"></div>
    `;

    config.services = {
      Vizabi: new CapitalVizabiService({Vizabi: config.Vizabi}),
      locale: new LocaleService(config.locale),
      layout: new LayoutService(config.layout)
    };

    super(config);
    this.splashMarker = splashMarker;
  }
}
BubbleMap.DEFAULT_UI = {
  chart: {
  }
};

BubbleMap.DEFAULT_CORE = (markerName) => ({
  requiredEncodings: ["lat", "lon", "size"],
  encoding: {
    "selected": {
      modelType: "selection"
    },
    "highlighted": {
      modelType: "selection"
    },
    "size": {
      scale: {
        modelType: "size",
        allowedTypes: ["linear", "log", "genericLog", "pow"]
      }
    },
    "lat": {
      data: {
        space: {},
        concept: {
          filter: { concept: { $in: ["latitude", "lat"] } }
        }
      }
    },
    "lon": {
      data: {
        space: {},
        concept: {
          filter: { concept: { $in: ["longitude", "lon", "lng"] } }
        }
      }
    },
    "color": {
      scale: {
        modelType: "color"
      }
    },
    "label": {
      data: {
        modelType: "entityPropertyDataConfig"
      }
    },
    "size_label": {
      data: {
        constant: "_default"
      },
      scale: {
        modelType: "size"
      }
    },
    "frame": {
      modelType: "frame"
    },
    "order": {
      modelType: "order",
      direction: "desc",
      data: {
        ref: `markers.${markerName}.encoding.size.data.config`
      }
    },
    "repeat": {
      modelType: "repeat",
      allowEnc: ["size"]
    }
  }
});

BubbleMap.versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS, sharedComponents: versionInfo};