
import BasementStudy from "../assets/img/maps/Basement-Study.jpg";
import CastleWall from "../assets/img/maps/Castle-Wall.jpg";
import CaveLair from "../assets/img/maps/Cave-Lair.jpg";
import Crossroads from "../assets/img/maps/Crossroads.jpg";
import Farmstead from "../assets/img/maps/Farmstead.jpg";
import ForestLair from "../assets/img/maps/Forest-Lair.jpg";
import MonsterLair from "../assets/img/maps/Monster-Lair.jpg";
import SnowVillage from "../assets/img/maps/Snow-Village.jpg";
import SwampLair from "../assets/img/maps/Swamp-Lair.jpg";
import Tavern from "../assets/img/maps/Tavern.jpg";
import UndergroundComplex from "../assets/img/maps/Underground-Complex.jpg";
import UrbanLair from "../assets/img/maps/Urban-Lair.jpg";
import WagonTrailandShrine from "../assets/img/maps/Wagon-Trail-and-Shrine.jpg";
import WaterfallCavern from "../assets/img/maps/Waterfall-Cavern.jpg";
import AbandonedWarehouse from "../assets/img/maps/AbandonedWarehouse.png";
import DaggerAlley from "../assets/img/maps/DaggerAlley.png";
import UnderDaggerAlley from "../assets/img/maps/UnderDaggerAlley.png";
import TrollSkullAlleyBasement from "../assets/img/maps/TrollSkullAlleyBasement.png";
import TrollSkullAlleyHouse from "../assets/img/maps/TrollSkullAlleyHouse.png";
import WeddingRing from "../assets/img/maps/WeddingRing.png";

interface IHash {
  [details: string] : string;
} 
const MapFile: IHash = {
  BasementStudy: BasementStudy,
  CastleWall: CastleWall,
  CaveLair: CaveLair,
  Crossroads: Crossroads,
  Farmstead: Farmstead,
  ForestLair: ForestLair,
  MonsterLair: MonsterLair,
  SnowVillage: SnowVillage,
  SwampLair: SwampLair,
  Tavern: Tavern,
  UndergroundComplex: UndergroundComplex,
  UrbanLair: UrbanLair,
  WagonTrailandShrine: WagonTrailandShrine,
  WaterfallCavern: WaterfallCavern,
  AbandonedWarehouse: AbandonedWarehouse,
  DaggerAlley: DaggerAlley,
  UnderDaggerAlley: UnderDaggerAlley,
  TrollSkullAlleyBasement: TrollSkullAlleyBasement,
  TrollSkullAlleyHouse: TrollSkullAlleyHouse,
  WeddingRing: WeddingRing
};

export class Map {
  _id: string;
  name: string;
  file: string;
  gridWidth: number;
  gridHeight: number;

  constructor(
    _id: string, 
    name: string,
    fileName: string, 
    width: number, 
    height: number) {
    this._id = _id;
    this.name = name;
    this.file = MapFile[fileName];
    this.gridWidth = width;
    this.gridHeight = height;
  }
}