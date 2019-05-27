import * as React from "react";

export class CustomToggle extends React.Component<{ onClick(e: any): any }, any> {
    constructor(props, context) {
        super(props, context);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();

        this.props.onClick(e);
    }

    render() {
        return <div onClick={this.handleClick} style={{ cursor: 'pointer' }}>
            {this.props.children}
        </div>;
    }
}