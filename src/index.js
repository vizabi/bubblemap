import "./styles.scss";

import { 
  BaseComponent,
  TimeSlider,
  DataNotes,
  LocaleService,
  LayoutService,
  TreeMenu,
  SteppedSlider,
  ButtonList 
} from "VizabiSharedComponents";
import VizabiBubblemap from "./component.js";

import "./styles.scss";
import "./styles-combo.scss";

export default class BubbleMap extends BaseComponent {

  constructor(config){
    let marker_destination = config.model.stores.markers.get("marker_destination");
    let marker_origin = config.model.stores.markers.get("marker_origin");

    config.subcomponents = [{
      type: VizabiBubblemap,
      placeholder: ".vzb-chart-1",
      model: marker_origin,
      name: "chart1",
      options: {sTitle: config.ui.TITLE_FROM}
    },{
      type: VizabiBubblemap,
      placeholder: ".vzb-chart-2",
      model: marker_destination,
      name: "chart2",
      options: {sTitle: config.ui.TITLE_TO}
    },{
      type: TimeSlider,
      placeholder: ".vzb-timeslider",
      name: "time-slider",
      model: marker_destination
    // },{
    //   type: TreeMenu,
    //   placeholder: ".vzb-treemenu",
    //   name: "tree-menu"
    //   //model: this.model
    // },{
    //   type: DataNotes,
    //   placeholder: ".vzb-datanotes",
    //   //model: this.model
    // },{
    //   type: ButtonList,
    //   placeholder: ".vzb-buttonlist",
    //   name: "buttons"
    //   //model: this.model
    }];

    config.template = `
      <div class="vzb-charts">
        <div class="vzb-bubblemap vzb-chart-1"></div>
        <div class="vzb-bubblemap vzb-chart-2"></div>
        <div class="vzb-big-arrow">
          <svg class="vzb-big-arrow-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M235.5,124.5l-99-99c-4.7-4.7-12.3-4.7-17,0l-99,99c-7.6,7.6-2.2,20.5,8.5,20.5h41v68c0,6.6,5.4,12,12,12h92c6.6,0,12-5.4,12-12v-68h41C237.7,145,243.1,132.1,235.5,124.5z"/></svg>
        </div>
        <div class="vzb-year-label"></div>
      </div>
      <div class="vzb-animationcontrols">
      <div class="vzb-timeslider"></div>
      <div class="vzb-speedslider"></div>
      </div>
      <div class="vzb-sidebar">
      <div class="vzb-buttonlist"></div>
      </div>
      <div class="vzb-treemenu vzb-hidden"></div>
      <div class="vzb-datanotes vzb-hidden"></div>
    `;

    config.services = {
      locale: new LocaleService(),
      layout: new LayoutService(config)
    };

    //register locale service in the marker model
    marker_destination.config.data.locale = config.services.locale;
    marker_origin.config.data.locale = config.services.locale;

    super(config);

    this.marker_origin = marker_origin;
    this.marker_destination = marker_destination;
    this.origin_select_filter = marker_origin.encoding.get("selected").data.filter;
    this.dest_select_filter = marker_destination.encoding.get("selected").data.filter;
  }

  setup(){
    this.children[0]._processFrameData = () => this._processFrameData(this.children[0], this.ui.ORIGIN);
    this.children[1]._processFrameData = () => this._processFrameData(this.children[1], this.ui.DESTINATION);

    this.children[0].selectToggleMarker = (d) => this.crossFilter(d, this.ui.ORIGIN);
    this.children[1].selectToggleMarker = (d) => this.crossFilter(d, this.ui.DESTINATION);

    this.crossFilteredData = [];   
  }

  draw(){
    this.addReaction(this.syncFrameModels); 
    
    this.validateTime();
  }

  syncFrameModels(){
    const frame_dest = this.model.stores.markers.get("marker_destination").encoding.get("frame");
    const frame_origin = this.model.stores.markers.get("marker_origin").encoding.get("frame");

    frame_origin.setValue(frame_dest.value, true);
    this.element.select(".vzb-year-label").text(this.services.locale.auto()(frame_dest.value));
  }

  validateTime(){
    const frame_dest = this.model.stores.markers.get("marker_destination").encoding.get("frame");
    const frame_origin = this.model.stores.markers.get("marker_origin").encoding.get("frame");

    function last(array) {
      return array[array.length - 1];
    }
    function first(array) {
      return array[0];
    }

    if (first(frame_origin.stepArray) > frame_dest.value) 
      frame_dest.setValue(first(frame_origin.stepArray), true);
    if (last(frame_origin.stepArray) < frame_dest.value) 
      frame_dest.setValue(last(frame_origin.stepArray), true);
  }

