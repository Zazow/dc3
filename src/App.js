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
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '@material-ui/icons/Search';
import { InputAdornment } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    }
  },
  dataText: {
    position: "absolute",
    right: 130
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.8),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.9),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  uploadButton: {
    position: 'absolute',
    wdith: 100,
    right: 30
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


function aggregateCategories(data) {
  let cats = new Set();
  for (let node of data) {
    cats.add(node.name)
  }
  return Array.from(cats);
}

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
  const [fileName, setFileName] = useState("allNodes.json");
  const [categories, setCategories] = useState(aggregateCategories(data));
  const [selectedNodeID, setSelectedNodeID] = useState(0);
  const [path, setPath] = useState([root]);
  const [searchedNode, setSearchedNode] = useState('oiuoiufg89du0sdig');
  const [isLoadingData, setIsLoadingData] = useState(false);
   
  const handleFile = (file) => {
    let parts = file.name.split('.');
    let fileExtension = parts[parts.length - 1].toLowerCase();
    console.log(fileExtension);
    if (fileExtension === "json") {
      setIsLoadingData(true);
      let reader = new FileReader();
      reader.onload=(e)=> {
        let json = JSON.parse(e.target.result);
        setCategories(aggregateCategories(json));
        setRoot(compileTree(json, 0, 0));
        setPath([root]);
        setFileName(file.name);
        setIsLoadingData(false);
      }
      reader.readAsText(file);
      let data = file
      //let newRoot = compileTree()
      console.log(data);
    }
    else if (fileExtension === "csv" || fileExtension === "xls" || fileExtension === "xlsx") {
      setIsLoadingData(true);
      let reader = new FileReader();
      reader.onload = (e) => {
        let json = csv2json(e.target.result, {parseNumbers: true, parseJSON: true});
        setCategories(aggregateCategories(json));
        setRoot(compileTree(json, 0, 0));
        setPath([root]);
        setFileName(file.name);
        setIsLoadingData(false);
      }
      reader.readAsText(file);
    }
    else {
      console.log(fileExtension);
    }
  }

  const classes = useStyles();
  return (
    <div className="App" class={classes.root}>

    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          className={classes.title}
          variant="h5" noWrap>
          DC3 Final Handin
        </Typography>
        <div class={classes.search}>
          <Autocomplete
            options={categories}
            style={{width: 300}}
            disableListWrap
            ListboxComponent={ListboxComponent}
            renderInput={params => (
              <TextField 
                {...params} 
                label="Search"
                variant="outlined"
                // InputProps={{
                //   startAdornment: (
                //     <InputAdornment position="start">
                //       <SearchIcon />
                //     </InputAdornment>
                //   )
                // }}
                fullWidth 
              />
            )}
            onChange={(event, value) => {
                setSearchedNode(value);
              }
            }
          />
        </div>

            
        <Typography
          className={classes.dataText}
          variant="h7" noWrap
        >
          Currently using: {fileName} | Got different data?
        </Typography>
      
        <div class={classes.uploadButton}> 
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
            <Button variant="contained" color="secondary" component="span">
              Upload
            </Button>
          </label>
        </div>
      </Toolbar>
    </AppBar>

    

      <BreadCrumbs path={path} onCatClicked={(index) => {
          setPath(path.slice(0, index + 1));
          setRoot(path[index]);
        }}
        style={{padding: 10, paddingBottom: 0}}
      />

      
      {
      isLoadingData? 
      <div style={{textAlign: 'center'}}>
        <CircularProgress size={200}/>
      </div>:
      <div style={{ width: '100%', height: window.innerHeight - 150}}>
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
              if (node.categories.has(searchedNode)) {
                console.log(node);
                let val = (node.height - root.height)*60;
                return "rgb("+val+","+val+","+val+")";
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
