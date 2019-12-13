import React from 'react';
import logo from './logo.svg';
import data from "./csvjson.json"
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { ResponsiveTreeMapCanvas } from './Components/treemap';
import { FixedSizeList } from 'react-window';
import BreadCrumbs from './Components/BreadCrumbs';

function renderRow(props) {
  const { data, index, style } = props;

  return React.cloneElement(data[index], {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
      ...style,
    },
  });
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const itemCount = Array.isArray(children) ? children.length : 0;
  const itemSize = smUp ? 36 : 48;

  const outerElementType = React.useMemo(() => {
    return React.forwardRef((props2, ref2) => <div ref={ref2} {...props2} {...other} />);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref}>
      <FixedSizeList
        style={{ padding: 0, height: Math.min(8, itemCount) * itemSize, maxHeight: 'auto' }}
        itemData={children}
        height={250}
        width="100%"
        outerElementType={outerElementType}
        innerElementType="ul"
        itemSize={itemSize}
        overscanCount={5}
        itemCount={itemCount}
      >
        {renderRow}
      </FixedSizeList>
    </div>
  );
});

/*
ListboxComponent.propTypes = {
  children: PropTypes.node,
};
*/


function compileTree(data, id, height) {
  let children = data[id].children;
  let root = {
    name: data[id].name,
    loc: data[id].productCount,
    id: id,
    height: height,
    children: []
  };

  let allCategories = new Set([data[id].name]);

  for (let child of children) {
    let childRoot = compileTree(data, child, height + 1);
    root.children.push(childRoot);
    allCategories = new Set([...allCategories, ...childRoot.categories]);
  }

  root.categories = allCategories;


  return root;
}

let categories = []

for (let node of data) {
    categories.push(node.name)
}

const colors = ['#E7C1A2', '#F27664', '#F1E066', '#E7A744', '#66CDBB', '#9AE3D5'];

class App extends React.Component {
  constructor(props) {
    super(props);
    let root = compileTree(data, 0, 0);
    console.log(root);
    this.state = {
      selectedNodeID: 0,
      root: root,
      path: [root],
      searchedNode: '9898dssds98ds9d8sd98s'
    }
  }



  render() {
    return (
      <div className="App">

        <Autocomplete
        id="combo-box-demo"
        options={categories}
        getOptionLabel={option => option}
        style={{ width: 300 }}
        disableListWrap
        ListboxComponent={ListboxComponent}
        renderInput={params => (
          <TextField {...params} label="Combo box" variant="outlined" fullWidth />
        )}
        onChange={(event, value) => {
            this.setState({searchedNode: value}); 
          }
        }
        />

        <BreadCrumbs path={this.state.path} onCatClicked={(index) => {
          let path = this.state.path;
          this.setState({path: path.slice(0, index + 1), root: path[index]});
        }}/>
        {
        
        <div style={{ width: window.innerWidth,  height: window.innerHeight}}>
          <ResponsiveTreeMapCanvas
            root={this.state.root}
            identity="name"
            innerPadding={3}
            outerPadding={5}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            label="name"
            enableLabel={false}
            value='loc'
            labelFormat=".0s"
            labelSkipSize={12}
            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.2 ] ] }}
            colors={node => {
                if (node.categories.has(this.state.searchedNode) && (node.name !== this.state.root.name)) {
                  return 'black';
                }
                else {
                  return colors[node.height%colors.length]
                }
              }
            }
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.3 ] ] }}
            animate={true}
            onClick={(node) => {
              console.log('setting root node to', node.data);
              let path = this.state.path;
              path.push(node.data);
              this.setState({root: node.data, path: path});
            }}
            motionStiffness={90}
            motionDamping={11}
          />
        </div>
      
        }
      </div>
    );
  }
}


/* <div style={{ width: window.innerWidth,  height: window.innerHeight}}>
          <TreeMap
            id="myTreeMap"
            height={window.innerHeight}
            width={window.innerWidth}
            data={this.state.root}
            valueUnit={"Products"}
          />
        </div> 
        */

export default App;
