import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StationsList } from '../../components/StationsList';

// Mock the StationDescriptor component
jest.mock('../../components/StationDescriptor', () => ({
  StationDescriptor: ({ definition, StationComponent }: any) => (
    <div data-testid="station-descriptor">
      <div data-testid="station-title">{definition.title}</div>
      <div data-testid="station-description">{definition.description}</div>
      <StationComponent />
    </div>
  )
}));

// Mock all station components
jest.mock('../../components/Stations/MyLibrary', () => ({
  MyLibrary: () => <div data-testid="my-library-component">My Library</div>
}));

jest.mock('../../components/Stations/SingleArtist', () => ({
  SingleArtist: () => <div data-testid="single-artist-component">Single Artist</div>
}));

jest.mock('../../components/Stations/SimilarArtists', () => ({
  SimilarArtists: () => <div data-testid="similar-artists-component">Similar Artists</div>
}));

jest.mock('../../components/Stations/Tag', () => ({
  Tag: () => <div data-testid="tag-component">Tag</div>
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('StationsList', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );
  });

  it('applies station-list class to container', () => {
    const { container } = render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    expect(container.querySelector('.station-list')).toBeInTheDocument();
  });

  it('has proper styling for container', () => {
    const { container } = render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    const stationList = container.querySelector('.station-list');
    expect(stationList).toHaveStyle({
      padding: '5px',
      display: 'grid'
    });
  });

  it('renders all station descriptors', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    const descriptors = screen.getAllByTestId('station-descriptor');
    expect(descriptors).toHaveLength(4);
  });

  it('renders MyLibrary station component', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    expect(screen.getByTestId('my-library-component')).toBeInTheDocument();
  });

  it('renders SingleArtist station component', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    expect(screen.getByTestId('single-artist-component')).toBeInTheDocument();
  });

  it('renders SimilarArtists station component', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    expect(screen.getByTestId('similar-artists-component')).toBeInTheDocument();
  });

  it('renders Tag station component', () => {
    render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    expect(screen.getByTestId('tag-component')).toBeInTheDocument();
  });

  it('maintains component state correctly', () => {
    const { container } = render(
      <TestWrapper>
        <StationsList />
      </TestWrapper>
    );

    // The component should maintain its initial state
    expect(container.querySelector('.station-list')).toBeInTheDocument();
    
    // All station components should be rendered
    expect(screen.getByTestId('my-library-component')).toBeInTheDocument();
    expect(screen.getByTestId('single-artist-component')).toBeInTheDocument();
    expect(screen.getByTestId('similar-artists-component')).toBeInTheDocument();
    expect(screen.getByTestId('tag-component')).toBeInTheDocument();
  });
});