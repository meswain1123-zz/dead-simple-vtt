import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import { connect, ConnectedProps } from 'react-redux';
import { 
  Route, 
  Switch } from "react-router-dom";
  // import { connect } from "react-redux";
import HomePage from "./Home";
import DMPage from "./DM";
import PlayerPage from "./Player";
import { Map } from "../models/Map";
import { Token } from "../models/Token";
import { PlayMap } from "../models/PlayMap";
import { PlayToken } from "../models/PlayToken";
import { Mask, MaskPoint } from "../models/Mask";
import { FavoriteToken } from "../models/FavoriteToken";
import API from "../smartAPI";
// import Grid from "@material-ui/core/Grid";
// import {
//   // toggleLogin
// } from "../redux/actions/index";

interface AppState {
  maps: Map[] | null
}

interface RootState {
  app: AppState
}

const mapState = (state: RootState) => ({
  maps: state.app.maps
})

const mapDispatch = {
  setMaps: (maps: Map[]) => ({ type: 'SET_MAPS', payload: maps }),
  setPlayMaps: (playMaps: PlayMap[]) => ({ type: 'SET_PLAYMAPS', payload: playMaps }),
  setTokens: (tokens: Token[]) => ({ type: 'SET_TOKENS', payload: tokens }),
  setFavoriteTokens: (favoriteTokens: FavoriteToken[]) => ({ type: 'SET_FAVORITETOKENS', payload: favoriteTokens }),
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & { }

export interface IMainPageStateType { }

class MainPage extends Component<
  Props,
  IMainPageStateType
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      version: "0"
    };
    this.api = API.getInstance();
  }

  api: any;

  componentDidMount() {
  }

  render() {
    if (this.props.maps === null) {
      this.api.getAllVTT(0, true).then((res: any) => {
        if (res !== undefined && res.error === undefined) {
          const maps: Map[] = [];
          res.maps.forEach((m: any) => {
            maps.push(new Map(m._id, m.name, m.fileName, m.gridWidth, m.gridHeight));
          });
          this.props.setMaps(maps);
          const tokens: Token[] = [];
          res.tokens.forEach((t: any) => {
            tokens.push(new Token(t._id, t.fileName));
          });
          this.props.setTokens(tokens);
          const favoriteTokens: FavoriteToken[] = [];
          res.favoriteTokens.forEach((t: any) => {
            const tokenFinder: Token[] = tokens.filter(t2 => t2._id === t.tokenID);
            if (tokenFinder.length === 1)
            {
              const token: Token = tokenFinder[0];
              favoriteTokens.push(new FavoriteToken(t._id, t.name, token, t.size));
            }
          });
          this.props.setFavoriteTokens(favoriteTokens);
          const playMaps: PlayMap[] = [];
          res.playMaps.forEach((m: any) => {
            const mapFinder: Map[] = maps.filter(m2 => m2._id === m.mapID);
            if (mapFinder.length === 1)
            {
              const map: Map = mapFinder[0];
              const playTokens: PlayToken[] = [];
              m.playTokens.forEach((t: any) => {
                const tokenFinder: Token[] = tokens.filter(t2 => t2._id === t.tokenID);
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
              playMaps.push(new PlayMap(m._id, m.name, map, playTokens, lightMasks, darkMasks, fogMasks, m.zoom, m.dx, m.dy));
            }
          });
          this.props.setPlayMaps(playMaps);
        }
      });
      return (
        <div key="main">Loading Data</div>
      )
    } else {
      return (
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/home" component={HomePage} />
          <Route exact path="/dm" component={DMPage} />
          <Route exact path="/player" component={PlayerPage} />
        </Switch>
      );
    }
  }
}

// const MainPage = connect(mapStateToProps, mapDispatchToProps)(Page);
// export default MainPage;

export default connector(MainPage);