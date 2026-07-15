import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { fetchSkins } from './api/apiSkins';

jest.mock('./api/apiSkins', () => ({
  fetchSkins: jest.fn(),
}));

const mockedFetchSkins = fetchSkins as jest.MockedFunction<typeof fetchSkins>;

const renderApp = () =>
  render(
    <GoogleOAuthProvider clientId="test-client-id">
      <App />
    </GoogleOAuthProvider>,
  );

describe('App browsing experience', () => {
  beforeEach(() => {
    mockedFetchSkins.mockResolvedValue([
      {
        id: '1',
        name: 'AK-47 | Redline',
        description: 'A classic rifle.',
        weapon: { id: 'w1', weapon_id: 7, name: 'AK-47' },
        category: { id: 'c1', name: 'Rifle' },
        pattern: { id: 'p1', name: 'Default' },
        min_float: 0.01,
        max_float: 0.8,
        rarity: { id: 'r1', name: 'Covert', color: '#eb4b4b' },
        stattrak: false,
        souvenir: false,
        paint_index: '1',
        wears: [],
        collections: [],
        crates: [],
        team: { id: 't1', name: 'N/A' },
        legacy_model: false,
        image: 'https://example.com/skin.png',
      },
      {
        id: '2',
        name: 'Sport Gloves | Pandora',
        description: 'A glove skin.',
        weapon: { id: 'w2', weapon_id: 100, name: 'Sport Gloves' },
        category: { id: 'c2', name: 'Gloves' },
        pattern: { id: 'p2', name: 'Default' },
        min_float: 0.01,
        max_float: 0.8,
        rarity: { id: 'r2', name: 'Restricted', color: '#b8c0ff' },
        stattrak: false,
        souvenir: false,
        paint_index: '2',
        wears: [],
        collections: [],
        crates: [],
        team: { id: 't2', name: 'N/A' },
        legacy_model: false,
        image: 'https://example.com/glove.png',
      },
      {
        id: '3',
        name: 'Karambit | Doppler',
        description: 'A knife skin.',
        weapon: { id: 'w3', weapon_id: 500, name: 'Karambit' },
        category: { id: 'c3', name: 'Knife' },
        pattern: { id: 'p3', name: 'Default' },
        min_float: 0.01,
        max_float: 0.8,
        rarity: { id: 'r3', name: 'Classified', color: '#ff8c42' },
        stattrak: false,
        souvenir: false,
        paint_index: '3',
        wears: [],
        collections: [],
        crates: [],
        team: { id: 't3', name: 'N/A' },
        legacy_model: false,
        image: 'https://example.com/knife.png',
      },
    ]);
  });

  it('shows the browse controls and a skin card', async () => {
    renderApp();

    expect(await screen.findByText(/Browse skins by rarity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all items/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by rarity/i)).toBeInTheDocument();
    expect(await screen.findByText('AK-47 | Redline')).toBeInTheDocument();
  });

  it('shows type filters for gloves and knives tabs', async () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /gloves/i }));
    expect(await screen.findByLabelText(/filter by gloves/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /sport gloves/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /knives/i }));
    expect(await screen.findByLabelText(/filter by knives/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /karambit/i })).toBeInTheDocument();
  });
});
