
import Bald from "../assets/img/tokens/Bald.png";
import Bard from "../assets/img/tokens/Bard.png";
import BlondeHair from "../assets/img/tokens/BlondeHair.png";
import BlondeWoman from "../assets/img/tokens/BlondeWoman.png";
import BlueSkin from "../assets/img/tokens/BlueSkin.png";
import BlueSkin2 from "../assets/img/tokens/BlueSkin2.png";
import DarkSkin from "../assets/img/tokens/DarkSkin.png";
import DarkSkinF from "../assets/img/tokens/DarkSkinF.png";
import Dragonborn from "../assets/img/tokens/Dragonborn.png";
import DragonbornFighter from "../assets/img/tokens/DragonbornFighter.png";
import DwarfMale from "../assets/img/tokens/DwarfMale.png";
import ElvenFemale from "../assets/img/tokens/ElvenFemale.png";
import ElvenFighter from "../assets/img/tokens/ElvenFighter.png";
import Eyebrows from "../assets/img/tokens/Eyebrows.png";
import Eyebrows2 from "../assets/img/tokens/Eyebrows2.png";
import Fedora from "../assets/img/tokens/Fedora.png";
import GnomeMale from "../assets/img/tokens/GnomeMale.png";
import GoliathBarb from "../assets/img/tokens/GoliathBarb.png";
import GreyHair from "../assets/img/tokens/GreyHair.png";
import HalflingMale from "../assets/img/tokens/HalflingMale.png";
import Hood from "../assets/img/tokens/Hood.png";
import Hood2 from "../assets/img/tokens/Hood2.png";
import Human from "../assets/img/tokens/Human.png";
import HumanFemale from "../assets/img/tokens/HumanFemale.png";
import HumanFemale2 from "../assets/img/tokens/HumanFemale2.png";
import HumanFighterF from "../assets/img/tokens/HumanFighterF.png";
import HumanFighterM from "../assets/img/tokens/HumanFighterM.png";
import HumanMale from "../assets/img/tokens/HumanMale.png";
import HumanMale2 from "../assets/img/tokens/HumanMale2.png";
import IDK from "../assets/img/tokens/idk.png";
import Knight from "../assets/img/tokens/Knight.png";
import OldWoman from "../assets/img/tokens/OldWoman.png";
import OldWoman2 from "../assets/img/tokens/OldWoman2.png";
import RedHair from "../assets/img/tokens/RedHair.png";
import RedSkin from "../assets/img/tokens/RedSkin.png";
import Samurai from "../assets/img/tokens/Samurai.png";
import Scarf from "../assets/img/tokens/Scarf.png";
import TieflingFemale from "../assets/img/tokens/TieflingFemale.png";
import Wizard from "../assets/img/tokens/Wizard.png";
import Rat from "../assets/img/tokens/Rat.png";
import Wererat from "../assets/img/tokens/Wererat.png";
import Werewolf from "../assets/img/tokens/Werewolf.png";
import RugOfSmothering from "../assets/img/tokens/RugOfSmothering.jpeg";
import PitTrapWSpikes from "../assets/img/tokens/PitTrapWSpikes.png";

interface IHash {
  [details: string] : string;
} 
const TokenFile: IHash = {
  Bald: Bald,
  Bard: Bard,
  BlondeHair: BlondeHair,
  BlondeWoman: BlondeWoman,
  BlueSkin: BlueSkin,
  BlueSkin2: BlueSkin2,
  DarkSkin: DarkSkin,
  DarkSkinF: DarkSkinF,
  Dragonborn: Dragonborn,
  DragonbornFighter: DragonbornFighter,
  DwarfMale: DwarfMale,
  ElvenFemale: ElvenFemale,
  ElvenFighter: ElvenFighter,
  Eyebrows: Eyebrows,
  Eyebrows2: Eyebrows2,
  Fedora: Fedora,
  GnomeMale: GnomeMale,
  GoliathBarb: GoliathBarb,
  GreyHair: GreyHair,
  HalflingMale: HalflingMale,
  Hood: Hood,
  Hood2: Hood2,
  Human: Human,
  HumanFemale: HumanFemale,
  HumanFemale2: HumanFemale2,
  HumanFighterF: HumanFighterF,
  HumanFighterM: HumanFighterM,
  HumanMale: HumanMale,
  HumanMale2: HumanMale2,
  IDK: IDK,
  Knight: Knight,
  OldWoman: OldWoman,
  OldWoman2: OldWoman2,
  RedHair: RedHair,
  RedSkin: RedSkin,
  Samurai: Samurai,
  Scarf: Scarf,
  TieflingFemale: TieflingFemale,
  Wizard: Wizard,
  Rat: Rat,
  Wererat: Wererat,
  Werewolf: Werewolf,
  RugOfSmothering: RugOfSmothering,
  PitTrapWSpikes: PitTrapWSpikes
};

export class Token {
  _id: string;
  file: string;

  constructor(
    _id: string, 
    fileName: string) {
    this._id = _id;
    this.file = TokenFile[fileName];
  }
}