  _processFrameData(_this, DIRECTION) {
    const {
      ENCODING,
      GEO
    } = this.ui;

    let rollup = [];

    if (_this.model.data.config.space.includes(GEO)){
      rollup = _this.model.dataArray.map((m) =>
        Object.assign({}, m)
      );
    } else {   
      rollup = d3.nest()
        .key(d => d[DIRECTION])
        .rollup(v => 
          Object.assign({}, v[0], {
            [Symbol.for("key")]: GEO + "-" + v[0][DIRECTION],
            [ENCODING]: d3.sum(v, d => d[ENCODING])
          })
        )
        .entries(_this.model.dataArray)
        .map(m => m.value);
    }
      
    return _this.__dataProcessed = rollup.sort((a, b) => b[ENCODING] - a[ENCODING]);
  }


  crossFilter(selection, initiator){
    const {
      GEO, 
      ORIGIN,
      DESTINATION, 
      FRAME, 
      GEO_MEASURE, 
      ORIGIN_MEASURE, 
      DESTINATION_MEASURE
    } = this.ui;
    
    const receiver = initiator == DESTINATION ? ORIGIN : DESTINATION; 
    const initiator_model = initiator == DESTINATION ? this.marker_destination : this.marker_origin;
    const receiver_model = initiator == DESTINATION ? this.marker_origin : this.marker_destination;
    const initiator_select_filter = initiator == DESTINATION ? this.dest_select_filter : this.origin_select_filter;
    const receiver_select_filter = initiator == DESTINATION ? this.origin_select_filter : this.dest_select_filter;
    const receiver_measure = initiator == DESTINATION ? ORIGIN_MEASURE : DESTINATION_MEASURE;
    const initiator_measure = initiator == DESTINATION ? DESTINATION_MEASURE : ORIGIN_MEASURE;
    
    const already_set = initiator_select_filter.has(selection);
    if(already_set) selection = null;
    
    const newFilter = selection ? {[initiator]: {[initiator]: {"$in": [selection[Symbol.for("key")].replace(GEO + "-", "")]}}} : {};
    const currentFilter = Vizabi.mobx.toJS(receiver_model.data.filter.config.dimensions);

    if (JSON.stringify(currentFilter) !== JSON.stringify(newFilter)) {
      let action = Vizabi.mobx.action(() => {
        receiver_model.data.filter.config.dimensions = newFilter;
        initiator_model.data.filter.config.dimensions = {};

        initiator_select_filter.delete([...initiator_select_filter.markers.keys()]);
        receiver_select_filter.delete([...receiver_select_filter.markers.keys()]);

        if(!already_set) initiator_select_filter.set(selection);

        if (selection) {
          receiver_model.data.config.space = [ORIGIN, DESTINATION, FRAME];
          receiver_model.encoding.get("size").data.config.concept = GEO_MEASURE;
          receiver_model.encoding.get("label").data.config.space = [receiver];
          receiver_model.encoding.get("lat").data.config.space = [receiver];
          receiver_model.encoding.get("lon").data.config.space = [receiver];
          receiver_model.encoding.get("color").data.config.space = [receiver];
        } else {
          receiver_model.data.config.space = [GEO, FRAME];
          receiver_model.encoding.get("size").data.config.concept = receiver_measure;
          receiver_model.encoding.get("label").data.config.space = [GEO];
          receiver_model.encoding.get("lat").data.config.space = [GEO];
          receiver_model.encoding.get("lon").data.config.space = [GEO];
          receiver_model.encoding.get("color").data.config.space = [GEO];
        }

        initiator_model.data.config.space = [GEO, FRAME];
        initiator_model.encoding.get("size").data.config.concept = initiator_measure;
        initiator_model.encoding.get("label").data.config.space = [GEO];
        initiator_model.encoding.get("lat").data.config.space = [GEO];
        initiator_model.encoding.get("lon").data.config.space = [GEO];
        initiator_model.encoding.get("color").data.config.space = [GEO];

      });
      action();
    }
  }

}

BubbleMap.DEFAULT_UI = {
  FRAME: "",
  ORIGIN: "",
  DESTINATION: "",
  ENCODING: "",
  GEO: "",
  ORIGIN_MEASURE: "",
  DESTINATION_MEASURE: "",
  GEO_MEASURE: "",
  TITLE_FROM: "",
  TITLE_TO: ""
}