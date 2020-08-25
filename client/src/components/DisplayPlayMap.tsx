
import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import { connect, ConnectedProps } from 'react-redux';
import {
  FormControl,
  OutlinedInput,
  InputLabel,
  // FormHelperText,
  Button, 
  Grid,
  // List, ListItem, ListItemText
} from "@material-ui/core";
import styled, { css } from "styled-components";
import ReactPanZoom from "./my-react-pan-zoom";
import { PlayMap } from "../models/PlayMap";
import { Map } from "../models/Map";
import { PlayToken } from "../models/PlayToken";
import { Mask, MaskPoint } from "../models/Mask";
import { FavoriteToken } from "../models/FavoriteToken";
import { Token } from "../models/Token";
import FogOfWar from "../assets/img/Fog.jpg";
import API from "../smartAPI";

// This displays the PlayMap.  
// If in DM mode then it can be modified, and the changes
// are saved and carried over to Player mode.

const HEADER_HEIGHT = 30;
const Container = css`
  height: calc(100vh - ${HEADER_HEIGHT}px);
  width: 100vw;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;
const ControlsContainer = styled.div`
  position: fixed;
  background: lightgray;
  height: 100%;
  right: 0;
  z-index: 2;
  cursor: pointer;
  user-select: none;

  > div {
    padding: 15px;
    &:hover {
      background: darkgray;
    }
    &:active {
      box-shadow: 1px 1px 1px inset;
    }
  }
`;

const Heading = styled.div`
  background: dimgrey;
  color: white;
  height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  padding-left: 10px;
`;

const Icons = styled.strong`
  font-size: 2rem;
