import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { fetchSkins } from './api/apiSkins';

jest.mock('./api/apiSkins', () => ({
  fetchSkins: jest.fn(),
}));

const mockedFetchSkins = fetchSkins as jest.MockedFunction<typeof fetchSkins>;

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
    ]);
  });

  it('shows the browse controls and a skin card', async () => {
    render(<App />);

    expect(await screen.findByText(/Browse skins by rarity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all items/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by rarity/i)).toBeInTheDocument();
    expect(await screen.findByText('AK-47 | Redline')).toBeInTheDocument();
  });
});
