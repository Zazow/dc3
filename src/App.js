import React from 'react';
import logo from './logo.svg';
import data from "./csvjson.json"
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { ResponsiveTreeMap } from '@nivo/treemap'

function compileTree(data, id) {
  let children = data[id].children;
  let root = {
    name: data[id].name,
    loc: data[id].productCount,
    children: []
  };
  for (let child of children) {
    root.children.push(compileTree(data, child));
  }

  return root;
}

let categories = []

for (let node of data) {
    categories.push(node.name)
}


let root = compileTree(data, 0);
console.log(root);

function App() {
  return (
    <div className="App">

      <Autocomplete
      id="combo-box-demo"
      options={categories}
      getOptionLabel={option => option}
      style={{ width: 300 }}
      disableListWrap
      renderInput={params => (
        <TextField {...params} label="Combo box" variant="outlined" fullWidth />
      )}
      />

      <div style={{ width: window.innerWidth,  height: window.innerHeight}}>
      <ResponsiveTreeMap
        root={root}
        identity="name"
        value="loc"
        innerPadding={3}
        outerPadding={3}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        label="name"
        labelFormat=".0s"
        labelSkipSize={12}
        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.2 ] ] }}
        colors={{ scheme: 'nivo' }}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.3 ] ] }}
        animate={true}
        motionStiffness={90}
        motionDamping={11}
      />
      </div>
    </div>
  );
}

export default App;
