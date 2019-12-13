import React from 'react';
import Button from '@material-ui/core/Button';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ButtonGroup from '@material-ui/core/ButtonGroup';


class BreadCrumbs extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let path = [];
    for (let i = 0; i < this.props.path.length; i++) {
        let node = this.props.path[i];
        console.log(node);
        path.push(<Button 
          variant="contained"
          onClick={() => {this.props.onCatClicked(i)}} 
          >
              {node.name} 
          </Button>
        );
        if (i < this.props.path.length - 1) {
          path.push(
              <ArrowForwardIosIcon style={{marginBottom: -8}} />
          );
        }
          
    }
    return (
      <div style={{...this.props.style, verticalAlign: 'middle'}}>
          
        {path}
      
      </div>
    );
  }
}

export default BreadCrumbs;
