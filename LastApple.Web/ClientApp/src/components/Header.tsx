import { Component } from "react";
import * as React from "react";
import logo from '../content/headphones-logo.png'
import { LastfmAuthManager } from "./LastfmAuthManager";

export class Header extends Component {
    render() {
        return <div className={'header'} style={{
            background: '#000',
            padding: '10px 10px 10px 25px'
        }}>
            <img style={{
                height: '80px'
            }} src={logo} alt={'logo'}/>
            <div style={{
                display: 'inline-block',
                verticalAlign: 'top',
                width: 'calc(100% - 75px)'
            }}>
                <div style={{ float: 'right' }}>
                    <LastfmAuthManager/>
                </div>
                <h2 style={{
                    margin: '0 0 20px',
                    color: '#DDD'
                }}><span style={{ marginLeft: 'calc(50% - 100px)'}}>last apple</span></h2>
                <div style={{
                    display: 'inline-block'
                }}>
                </div>
            </div>
        </div>;
    }
}