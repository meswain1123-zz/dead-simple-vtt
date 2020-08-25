
import { Map } from "./Map";
import { PlayToken } from "./PlayToken";
import { Mask } from "./Mask";

export class PlayMap {
  _id: string;
  name: string;
  map: Map;
  tokens: PlayToken[];
  lightMasks: Mask[];
  darkMasks: Mask[];
  fogMasks: Mask[];
  zoom: number;
  dx: number;
  dy: number;

  constructor(
    _id: string, 
    name: string,
    map: Map,
    tokens: PlayToken[], 
    lightMasks: Mask[],
    darkMasks: Mask[],
    fogMasks: Mask[],
    zoom: number,
    dx: number,
    dy: number) {
    this._id = _id;
    this.name = name;
    this.map = map;
    this.tokens = tokens;
    this.lightMasks = lightMasks;
    this.darkMasks = darkMasks;
    this.fogMasks = fogMasks;
    this.zoom = zoom;
    this.dx = dx;
    this.dy = dy;
  }

  toDBObj = () => {
    const playTokens: any[] = [];
    this.tokens.forEach(t => {
      playTokens.push(t.toDBObj());
    });
    const lightMasks: any[] = [];
    this.lightMasks.forEach(l => {
      lightMasks.push(l.toDBObj());
    });
    const darkMasks: any[] = [];
    this.darkMasks.forEach(l => {
      darkMasks.push(l.toDBObj());
    });
    const fogMasks: any[] = [];
    this.fogMasks.forEach(l => {
      fogMasks.push(l.toDBObj());
    });
    return {
      _id: this._id,
      name: this.name,
      mapID: this.map._id,
      playTokens: playTokens,
      lightMasks: lightMasks,
      darkMasks: darkMasks,
      fogMasks: fogMasks,
      zoom: this.zoom,
      dx: this.dx,
      dy: this.dy
    };
  }
}