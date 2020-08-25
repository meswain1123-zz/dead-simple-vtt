
import { Token } from "./Token";

export class PlayToken {
  id: number;
  name: string;
  token: Token;
  x: number;
  y: number;
  size: number;

  constructor(
    id: number, 
    name: string,
    token: Token,
    x: number,
    y: number,
    size: number) {
    this.id = id;
    this.name = name;
    this.token = token;
    this.x = x;
    this.y = y;
    this.size = size;
  }

  toDBObj = () => {
    return {
      id: this.id,
      name: this.name,
      tokenID: this.token._id,
      x: this.x,
      y: this.y,
      size: this.size
    };
  }
}