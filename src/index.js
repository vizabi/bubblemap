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
    },{
      type: VizabiBubblemap,
      placeholder: ".vzb-chart-2",
      model: marker_destination,
      name: "chart2"
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

    this.concepts = {
      FRAME: marker_origin.config.encoding.frame.data.concept,
      KEY: marker_origin.config.data.space[0],
      ORIGIN: "origin",
      DESTINATION: "destination",
      ENCODING: "size",
      GEO: "geo",
      ORIGIN_MEASURE: "population_left",
      DESTINATION_MEASURE: "population_arrived",
      GEO_MEASURE: "population_moved"
    };

    this.children[0]._processFrameData = () => this._processFrameData(this.children[0], this.concepts.ORIGIN);
    this.children[1]._processFrameData = () => this._processFrameData(this.children[1], this.concepts.DESTINATION);

    this.crossFilteredData = [];   
  }

  draw(){
    this.addReaction(this.selectSingle);
    this.addReaction(this.filterOriginsByDestination);
    this.addReaction(this.filterDestinationsByOrigin);
    this.addReaction(this.syncFrameModels);   
  }

  syncFrameModels(){
    this.model.stores.markers.get("marker_origin").encoding.get("frame").config.value = 
      this.model.stores.markers.get("marker_destination").encoding.get("frame").config.value;
  }

  _processFrameData(_this, DIRECTION) {
    const {
      ENCODING,
      GEO
    } = this.concepts;

    let rollup = [];

    if (_this.model.data.config.space.includes(GEO)){
      rollup = _this.model.dataArray.map((m) =>
        Object.assign({}, m, {
          [Symbol.for("key")]: m[GEO]
        })
      );
    } else {   
      rollup = d3.nest()
        .key(d => d[DIRECTION])
        .rollup(v => 
          Object.assign({}, v[0], {
            [Symbol.for("key")]: v[0][DIRECTION],
            [ENCODING]: d3.sum(v, d => d[ENCODING])
          })
        )
        .entries(_this.model.dataArray)
        .map(m => m.value);
    }
      
    return _this.__dataProcessed = rollup.sort((a, b) => b[ENCODING] - a[ENCODING]);
  }

  selectSingle(){
    //unselect all markers except the last one that was selected
    //couldn't find a better way to do that

    let marker_origin = this.model.stores.markers.get("marker_origin");
    let marker_destination = this.model.stores.markers.get("marker_destination");

    const origin_filter = marker_origin.encoding.get("selected").data.filter;
    const dest_filter = marker_destination.encoding.get("selected").data.filter;
    
    while(origin_filter.markers.size > 1) {
      for (let a of origin_filter.markers.keys()) {origin_filter.markers.delete(a); break;}
    }
    while(dest_filter.markers.size > 1) {
      for (let a of dest_filter.markers.keys()) {dest_filter.markers.delete(a); break;}
    }
  }

  crossFilter(initiator){
    const {
      GEO, 
      ORIGIN,
      DESTINATION, 
      FRAME, 
      GEO_MEASURE, 
      ORIGIN_MEASURE, 
      DESTINATION_MEASURE
    } = this.concepts;
    
    const marker_destination = this.model.stores.markers.get("marker_destination");
    const marker_origin = this.model.stores.markers.get("marker_origin");

    const initiator_model = initiator == DESTINATION ? marker_destination : marker_origin;
    const receiver_model = initiator == DESTINATION ? marker_origin : marker_destination;
    const receiver = initiator == DESTINATION ? ORIGIN : DESTINATION; 
    const measure = initiator == DESTINATION ? ORIGIN_MEASURE : DESTINATION_MEASURE;
    
    const selection = initiator_model.encoding.get("selected").data.filter.markers.keys().next().value;
    const newFilter = selection ? {[initiator]: {[initiator]: {"$in": [selection]}}} : {};
    const currentFilter = Vizabi.mobx.toJS(receiver_model.data.filter.config.dimensions);

    if (JSON.stringify(currentFilter) !== JSON.stringify(newFilter)) {
      let action = Vizabi.mobx.action(() => {
        receiver_model.data.filter.config.dimensions = newFilter;

        if (selection) {
          receiver_model.data.config.space = [ORIGIN, DESTINATION, FRAME];
          receiver_model.encoding.get("size").data.config.concept = GEO_MEASURE;
          receiver_model.encoding.get("label").data.config.space = [receiver];
          receiver_model.encoding.get("lat").data.config.space = [receiver];
          receiver_model.encoding.get("lon").data.config.space = [receiver];
          receiver_model.encoding.get("color").data.config.space = [receiver];
        } else {
          receiver_model.data.config.space = [GEO, FRAME];
          receiver_model.encoding.get("size").data.config.concept = measure;
          receiver_model.encoding.get("label").data.config.space = [GEO];
          receiver_model.encoding.get("lat").data.config.space = [GEO];
          receiver_model.encoding.get("lon").data.config.space = [GEO];
          receiver_model.encoding.get("color").data.config.space = [GEO];

        }
      });
      action();
    }
  }

  filterOriginsByDestination(){
    this.crossFilter(this.concepts.DESTINATION);
  }
  filterDestinationsByOrigin(){
    this.crossFilter(this.concepts.ORIGIN);
  }
}
