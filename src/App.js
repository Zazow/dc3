import React from 'react';
import logo from './logo.svg';
import data from "./all-nodes.json"
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';


let categories = []

for (let node of data) {
    categories.push(node.name)
}

console.log(categories)

let root = {};



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

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Hello dc3
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
