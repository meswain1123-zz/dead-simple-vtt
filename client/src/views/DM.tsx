import React, { Component } from "react";
import { connect, ConnectedProps } from 'react-redux';
import styled
// , { css } 
from "styled-components";
import {
  Button
} from "@material-ui/core";
import { PlayMap } from "../models/PlayMap";
// import { PlayToken } from "../models/PlayToken";
import { Token } from "../models/Token";
// import ReactPanZoom from "../components/my-react-pan-zoom";
import CreatePlayMap from "../components/CreatePlayMap";
import LoadPlayMap from "../components/LoadPlayMap";
import DisplayPlayMap from "../components/DisplayPlayMap";
// import ReduxTest from "../components/ReduxTest";
// import SVGTest from "../components/SVGTest";
import API from "../smartAPI";

const HEADER_HEIGHT = 50;
// const Container = css`
//   height: calc(100vh - ${HEADER_HEIGHT}px);
//   width: 100vw;
//   overflow: hidden;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 1;
// `;
// const ControlsContainer = styled.div`
//   position: fixed;
//   background: lightgray;
//   height: 100%;
//   right: 0;
//   z-index: 2;
//   cursor: pointer;
//   user-select: none;

//   > div {
//     padding: 15px;
//     &:hover {
//       background: darkgray;
//     }
//     &:active {
//       box-shadow: 1px 1px 1px inset;
//     }
//   }
// `;

const Heading = styled.div`
  background: dimgrey;
  color: white;
  height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  padding-left: 10px;
`;

// const Icons = styled.strong`
//   font-size: 2rem;
// `;

// const mapStateToProps = state => {
//   return {
//     // width: state.app.width
//   };
// };
// function mapDispatchToProps(dispatch) {
//   return {
//     // notFromLogin: () => dispatch(notFromLogin({}))
//   };
// }

interface AppState {
  tokens: Token[],
  selectedPlayMap: PlayMap
}

interface RootState {
  app: AppState
}

const mapState = (state: RootState) => ({
  tokens: state.app.tokens,
  selectedPlayMap: state.app.selectedPlayMap
});

