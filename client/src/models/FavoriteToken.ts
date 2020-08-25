
import { Token } from "./Token";

export class FavoriteToken {
  _id: string;
  name: string;
  token: Token;
  size: number;

  constructor(
    _id: string, 
    name: string,
    token: Token,
    size: number) {
    this._id = _id;
    this.name = name;
    this.token = token;
    this.size = size;
  }


  toDBObj = () => {
    return {
      _id: this._id,
      name: this.name,
      tokenID: this.token._id,
      size: this.size
    };
  }
}