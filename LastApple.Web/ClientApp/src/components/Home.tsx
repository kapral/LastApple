import React, { Component } from 'react';
import { StationsList } from "./StationsList";
import { SingleArtist } from "./Stations/SingleArtist";
import { Col, Grid, Row } from "react-bootstrap";
import { Tag } from "./Stations/Tag";
import { SimilarArtists } from "./Stations/SimilarArtists";

export class Home extends Component {
    displayName = Home.name

    render() {
        return <div>
            <StationsList>
                <Grid fluid={true}>
                    <Row>
                        <Col md={6}><SingleArtist/></Col>
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
