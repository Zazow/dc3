import React from 'react';
import logo from './logo.svg';
import data from "./csvjson.json"
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { ResponsiveTreeMapCanvas } from '@nivo/treemap';
import { FixedSizeList } from 'react-window';

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

const MAX_HEIGHT = 100;

function compileTree(data, id, height) {
  let children = data[id].children;
  let root = {
    name: data[id].name,
    loc: data[id].productCount,
    id: id,
    children: []
  };

  for (let child of children) {
    if (height + 1 < MAX_HEIGHT) {
      root.children.push(compileTree(data, child, height + 1));
    }
  }

  return root;
}

let categories = []

for (let node of data) {
    categories.push(node.name)
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedNodeID: 0,
      root: compileTree(data, 0, 0)
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
        />

        {
        
        <div style={{ width: window.innerWidth,  height: window.innerHeight}}>
          <ResponsiveTreeMapCanvas
            root={this.state.root}
            identity="name"
            innerPadding={3}
            outerPadding={3}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            label="name"
            value='loc'
            labelFormat=".0s"
            labelSkipSize={12}
            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.2 ] ] }}
            colors={{ scheme: 'nivo' }}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.3 ] ] }}
            animate={true}
            onClick={(node) => {
              console.log(node);
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

export default App;
