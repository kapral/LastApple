import React, { Component } from 'react';
import { LastfmAuthManager } from "./LastfmAuthManager";
import { StationsList } from "./StationsList";
import { SingleArtist } from "./Stations/SingleArtist";
import { Col, Grid, Row } from "react-bootstrap";
import { Tag } from "./Stations/Tag";

export class Home extends Component {
    displayName = Home.name

    render() {
        return <div>
            <LastfmAuthManager/>
            <StationsList>
                <Grid fluid={true}>
                    <Row>
                        <Col md={6}><SingleArtist/></Col>
                        <Col md={6}><Tag/></Col>
                    </Row>
                </Grid>
            </StationsList>
        </div>;
    }
}
