import React, {useState} from 'react';
import logo from './logo.svg';
import data from "./csvjson.json"
import './App.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles, fade } from '@material-ui/core/styles';
import { ResponsiveTreeMapCanvas } from './Components/treemap';
import { FixedSizeList } from 'react-window';
import BreadCrumbs from './Components/BreadCrumbs';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';


const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const csv2json = require('csvjson-csv2json');

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



const colors = ['#E7C1A2', '#F27664', '#F1E066', '#E7A744', '#66CDBB', '#9AE3D5'];

const App = () => {
  const [root, setRoot] = useState(compileTree(data, 0, 0));
  let cats = [];
  for (let node of data) {
    cats.push(node.name)
  }

  const [categories, setCategories] = useState(cats);
  const [selectedNodeID, setSelectedNodeID] = useState(0);
  const [path, setPath] = useState([root]);
  const [searchedNode, setSearchedNode] = useState('oiuoiufg89du0sdig');
   
  const handleFile = (file) => {
    if (file.type === "application/json") {
      let reader = new FileReader();
      reader.onload=(e)=> {
        let json = JSON.parse(e.target.result);
        console.log(json);
        let cats = [];
        for (let node of json) {
          cats.push(node.name)
        }
        setCategories(cats);
        setRoot(compileTree(json, 0, 0));
        setPath([root]);
      }
      reader.readAsText(file);
      let data = file
      //let newRoot = compileTree()
      console.log(data);
    }
    else if (file.type === "application/vnd.ms-excel") {
      let reader = new FileReader();
      reader.onload = (e) => {
        let json = csv2json(e.target.result, {parseNumbers: true, parseJSON: true});
        let cats = [];
        for (let node of json) {
          cats.push(node.name)
        }
        setCategories(cats);
        setRoot(compileTree(json, 0, 0));
        setPath([root]);
      }
      reader.readAsText(file);
    }
    else {
      console.log(file.type);
    }
  }

  const classes = useStyles();
  return (
    <div className="App">

    <AppBar position="static">
      <Toolbar>
        <Typography
          className={classes.title}
          variant="h6" noWrap>
          DC3 Final Handin
        </Typography>
        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <Autocomplete
            id="combo-box-demo"
            options={categories}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            placeholder="Search…"
            getOptionLabel={option => option}
            style={{ width: 300 }}
            disableListWrap
            ListboxComponent={ListboxComponent}
            renderInput={params => (
              <TextField {...params} label="Combo box" variant="outlined" fullWidth />
            )}
            onChange={(event, value) => {
                setSearchedNode(value);
              }
            }
          />
        </div>
        
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>

    

      <BreadCrumbs path={path} onCatClicked={(index) => {
        setPath(path.slice(0, index + 1));
        setRoot(path[index]);
      }}/>

      <input
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .json "
        style={{display: 'none'}}
        id="contained-button-file"
        multiple
        type="file"
        onChange={(e)=>{
          handleFile(e.target.files[0]);
        }}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload
        </Button>
      </label>
      {
        
      
      <div style={{ width: '1400px',  height: '1000px'}}>
        <ResponsiveTreeMapCanvas
          root={root}
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
              if (node.categories.has(searchedNode) && (node.name !== root.name)) {
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
            path.push(node.data);
            setPath(path);
            setRoot(node.data);
          }}
          motionStiffness={90}
          motionDamping={11}
        />
      </div>
    
      }
    </div>
  );
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