`;


interface AppState {
  selectedPlayMap: PlayMap;
  tokens: Token[];
  favoriteTokens: FavoriteToken[];
  maps: Map[];
}

interface RootState {
  app: AppState
}

const mapState = (state: RootState) => ({
  selectedPlayMap: state.app.selectedPlayMap,
  tokens: state.app.tokens,
  favoriteTokens: state.app.favoriteTokens,
  maps: state.app.maps
})

const mapDispatch = {
  // setMaps: (maps: Map[]) => ({ type: 'SET_MAPS', payload: maps }),
  // setPlayMaps: (playMaps: PlayMap[]) => ({ type: 'SET_PLAYMAPS', payload: playMaps }),
  addFavoriteToken: (favoriteToken: FavoriteToken) => ({ type: 'ADD_FAVORITETOKEN', payload: favoriteToken }),
  updateFavoriteToken: (favoriteToken: FavoriteToken) => ({ type: 'UPDATE_FAVORITETOKEN', payload: favoriteToken }),
  updatePlayMap: (playMap: PlayMap) => ({ type: 'UPDATE_PLAYMAP', payload: playMap })
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  // playMap: PlayMap,
  mode: string
}

export interface IDisplayPlayMapStateType {
  // playMap: PlayMap;
  mapMode: string;
  selected: (PlayToken | MaskPoint)[];
  hovered: PlayToken | MaskPoint | null;
  shiftHeld: boolean;
  ctrlHeld: boolean;
  deselecting: boolean;
  controlMode: string;
  controlSubMode: string;
  lastRefresh: Date;
  tokenName: string;
  tokenSize: number;
  tokenCount: number;
  // These are separate from the other selected 
  // because they're in the controls instead of the map
  selectedToken: Token | null;
  selectedFavoriteToken: FavoriteToken | null;
  selectedMask: Mask | null;
  countdown: number;
  refreshing: boolean;
}
// export interface IDisplayPlayMapProps {
//   maps: Map[];
//   addPlayMap: (playMap: PlayMap) => void;
// }
class DisplayPlayMap extends Component<
  Props,
  IDisplayPlayMapStateType
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      // playMap: props.playMap,
      mapMode: "pan",
      selected: [],
      hovered: null,
      shiftHeld: false,
      ctrlHeld: false,
      deselecting: false,
      controlMode: "main",
      controlSubMode: "add",
      lastRefresh: new Date(),
      tokenName: "",
      tokenSize: 1,
      tokenCount: 1,
      selectedToken: null,
      selectedFavoriteToken: null,
      selectedMask: null,
      countdown: 2,
      refreshing: false
    };
    this.api = API.getInstance();
    // TODO: I need to put in a method that contacts the API and 
    // gets the latest version of this.props.selectedPlayMap.
    // Once it gets it, it updates it, and then restarts the timer.
    // I'll have the timer be displayed, and it only triggers when
    // it hits zero.
    // Other than that I just need to test it.
    // And of course get some more maps to put in, and set up some 
    // PlayMaps.
    if (props.mode !== "DM") {
      setTimeout(this.countdown, 1000);
    }
  }

  api: any;

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener("keyup", this.onKeyUp.bind(this));
  }

  countdown = () => {
    if (this.state.countdown > 0) {
      this.setState({ countdown: this.state.countdown - 1 }, () => {
        setTimeout(this.countdown, 1000);
      });
    } else {
      this.setState({ countdown: 0, refreshing: true }, this.refresh);
    }
  }

  refresh = () => {
    this.api.getPlayMap(this.props.selectedPlayMap._id).then((m: any) => {
      const mapFinder: Map[] = this.props.maps.filter(m2 => m2._id === m.mapID);
      if (mapFinder.length === 1)
      {
        const map: Map = mapFinder[0];
        const playTokens: PlayToken[] = [];
        m.playTokens.forEach((t: any) => {
          const tokenFinder: Token[] = this.props.tokens.filter(t2 => t2._id === t.tokenID);
          if (tokenFinder.length === 1)
          {
            const token: Token = tokenFinder[0];
            playTokens.push(new PlayToken(t.id, t.name, token, t.x, t.y, t.size));
          }
        });
        const lightMasks: Mask[] = [];
        m.lightMasks.forEach((l: any) => {
          const points: MaskPoint[] = [];
          l.points.forEach((p: any) => {
            points.push(new MaskPoint(p.id, l.id, "light", p.x, p.y));
          });
          lightMasks.push(new Mask(l.id, "light", points));
        });
        const darkMasks: Mask[] = [];
        m.darkMasks.forEach((l: any) => {
          const points: MaskPoint[] = [];
          l.points.forEach((p: any) => {
            points.push(new MaskPoint(p.id, l.id, "dark", p.x, p.y));
          });
          darkMasks.push(new Mask(l.id, "dark", points));
        });
        const fogMasks: Mask[] = [];
        m.fogMasks.forEach((l: any) => {
          const points: MaskPoint[] = [];
          l.points.forEach((p: any) => {
            points.push(new MaskPoint(p.id, l.id, "fog", p.x, p.y));
          });
          fogMasks.push(new Mask(l.id, "fog", points));
        });
        const playMap = new PlayMap(m._id, m.name, map, playTokens, lightMasks, darkMasks, fogMasks, m.zoom, m.dx, m.dy);
        this.props.updatePlayMap(playMap);
        this.setState({ 
          refreshing: false, 
          countdown: 4, 
          lastRefresh: new Date() 
        }, () => {
          setTimeout(this.countdown, 1000);
        });
      }
    });
  }

  zoomIn = () => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      newPlayMap.zoom += 0.2;
      // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
      // });
    }
  };

  zoomOut = () => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      newPlayMap.zoom -= 0.2;
      // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
      // });
    }
  };

  clearSelectAndHover = () => {
    this.setState({
      mapMode: "pan",
      selected: [],
      hovered: null
    });
  };

  addNewToken = () => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      if (this.state.selectedToken) {
        const token = this.state.selectedToken;
        for (let i = 0; i < this.state.tokenCount; i++) {
          newPlayMap.tokens.push(new PlayToken(
            newPlayMap.tokens.length,
            this.state.tokenName.trim() + (i > 0 ? ` ${i+1}` : ""),
            token,
            i - Math.round(this.state.tokenCount / 2),
            0,
            this.state.tokenSize)
          );
        }
        // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
        // });
      } else if (this.state.selectedFavoriteToken) {
        const token = this.state.selectedFavoriteToken;
        newPlayMap.tokens.push(new PlayToken(
          newPlayMap.tokens.length,
          this.state.tokenName.trim(),
          token.token,
          0,
          0,
          this.state.tokenSize)
        );
        // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
          this.props.updatePlayMap(newPlayMap);
          this.setState({
            lastRefresh: new Date()
          });
        // });
      }
    }
  };

  deletePlayToken = (token: PlayToken) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      newPlayMap.tokens = newPlayMap.tokens.filter(t => t.id !== token.id);
      newPlayMap.tokens.filter(t => t.id > token.id).forEach(t => {
        t.id--;
      });
      this.props.updatePlayMap(newPlayMap);
      this.setState({
        lastRefresh: new Date()
      });
    }
  }

  adjustPlayToken = (t: PlayToken, name: string, size: number, x: number, y: number) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      const theToken: PlayToken = t;
      const selectedTokens = newPlayMap.tokens.filter(t => t.id === theToken.id);
      if (selectedTokens.length === 1) {
        const selectedToken = selectedTokens[0];
        selectedToken.name = name;
        selectedToken.size = size;
        selectedToken.x = x;
        selectedToken.y = y;

        // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date(),
          hovered: selectedToken
        });
        // });
      }
    }
  }

  addNewFavorite = () => {
    if (this.state.selectedToken) {
      const token = this.state.selectedToken;

      const obj = {
        name: this.state.tokenName,
        tokenID: token._id,
        size: this.state.tokenSize
      };

      this.api.createFavoriteToken(obj).then((res: any) => {
        const newFavorite = new FavoriteToken(res.favoriteTokenID, this.state.tokenName, token, this.state.tokenSize);
        this.props.addFavoriteToken(newFavorite);
        this.setState({
          lastRefresh: new Date()
        });
      });

      // newPlayMap.tokens.push(new PlayToken(
      //   newPlayMap.tokens.length,
      //   this.state.tokenName.trim(),
      //   token,
      //   0,
      //   0,
      //   this.state.tokenSize)
      // );
      // // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
      //   this.props.updatePlayMap(newPlayMap);
      //   this.setState({
      //     lastRefresh: new Date()
      //   });
      // // });
    }
  };

  deleteFavorite = (token: PlayToken) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      newPlayMap.tokens = newPlayMap.tokens.filter(t => t.id !== token.id);
      newPlayMap.tokens.filter(t => t.id > token.id).forEach(t => {
        t.id--;
      });
      this.props.updatePlayMap(newPlayMap);
      this.setState({
        lastRefresh: new Date()
      });
    }
  }

  adjustFavorite = (t: FavoriteToken, name: string, size: number) => {
    const theToken: FavoriteToken = t;
    const tokenFinder = this.props.favoriteTokens.filter(t => t._id === theToken._id);
    if (tokenFinder.length === 1) {
      const token = tokenFinder[0];
      token.name = name;
      token.size = size;

      this.api.updateFavoriteToken(token.toDBObj()).then(() => {
        this.props.updateFavoriteToken(token);
        this.setState({
          lastRefresh: new Date()
        });
      });
    }
  }

  onPan = (dx: number, dy: number) => {
    // I need to make this respond to some types of held keys with clicks
    // I'm thinking I'm going to make it allow for multiSelects
    if (this.props.selectedPlayMap && this.props.mode === "DM") {
      const newPlayMap = this.props.selectedPlayMap;
      if (this.state.deselecting) {
        this.setState({ deselecting: false });
      } else {
        if (this.state.hovered === null && this.state.selected.length === 0) {
          // it's an actual pan, so pan it.
          newPlayMap.dx = dx;
          newPlayMap.dy = dy;
          // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
            this.props.updatePlayMap(newPlayMap);
            this.setState({
              lastRefresh: new Date()
            });
          // });
        } else if (this.state.hovered !== null && this.state.selected.includes(this.state.hovered)) {
          // They're deselecting.
          // If it goes here, there's a problem
          // const newSelected = this.state.selected.filter(s => s !== this.state.hovered);
          // if (newSelected.length === 0) {
          //   this.setState({
          //     selected: newSelected, 
          //     mapMode: "pan"
          //   });
          // } else {
          //   this.setState({
          //     selected: newSelected
          //   });
          // }
        } else if (this.state.hovered !== null) {
          // They're selecting
          if (this.state.selected.length === 0 || this.state.shiftHeld) {
            const newSelected = this.state.selected;
            newSelected.push(this.state.hovered);
            this.setState({
              selected: newSelected,
              mapMode: "move"
            });
          }
        }
      }
    }
  };

  onClick = (x: number, y: number) => {
    // I need to make this respond to some types of held keys plus clicks
    if (this.state.selected.length > 0 && this.props.selectedPlayMap && this.props.mode === "DM") {
      const newPlayMap: PlayMap = this.props.selectedPlayMap;
      if (this.state.hovered === null) {
        // They're moving stuff.  Only allow it if there's only one selected.
        if (this.state.selected.length === 1) {
          this.state.selected.forEach((s: PlayToken | MaskPoint) => {
            // Need to figure out what the selected thing is and move it to the location
            if (s instanceof PlayToken) {
              const theToken: PlayToken = s;
              const selectedTokens = newPlayMap.tokens.filter(t => t.id === theToken.id);
              if (selectedTokens.length === 1) {
                const selectedToken = selectedTokens[0];
                // This translates the clicked coordinates into the proper format
                selectedToken.x = Math.round(((x - (window.innerWidth / 2) - newPlayMap.dx + 25) / newPlayMap.zoom)/50);
                selectedToken.y = Math.round(((y - (window.innerHeight / 2) - newPlayMap.dy - 37.5) / newPlayMap.zoom)/50);

                // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
                  this.props.updatePlayMap(newPlayMap);
                  this.setState({
                    lastRefresh: new Date(),
                    hovered: selectedToken
                  });
                // });
              }
            } else if (s instanceof MaskPoint) {
              const thePoint: MaskPoint = s;
              const masks = s.maskType === "light" ? this.props.selectedPlayMap.lightMasks : s.maskType === "dark" ? this.props.selectedPlayMap.darkMasks : this.props.selectedPlayMap.fogMasks;
              const selectedMasks = masks.filter(m => m.id === thePoint.maskID);
              if (selectedMasks.length === 1) {
                const selectedMask = selectedMasks[0];
                const selectedPoints = selectedMask.points.filter(p => p.id === thePoint.id);
                if (selectedPoints.length === 1) {
                  const selectedPoint = selectedPoints[0];
                  // This translates the clicked coordinates into the proper format
                  // selectedPoint.x = Math.round(((x - (window.innerWidth / 2) - newPlayMap.dx + 25) / newPlayMap.zoom)/50);
                  // selectedPoint.y = Math.round(((y - (window.innerHeight / 2) - newPlayMap.dy - 37.5) / newPlayMap.zoom)/50);
                  selectedPoint.x = ((x - (window.innerWidth / 2) - newPlayMap.dx + 50) / newPlayMap.zoom)/50;
                  selectedPoint.y = ((y - (window.innerHeight / 2) - newPlayMap.dy) / newPlayMap.zoom)/50;

                  // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
                    this.props.updatePlayMap(newPlayMap);
                    this.setState({
                      lastRefresh: new Date(),
                      hovered: selectedPoint
                    });
                  // });
                }
              }
            }
          });
        }
      } else if (!this.state.selected.includes(this.state.hovered)) {
        // They're selecting
        if (this.state.selected.length === 0 || this.state.shiftHeld) {
          const newSelected = this.state.selected;
          newSelected.push(this.state.hovered);
          this.setState({
            selected: newSelected,
            mapMode: "move"
          });
        }
      } else {
        // They're deselecting.
        const newSelected = this.state.selected.filter(s => s !== this.state.hovered);
        if (newSelected.length === 0) {
          this.setState({
            selected: newSelected, 
            mapMode: "pan",
            deselecting: true
          });
        } else {
          this.setState({
            selected: newSelected,
            deselecting: true
          });
        }
      }
    }
  };

  renderFavoriteTokenList = (edit: boolean) => {
    if (edit) {
      return (
        <Grid item container spacing={1} direction="row">
        { this.props.favoriteTokens.map((t, key) => {
          return (
            <Grid item key={key} container spacing={1} direction="row">
              <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor={`text_field_favorite_token_name_${key}`}>Name</InputLabel>
                    <OutlinedInput
                      id={`text_field_favorite_token_name_${key}`}
                      name={`text_field_favorite_token_name_${key}`}
                      type="text"
                      autoComplete="Off"
                      value={t.name}
                      onChange={e => {
                        this.adjustFavorite(t, e.target.value, t.size);
                        // this.setState({ tokenName: e.target.value });
                      }}
                      labelWidth={40}
                      fullWidth
                    />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor={`text_field_favorite_token_size_${key}`}>Size</InputLabel>
                    <OutlinedInput
                      id={`text_field_favorite_token_size_${key}`}
                      name={`text_field_favorite_token_size_${key}`}
                      type="number"
                      autoComplete="Off"
                      value={t.size}
                      onChange={e => {
                        this.adjustFavorite(t, t.name, parseFloat(e.target.value));
                        // this.setState({ tokenSize: parseFloat(e.target.value) });
                      }}
                      labelWidth={40}
                      fullWidth
                    />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <img src={t.token.file} style={{ width: 140 }} alt={t.name} />
              </Grid>
              <Grid item xs={6}>
                <Button onClick={() => {
                  // this.deleteFavoriteToken(t);
                }}>
                  Delete
                </Button>
              </Grid>
            </Grid>  
          );
        })}
        </Grid>
      );
    } else {
      return (
        <Grid item container spacing={1} direction="row">
        { this.props.favoriteTokens.map((token, key) => {
          return (
            <Grid item key={key} xs={6} 
              style={{ cursor: "pointer", backgroundColor: (this.state.selectedFavoriteToken !== null && token._id === this.state.selectedFavoriteToken._id ? "blue" : "transparent") }}
              onClick={() => {
                this.setState({
                  selectedFavoriteToken: token,
                  selectedToken: null,
                  tokenName: token.name,
                  tokenSize: token.size
                });
              }}>
              <img src={token.token.file} style={{ width: 140 }} alt={token.name} />
              {token.name}
            </Grid>
          );
        })}
        </Grid>
      );
    }
  }

  renderTokenList = () => {
    return (
      <Grid item container spacing={1} direction="row">
      { this.props.tokens.map((token, key) => {
        return (
          <Grid item key={key} xs={6} 
            style={{ cursor: "pointer", backgroundColor: (this.state.selectedToken !== null && token._id === this.state.selectedToken._id ? "blue" : "transparent") }}
            onClick={() => {
              this.setState({
                selectedToken: token,
                selectedFavoriteToken: null
              });
            }}>
            <img src={token.file} style={{ width: 140 }} alt={token.file} />
          </Grid>
        );
      })}
      </Grid>
    );
  }

  renderPlayTokenList = () => {
    return (
      <Grid item container spacing={1} direction="column">
      { this.props.selectedPlayMap.tokens.map((t, key) => {
        return (
          <Grid item key={key} container spacing={1} direction="row">
            <Grid item xs={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor={`text_field_play_token_name_${key}`}>Name</InputLabel>
                  <OutlinedInput
                    id={`text_field_play_token_name_${key}`}
                    name={`text_field_play_token_name_${key}`}
                    type="text"
                    autoComplete="Off"
                    value={t.name}
                    onChange={e => {
                      this.adjustPlayToken(t, e.target.value, t.size, t.x, t.y);
                      // this.setState({ tokenName: e.target.value });
                    }}
                    labelWidth={40}
                    fullWidth
                  />
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor={`text_field_play_token_size_${key}`}>Size</InputLabel>
                  <OutlinedInput
                    id={`text_field_play_token_size_${key}`}
                    name={`text_field_play_token_size_${key}`}
                    type="number"
                    autoComplete="Off"
                    value={t.size}
                    onChange={e => {
                      this.adjustPlayToken(t, t.name, parseFloat(e.target.value), t.x, t.y);
                      // this.setState({ tokenSize: parseFloat(e.target.value) });
                    }}
                    labelWidth={40}
                    fullWidth
                  />
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor={`text_field_lmp_x_${key}`}>X</InputLabel>
                  <OutlinedInput
                    id={`text_field_lmp_x_${key}`}
                    name={`text_field_lmp_x_${key}`}
                    type="number"
                    autoComplete="Off"
                    value={t.x}
                    onChange={e => {
                      this.adjustPlayToken(t, t.name, t.size, parseInt(e.target.value), t.y);
                      // this.moveLMP(p, 'y', e.target.value);
                      // this.setState({ tokenSize: parseInt(e.target.value) });
                    }}
                    labelWidth={40}
                    fullWidth
                  />
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor={`text_field_lmp_y_${key}`}>Y</InputLabel>
                  <OutlinedInput
                    id={`text_field_lmp_y_${key}`}
                    name={`text_field_lmp_y_${key}`}
                    type="number"
                    autoComplete="Off"
                    value={t.y}
                    onChange={e => {
                      this.adjustPlayToken(t, t.name, t.size, t.x, parseInt(e.target.value));
                      // this.moveLMP(p, 'y', e.target.value);
                      // this.setState({ tokenSize: parseInt(e.target.value) });
                    }}
                    labelWidth={40}
                    fullWidth
                  />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <img src={t.token.file} style={{ width: 140 }} alt={t.name} />
            </Grid>
            <Grid item xs={6}>
              <Button onClick={() => {
                this.deletePlayToken(t);
              }}>
                Delete
              </Button>
            </Grid>
          </Grid>
        );
      })}
      </Grid>
    );
  }

  moveLMP = (lmp: MaskPoint, xy: string, value: string) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      const masks = lmp.maskType === "light" ? newPlayMap.lightMasks : lmp.maskType === "dark" ? newPlayMap.darkMasks : newPlayMap.fogMasks;
      const maskFinder = masks.filter(m => m.id === lmp.maskID);
      if (maskFinder.length === 1) {
        const mask = maskFinder[0];
        const pointFinder = mask.points.filter(p => p.id === lmp.id);
        if (pointFinder.length === 1) {
          const point = pointFinder[0];
          if (xy === 'x') {
            point.x = parseFloat(value);
          } else {
            point.y = parseFloat(value);
          }
        }
      }
      // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
      // });
    }
  }

  addNewPoint = (mask: Mask) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      const masks = mask.maskType === "light" ? newPlayMap.lightMasks : mask.maskType === "dark" ? newPlayMap.darkMasks : newPlayMap.fogMasks;
      const maskFinder = masks.filter(m => m.id === mask.id);
      if (maskFinder.length === 1) {
        const theMask = maskFinder[0];
        const firstPoint = theMask.points[0];
        theMask.points.push(new MaskPoint(theMask.points.length, theMask.id, theMask.maskType, firstPoint.x + 1, firstPoint.y + 1));

        // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
          this.props.updatePlayMap(newPlayMap);
          this.setState({
            lastRefresh: new Date()
          });
        // });
      }
    }
  }

  deletePoint = (point: MaskPoint) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      const masks = point.maskType === "light" ? newPlayMap.lightMasks : point.maskType === "dark" ? newPlayMap.darkMasks : newPlayMap.fogMasks;
      const maskFinder = masks.filter(m => m.id === point.maskID);
      if (maskFinder.length === 1) {
        const mask = maskFinder[0];
        mask.points = mask.points.filter(p => p.id !== point.id);
        mask.points.filter(p => p.id > point.id).forEach(p => {
          p.id--;
        });
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
      }
    }
  }

  deleteMask = (mask: Mask) => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      let masks = mask.maskType === "light" ? newPlayMap.lightMasks : mask.maskType === "dark" ? newPlayMap.darkMasks : newPlayMap.fogMasks;
      masks = masks.filter(m => m.id !== mask.id);
      masks.filter(m => m.id > mask.id).forEach(m => {
        m.id--;
      });
      if (mask.maskType === "light") {
        newPlayMap.lightMasks = masks;
      } else if (mask.maskType === "dark") {
        newPlayMap.darkMasks = masks;
      } else {
        newPlayMap.fogMasks = masks;
      }
      this.props.updatePlayMap(newPlayMap);
      this.setState({
        lastRefresh: new Date()
      });
    }
  }

  renderMaskList = () => {
    const masks = this.state.controlSubMode === "light" ? this.props.selectedPlayMap.lightMasks : this.state.controlSubMode === "dark" ? this.props.selectedPlayMap.darkMasks : this.props.selectedPlayMap.fogMasks;
    return (
      <Grid container spacing={1} direction="column">
        <Grid item>{ this.state.controlSubMode === "light" ? "Light Masks" : this.state.controlSubMode === "dark" ? "Dark Masks" : "Fog Masks" }</Grid>
      { masks.map((mask: Mask, key) => {
        return (
          <Grid item key={key} 
            style={{ cursor: "pointer", backgroundColor: (this.state.selectedMask !== null && mask === this.state.selectedMask ? "blue" : "transparent") }}
            container spacing={1} direction="column">
            <Grid item
              onClick={() => {
                this.setState({
                  selectedMask: mask
                });
              }}>
              {mask.toClipPath(this.props.selectedPlayMap.map.gridWidth, this.props.selectedPlayMap.map.gridHeight)}
            </Grid>
            { this.state.selectedMask !== null && mask === this.state.selectedMask && 
              <Grid item container spacing={1} direction="column">
                { mask.points.map((p, pkey) => {
                  return (
                    <Grid item container key={pkey} spacing={1} direction="row">
                      <Grid item xs={6}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel htmlFor={`text_field_lmp_x_${pkey}`}>X</InputLabel>
                            <OutlinedInput
                              id={`text_field_lmp_x_${pkey}`}
                              name={`text_field_lmp_x_${pkey}`}
                              type="number"
                              autoComplete="Off"
                              value={p.x}
                              onChange={e => {
                                this.moveLMP(p, 'x', e.target.value);
                                // this.setState({ tokenName: e.target.value });
                              }}
                              labelWidth={40}
                              fullWidth
                            />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel htmlFor={`text_field_lmp_y_${pkey}`}>Y</InputLabel>
                            <OutlinedInput
                              id={`text_field_lmp_y_${pkey}`}
                              name={`text_field_lmp_y_${pkey}`}
                              type="number"
                              autoComplete="Off"
                              value={p.y}
                              onChange={e => {
                                this.moveLMP(p, 'y', e.target.value);
                                // this.setState({ tokenSize: parseInt(e.target.value) });
                              }}
                              labelWidth={40}
                              fullWidth
                            />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Button onClick={() => {
                          this.deletePoint(p);
                        }}>
                          Delete
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
                <Grid item>
                  <Button onClick={() => {
                    this.addNewPoint(mask);
                  }}>
                    Add New Point
                  </Button>
                  <Button onClick={() => {
                    this.deleteMask(mask);
                  }}>
                    Delete Mask
                  </Button>
                </Grid>
              </Grid>
            }
            
          </Grid>
        );
      })}
      </Grid>
    );
  }

  addNewMask = () => {
    if (this.props.selectedPlayMap) {
      const newPlayMap = this.props.selectedPlayMap;
      const masks = this.state.controlSubMode === "light" ? newPlayMap.lightMasks : this.state.controlSubMode === "dark" ? newPlayMap.darkMasks : newPlayMap.fogMasks;
      const points: MaskPoint[] = [
        new MaskPoint(0, masks.length, this.state.controlSubMode, 0, 0),
        new MaskPoint(1, masks.length, this.state.controlSubMode, 1, 0),
        new MaskPoint(2, masks.length, this.state.controlSubMode, 1, 1),
        new MaskPoint(3, masks.length, this.state.controlSubMode, 0, 1)
      ];
      masks.push(new Mask(
        masks.length, this.state.controlSubMode, 
        points)
      );
      // this.api.updatePlayMap(newPlayMap.toDBObj()).then(() => {
        this.props.updatePlayMap(newPlayMap);
        this.setState({
          lastRefresh: new Date()
        });
      // });
    }
  };

  renderControls = () => {
    if (this.props.selectedPlayMap && this.props.mode === "DM") {
      if (this.state.controlMode === "tokens") {
        return (
          <ControlsContainer key="controls" style={{ width: 300 }}>
            <Heading>Tokens</Heading>
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
                <Button onClick={() => { this.setState({ controlSubMode: "add" }); }}>
                  Add
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button onClick={() => { this.setState({ controlSubMode: "edit" }); }}>
                  Edit
                </Button>
              </Grid>
            </Grid>
            { this.state.controlSubMode === "add" ? 
              <Grid container spacing={1} direction="column">
                <Grid container spacing={1} direction="row">
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="text_field_play_token_name">Name</InputLabel>
                        <OutlinedInput
                          id={`text_field_play_token_name`}
                          name={`text_field_play_token_name`}
                          type="text"
                          autoComplete="Off"
                          value={this.state.tokenName}
                          onChange={e => {
                            this.setState({ tokenName: e.target.value });
                          }}
                          labelWidth={40}
                          fullWidth
                        />
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="text_field_play_token_size">Size</InputLabel>
                        <OutlinedInput
                          id={`text_field_play_token_size`}
                          name={`text_field_play_token_size`}
                          type="number"
                          autoComplete="Off"
                          value={this.state.tokenSize}
                          onChange={e => {
                            this.setState({ tokenSize: parseFloat(e.target.value) });
                          }}
                          labelWidth={40}
                          fullWidth
                        />
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel htmlFor="text_field_play_token_count">Count</InputLabel>
                        <OutlinedInput
                          id={`text_field_play_token_count`}
                          name={`text_field_play_token_count`}
                          type="number"
                          autoComplete="Off"
                          value={this.state.tokenCount}
                          onChange={e => {
                            this.setState({ tokenCount: Math.max(1, parseInt(e.target.value)) });
                          }}
                          labelWidth={40}
                          fullWidth
                        />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid item>
                  <div style={{ height: (window.innerHeight - 400), overflowX: "hidden", overflowY: "scroll" }}>
                    <Grid container spacing={1} direction="column">
                      <Grid item>
                        { this.renderFavoriteTokenList(false) }
                      </Grid>
                      <Grid item>
                        { this.renderTokenList() }
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
              </Grid>
            :
              <Grid container spacing={1} direction="column" style={{ height: (window.innerHeight - 300), overflowX: "hidden", overflowY: "scroll" }}>
                { this.renderPlayTokenList() }
              </Grid>
            }
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
              { this.state.controlSubMode === "add" && 
                <Button 
                  onClick={this.addNewToken} 
                  variant="contained" color="primary"
                  disabled={ this.state.tokenName === "" || (this.state.selectedToken === null && this.state.selectedFavoriteToken === null)} 
                >
                  Add New Token
                </Button>
              }
              </Grid>
              <Grid item xs={6}>
                <Button 
                  onClick={() => {
                    this.setState({ controlMode: "main" });
                  }} 
                  variant="contained" color="primary"
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </ControlsContainer>
        );
      } else if (this.state.controlMode === "masks") {
        return (
          <ControlsContainer key="controls" style={{ width: 300 }}>
            <Heading>Masks</Heading>
            <Grid container spacing={1} direction="row">
              <Grid item xs={4}>
                <Button onClick={() => { this.setState({ controlSubMode: "light" }); }}>
                  Light
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button onClick={() => { this.setState({ controlSubMode: "dark" }); }}>
                  Dark
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button onClick={() => { this.setState({ controlSubMode: "fog" }); }}>
                  Fog
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={1} direction="column">
              <Grid item style={{ height: (window.innerHeight - 280), overflowX: "hidden", overflowY: "scroll" }}>
                { this.renderMaskList() }
              </Grid>
              <Grid item container spacing={1} direction="row">
                <Grid item xs={6}>
                  <Button 
                    onClick={this.addNewMask} 
                    variant="contained" color="primary"
                  >
                    Add New Mask
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button 
                    onClick={() => {
                      this.setState({ controlMode: "main" });
                    }} 
                    variant="contained" color="primary"
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </ControlsContainer>
        );
      } else if (this.state.controlMode === "favorites") {
        return (
          <ControlsContainer key="controls" style={{ width: 300 }}>
            <Heading>Favorites</Heading>
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
                <Button onClick={() => { this.setState({ controlSubMode: "add" }); }}>
                  Add
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button onClick={() => { this.setState({ controlSubMode: "edit" }); }}>
                  Edit
                </Button>
              </Grid>
            </Grid>
            { this.state.controlSubMode === "add" ? 
              <Grid container spacing={1} direction="row">
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel htmlFor="text_field_play_token_name">Name</InputLabel>
                      <OutlinedInput
                        id={`text_field_play_token_name`}
                        name={`text_field_play_token_name`}
                        type="text"
                        autoComplete="Off"
                        value={this.state.tokenName}
                        onChange={e => {
                          this.setState({ tokenName: e.target.value });
                        }}
                        labelWidth={40}
                        fullWidth
                      />
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel htmlFor="text_field_play_token_size">Size</InputLabel>
                      <OutlinedInput
                        id={`text_field_play_token_size`}
                        name={`text_field_play_token_size`}
                        type="number"
                        autoComplete="Off"
                        value={this.state.tokenSize}
                        onChange={e => {
                          this.setState({ tokenSize: parseFloat(e.target.value) });
                        }}
                        labelWidth={40}
                        fullWidth
                      />
                  </FormControl>
                </Grid>
                <div style={{ height: (window.innerHeight - 400), overflowX: "hidden", overflowY: "scroll" }}>
                  { this.renderTokenList() }
                </div>
              </Grid>
            :
              <div style={{ height: (window.innerHeight - 300), overflowX: "hidden", overflowY: "scroll" }}>
                { this.renderFavoriteTokenList(true) }
              </div>
            }
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
                { this.state.controlSubMode === "add" &&
                  <Button 
                    onClick={this.addNewFavorite} 
                    variant="contained" color="primary"
                    disabled={ this.state.tokenName === "" || this.state.selectedToken === null } 
                  >
                    Add New Favorite
                  </Button>
                }
              </Grid>
              <Grid item xs={6}>
                <Button 
                  onClick={() => {
                    this.setState({ controlMode: "main" });
                  }} 
                  variant="contained" color="primary"
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </ControlsContainer>
        );
      } else {
        return (
          <ControlsContainer key="controls">
            <div onClick={this.zoomIn}>
              <Icons>+</Icons>
            </div>
            <div onClick={this.zoomOut}>
              <Icons>-</Icons>
            </div>
            <div onClick={this.clearSelectAndHover}>
              {this.state.mapMode === "pan" ? "P" : "M"}
            </div>
            <div onClick={() => { this.setState({ controlMode: "tokens", controlSubMode: "add" }); }}>
              T
            </div>
            <div onClick={() => { this.setState({ controlMode: "masks", controlSubMode: "light" }); }}>
              L
            </div>
            <div onClick={() => { this.setState({ controlMode: "favorites", controlSubMode: "add" }); }}>
              F
            </div>
          </ControlsContainer>
        );
      }
    } else {
      return (<div key="controls"></div>);
    }
  };

  onKeyDown = (e: any) => {
    // Change heldKeys to be individual ones like shiftHeld, ctrlHeld, etc.
    // Because there are only a few holds I'll care about.
    // I do however want to make it respond to some other keys.
    // 
    // const heldKeys = this.state.heldKeys.filter(k => k !== e.key);
    // heldKeys.push(e.key);
    // this.setState({ heldKeys });
    if (e.key === "Shift") {
      if (!this.state.shiftHeld) {
        // Shift allows adding and removing selected items.
        // If it's not held then clicking while hovering will select that
        // item and deselect all others (unless it's the only one selected,
        // then it will deselect it).
        this.setState({ shiftHeld: true });
      }
    } else if (e.key === "Control") {
      if (!this.state.ctrlHeld) {
        // Currently I don't know what I want to do for ctrl.
        // I'll probably have a use for it, so I'll track it being held for now
        this.setState({ ctrlHeld: true });
      }
    } else if (e.key === "Alt") {
      this.clearSelectAndHover();
    } else if (e.key === "w") {
      this.slideSelected(0, -1);
    } else if (e.key === "a") {
      this.slideSelected(-1, 0);
    } else if (e.key === "s") {
      this.slideSelected(0, 1);
    } else if (e.key === "d") {
      this.slideSelected(1, 0);
    } else {
      console.log(e);
    }
  }

  slideSelected = (xChange: number, yChange: number) => {
    const newPlayMap = this.props.selectedPlayMap;
    this.state.selected.forEach((s: PlayToken | MaskPoint) => {
      if (s instanceof PlayToken) {
        const selToken: PlayToken = s;
        const tokenFinder = newPlayMap.tokens.filter(t => t.id === selToken.id);
        if (tokenFinder.length === 1) {
          const theToken = tokenFinder[0];
          theToken.x += xChange;
          theToken.y += yChange;
        }
      } else if (s instanceof MaskPoint) {
        const selPoint: MaskPoint = s;
        if (selPoint.maskType === "light") {
          const maskFinder = newPlayMap.lightMasks.filter(l => l.id === selPoint.maskID);
          if (maskFinder.length === 1) {
            const theMask = maskFinder[0];
            const pointFinder = theMask.points.filter(p => p.id === selPoint.id);
            if (pointFinder.length === 1) {
              const thePoint = pointFinder[0];
              thePoint.x += xChange;
              thePoint.y += yChange;
            }
          }
        } else if (selPoint.maskType === "dark") {
          const maskFinder = newPlayMap.darkMasks.filter(l => l.id === selPoint.maskID);
          if (maskFinder.length === 1) {
            const theMask = maskFinder[0];
            const pointFinder = theMask.points.filter(p => p.id === selPoint.id);
            if (pointFinder.length === 1) {
              const thePoint = pointFinder[0];
              thePoint.x += xChange;
              thePoint.y += yChange;
            }
          }
        } else if (selPoint.maskType === "fog") {
          const maskFinder = newPlayMap.fogMasks.filter(l => l.id === selPoint.maskID);
          if (maskFinder.length === 1) {
            const theMask = maskFinder[0];
            const pointFinder = theMask.points.filter(p => p.id === selPoint.id);
            if (pointFinder.length === 1) {
              const thePoint = pointFinder[0];
              thePoint.x += xChange;
              thePoint.y += yChange;
            }
          }
        }
      }
    });
    this.props.updatePlayMap(newPlayMap);
    this.setState({
      lastRefresh: new Date()
    });
  }

  onKeyUp = (e: any) => {
    if (e.key === "Shift") {
      if (this.state.shiftHeld) {
        // Shift allows adding and removing selected items.
        // If it's not held then clicking while hovering will select that
        // item and deselect all others (unless it's the only one selected,
        // then it will deselect it).
        this.setState({ shiftHeld: false });
      }
    } else if (e.key === "Control") {
      if (this.state.ctrlHeld) {
        // Currently I don't know what I want to do for ctrl.
        // I'll probably have a use for it, so I'll track it being held for now
        this.setState({ ctrlHeld: false });
      }
    }
  }

  render() {
    const StyledReactPanZoom = styled(ReactPanZoom)`
      ${Container};
    `;
    return [
      this.renderControls(),
      <StyledReactPanZoom key="main"
        zoom={this.props.selectedPlayMap.zoom}
        pandx={this.props.selectedPlayMap.dx}
        pandy={this.props.selectedPlayMap.dy}
        onPan={this.onPan}
        onClick={this.onClick}
        enableClick={this.state.mapMode === "move"}
      >
        <div style={{
            position: "relative", 
            left: ((-1 * window.innerWidth / 2) + 0), 
            top: ((-1 * window.innerHeight / 2) + 25)
          }}>
          { this.props.mode === "DM" ? // This is the image that goes behind the main map.  The lightMask clipPath.
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                opacity: 0.5,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50)
              }} 
              src={this.props.selectedPlayMap.map.file} alt="Fog of War" 
            />
          :
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: this.props.selectedPlayMap.map.gridWidth * 50,
                height: this.props.selectedPlayMap.map.gridHeight * 50
              }} 
              src={FogOfWar} alt="Fog of War" 
            />
          }
          <img style={{
              position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
              left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
              top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
              width: (this.props.selectedPlayMap.map.gridWidth * 50),
              height: (this.props.selectedPlayMap.map.gridHeight * 50),
              clipPath: "url(#lightMask)"
            }}
            src={this.props.selectedPlayMap.map.file} alt="Light Mask" 
          />
          {/* <svg width="0" height="0">
            <defs>
              <clipPath id="lightMask">
                <polygon points="13,13 13,113 113,113 113,13"/>
                <polygon points="450,10 500,200 600,100" />
                <polygon points="150,10 100,200 300,100" />
              </clipPath>
            </defs>
          </svg> */}
          <svg width="0" height="0">
            <defs>
              <clipPath id="lightMask">
              { this.props.selectedPlayMap.lightMasks.map((mask, key) => {
                return (
                  <polygon key={key} points={mask.toClipPath(this.props.selectedPlayMap.map.gridWidth, this.props.selectedPlayMap.map.gridHeight)} />
                );
              })}
              </clipPath>
            </defs>
          </svg>
          <svg width="0" height="0">
            <defs>
              <clipPath id="darkMask">
              { this.props.selectedPlayMap.darkMasks.map((mask, key) => {
                return (
                  <polygon key={key} points={mask.toClipPath(this.props.selectedPlayMap.map.gridWidth, this.props.selectedPlayMap.map.gridHeight)} />
                );
              })}
              </clipPath>
            </defs>
          </svg>
          <svg width="0" height="0">
            <defs>
              <clipPath id="fogMask">
              { this.props.selectedPlayMap.fogMasks.map((mask, key) => {
                return (
                  <polygon key={key} points={mask.toClipPath(this.props.selectedPlayMap.map.gridWidth, this.props.selectedPlayMap.map.gridHeight)} />
                );
              })}
              </clipPath>
            </defs>
          </svg>
          { this.props.mode === "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                clipPath: "url(#fogMask)"
              }}
              src={FogOfWar} alt="Fog Mask 1" 
            />
          }
          { this.props.mode === "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                opacity: 0.3,
                clipPath: "url(#fogMask)"
              }}
              src={this.props.selectedPlayMap.map.file} alt="Fog Mask 2" 
            />
          }
          { this.props.mode === "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                opacity: 0.7,
                clipPath: "url(#darkMask)"
              }}
              src={FogOfWar} alt="Dark Mask" 
            />
          }
          { this.props.selectedPlayMap.tokens.map((t, key) => {
            return (
              <div key={key} style={{
                position: "absolute",
                left: t.x * 50 + (window.innerWidth / 2) - 25 - (t.size * 25),
                top: t.y * 50 + (window.innerHeight / 2) - 25 - (t.size * 25),
                width: t.size * 50,
                height: t.size * 50,
                backgroundColor: (this.state.selected.includes(t) ? "blue" : "transparent"),
                borderRadius: (t.size * 25)
              }}
              onMouseEnter={() => {
                this.setState({ hovered: t });
              }}
              onMouseLeave={() => {
                this.setState({ hovered: null });
              }}>
                <img src={t.token.file} alt="testing" 
                  style={{
                    width: t.size * 50,
                    height: t.size * 50
                  }}
                />
                <span style={{ color: "black", fontWeight: "bold" }}>{t.name}</span>
              </div>
            );
          })}
          { this.props.mode !== "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                clipPath: "url(#fogMask)"
              }}
              src={FogOfWar} alt="Fog Mask 1" 
            />
          }
          { this.props.mode !== "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                opacity: 0.5,
                clipPath: "url(#fogMask)"
              }}
              src={this.props.selectedPlayMap.map.file} alt="Fog Mask 2" 
            />
          }
          { this.props.mode !== "DM" && 
            <img style={{
                position: "absolute", // The 0.4s are to account for the offsets.  I should make these part of the map object.
                left: (this.props.selectedPlayMap.map.gridWidth) * -25 + (window.innerWidth / 2),
                top: (this.props.selectedPlayMap.map.gridHeight) * -25 + (window.innerHeight / 2) - 25,
                width: (this.props.selectedPlayMap.map.gridWidth * 50),
                height: (this.props.selectedPlayMap.map.gridHeight * 50),
                clipPath: "url(#darkMask)"
              }}
              src={FogOfWar} alt="Dark Mask" 
            />
          }
          { this.props.mode === "DM" && this.props.selectedPlayMap.lightMasks.map((mask, mkey) => {
            return (
              <div key={mkey}>
                { mask.points.map((p, pkey) => {
                  return (
                    <div key={pkey} style={{
                      position: "absolute",
                      left: p.x * 50 + (window.innerWidth / 2) - 60,
                      top: p.y * 50 + (window.innerHeight / 2) - 60,
                      width: 20,
                      height: 20,
                      backgroundColor: (this.state.selected.includes(p) ? "green" : "yellow"),
                      borderRadius: (5)
                    }}
                    onMouseEnter={() => {
                      this.setState({ hovered: p });
                    }}
                    onMouseLeave={() => {
                      this.setState({ hovered: null });
                    }}>
                      {p.id}
                    </div>
                  );
                })}
              </div>
            );
          })}
          { this.props.mode === "DM" && this.props.selectedPlayMap.darkMasks.map((mask, mkey) => {
            return (
              <div key={mkey}>
                { mask.points.map((p, pkey) => {
                  return (
                    <div key={pkey} style={{
                      position: "absolute",
                      left: p.x * 50 + (window.innerWidth / 2) - 60,
                      top: p.y * 50 + (window.innerHeight / 2) - 60,
                      width: 20,
                      height: 20,
                      backgroundColor: (this.state.selected.includes(p) ? "green" : "purple"),
                      borderRadius: (5)
                    }}
                    onMouseEnter={() => {
                      this.setState({ hovered: p });
                    }}
                    onMouseLeave={() => {
                      this.setState({ hovered: null });
                    }}>
                      {p.id}
                    </div>
                  );
                })}
              </div>
            );
          })}
          { this.props.mode === "DM" && this.props.selectedPlayMap.fogMasks.map((mask, mkey) => {
            return (
              <div key={mkey}>
                { mask.points.map((p, pkey) => {
                  return (
                    <div key={pkey} style={{
                      position: "absolute",
                      left: p.x * 50 + (window.innerWidth / 2) - 60,
                      top: p.y * 50 + (window.innerHeight / 2) - 60,
                      width: 20,
                      height: 20,
                      backgroundColor: (this.state.selected.includes(p) ? "green" : "grey"),
                      borderRadius: (5)
                    }}
                    onMouseEnter={() => {
                      this.setState({ hovered: p });
                    }}
                    onMouseLeave={() => {
                      this.setState({ hovered: null });
                    }}>
                      {p.id}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </StyledReactPanZoom>
    ];
  }
}

export default connector(DisplayPlayMap);