const mapDispatch = {
  // setMaps: (maps: Map[]) => ({ type: 'SET_MAPS', payload: maps }),
  // setPlayMaps: (playMaps: PlayMap[]) => ({ type: 'SET_PLAYMAPS', payload: playMaps }),
  // addPlayMap: (playMap: PlayMap) => ({ type: 'ADD_PLAYMAP', payload: playMap }),
  selectPlayMap: (playMap: PlayMap) => ({ type: 'SELECT_PLAYMAP', payload: playMap }),
  updatePlayMap: (playMap: PlayMap) => ({ type: 'UPDATE_PLAYMAP', payload: playMap })
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
}
export interface IDMPageStateType {
  mode: string;
  selectedTokenID: number;
  hoveredTokenID: number;
  deselecting: boolean;
}
class DMPage extends Component<
  Props,
  IDMPageStateType
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: "load",
      selectedTokenID: -1,
      hoveredTokenID: -1,
      deselecting: false
    };
    this.api = API.getInstance();
  }

  api: any;

  componentDidMount() {}

  createPlayMap = () => {
    this.setState({
      mode: "create"
    })
  }

  loadPlayMap = () => {
    this.setState({
      mode: "load"
    })
  }

  savePlayMap = () => {
    this.api.updatePlayMap(this.props.selectedPlayMap.toDBObj()).then(() => {
    });
  }

  selectPlayMap = (playMap: PlayMap) => {
    this.props.selectPlayMap(playMap);
    this.setState({ mode: "main" });
  }

  renderHeader = () => {
    return (
      <Heading key="heading"> 
        Dead Simple VTT - DM Page 
        <Button onClick={this.createPlayMap}>Create PlayMap</Button>
        <Button onClick={this.loadPlayMap}>Load PlayMap</Button>
        <Button onClick={this.savePlayMap} disabled={this.props.selectedPlayMap === null}>Save PlayMap (I'll change this to auto-save later)</Button>
      </Heading>
    );
  };

  renderMain = () => {
    if (this.state.mode === "load") {
      return (
        <LoadPlayMap key="main" mode="DM" selectPlayMap={this.selectPlayMap} />
      );
      // return (
      //   <ReduxTest key="main" backgroundColor="red" />
      // );
      
    //   <style type='text/css'>
    //   div, img { position:absolute; top:0; left:0; width:250px; height:250px; }
    //   img {
    //     -webkit-mask-image:-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
    //     mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
    //   }
    // </style>
      // return (
      //   <div>
      //     <div style={{ position:"relative", top:0, left:0, width:250, height:250 }}>
      //       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi sit amet porttitor massa. Morbi eget tortor congue, aliquet odio a, viverra metus. Ut cursus enim eu felis sollicitudin, vitae eleifend urna lobortis. Mauris elementum erat non facilisis cursus. Fusce sit amet lacus dictum, porta libero sed, euismod tellus. Aenean erat augue, sodales sed gravida ac, imperdiet ac augue. Ut condimentum dictum mauris. Donec tincidunt enim a massa molestie, vel volutpat massa dictum. Donec semper odio vitae adipiscing lacinia.</div>
      //     <img src='https://i.imgur.com/sLa5gg2.jpg' alt='testing'
      //       style={{ 
      //         position:"relative", top:0, left:0, width:250, height:250,
      //         WebkitMaskImage:"-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))",
      //         maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))"
      //       }} />
      //   </div>
      // );
    } else if (this.state.mode === "create") {
      return (
        <CreatePlayMap key="main" selectPlayMap={this.selectPlayMap} />
      );
    } else {
      if (this.props.selectedPlayMap) {
        return (
          <DisplayPlayMap key="main" mode="DM" />
        );
        // const StyledReactPanZoom = styled(ReactPanZoom)`
        //   ${Container};
        // `;
        // return (
        //   <StyledReactPanZoom key="main"
        //     zoom={this.state.playMap.zoom}
        //     pandx={this.state.playMap.dx}
        //     pandy={this.state.playMap.dy}
        //     onPan={this.onPan}
        //     onClick={this.onClick}
        //     enableClick={this.state.mode === "move"}
        //   >
        //     <div style={{position: "relative", left: ((-1 * window.innerWidth / 2) + 0), top: ((-1 * window.innerHeight / 2) + 25)}}>
        //       <img style={{
        //           position: "absolute",
        //           top: 0,
        //           left: 0
        //         }} src="https://i.imgur.com/WJ17gs5.jpg" alt="testing" />
        //       { this.state.playMap.tokens.map((t, key) => {
        //         return (
        //           <div key={key} style={{
        //             position: "absolute",
        //             left: t.x + (window.innerWidth / 2) - (t.size * 25),
        //             top: t.y + (window.innerHeight / 2) - 25 - (t.size * 25),
        //             width: t.size * 50,
        //             height: t.size * 50,
        //             backgroundColor: (t.id === this.state.selectedTokenID ? "blue" : "transparent"),
        //             borderRadius: (t.size * 25)
        //           }}
        //           onMouseEnter={() => {
        //             // console.log(t.id);
        //             this.setState({ hoveredTokenID: t.id });
        //           }}
        //           onMouseLeave={() => {
        //             if (this.state.hoveredTokenID === t.id) {
        //               // console.log(t.id);
        //               this.setState({ hoveredTokenID: -1 });
        //             }
        //           }}>
        //             <img src={t.token.file} alt="testing" 
        //               style={{
        //                 width: t.size * 50,
        //                 height: t.size * 50
        //               }}
        //             />
        //           </div>
        //         );
        //       })}
        //     </div>
        //   </StyledReactPanZoom>
        // );
      } else {
        return (
          <div key="main" style={{ margin: 10 }}>
            Load a Map to see it here
          </div>
        );
      }
    }
  };

  render() {
    return [
      this.renderHeader(),
      this.renderMain()
    ];
  }
}

export default connector(DMPage);
