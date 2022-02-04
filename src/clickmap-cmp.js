import {LegacyUtils as utils} from "VizabiSharedComponents";
import {VizabiBubblemap} from "./bubblemap-cmp.js";
  
export class VizabiClickmap extends VizabiBubblemap {

  _drawHeader() {};
  _interact() {
    const _this = this;

    
    const interact = super._interact();
    interact.click = function(event, d) {
      if (_this.MDL.frame.dragging || !d) return;

      _this.MDL.highlighted.data.filter.delete(d);
      _this._setTooltip(event);
      if (_this.ui.clickUrl) window.open(_this.ui.clickUrl + d[Symbol.for("key")]);
      }
    return interact;
  }

  __labelWithoutFrame(d) {
    return super.__labelWithoutFrame(d) + ": " + this.localise(d[this._alias("color")]) + "% misunderstanding";
  }
}

VizabiClickmap.DEFAULT_UI = VizabiBubblemap.DEFAULT_UI;
