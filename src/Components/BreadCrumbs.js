import React from 'react';
import Button from '@material-ui/core/Button';
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
            </Button>);
    }
    return (
      <div>
          <ButtonGroup size="small" aria-label="small outlined button group">
            {path}
          </ButtonGroup>
      </div>
    );
  }
}

export default BreadCrumbs;
