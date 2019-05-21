import React, { Component } from 'react';
import { StationsList } from "./StationsList";
import { SingleArtist } from "./Stations/SingleArtist";
import { Col, Grid, Row } from "react-bootstrap";
import { Tag } from "./Stations/Tag";
import { SimilarArtists } from "./Stations/SimilarArtists";
import { inject } from "mobx-react";
import { BaseProps } from "../BaseProps";

@inject('appState')
export class Home extends Component<BaseProps> {
    displayName = Home.name

    render() {
        return <div>
            <StationsList>
                <Grid fluid={true}>
                    <Row>
                        <Col md={6}><SingleArtist appState={this.props.appState}/></Col>
                        <Col md={6}><Tag/></Col>
                    </Row>
                    <Row>
                        <Col md={6}><SimilarArtists/></Col>
                    </Row>
                </Grid>
            </StationsList>
        </div>;
    }
}
