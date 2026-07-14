import React, { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { fetchSkins } from './api/apiSkins';
import type { CSSkin } from './api/skins';
import { useAuth } from './auth/useAuth';
import { LoginScreen } from './auth/LoginScreen';
import { getFavorites, addFavorite, removeFavorite } from './api/favorites';

type TabKey = 'all' | 'weapons' | 'gloves' | 'knives' | 'favorites';

const rarityOrder: Record<string, number> = {
  'Consumer Grade': 0,
  'Industrial Grade': 1,
  'Mil-Spec': 2,
  'Restricted': 3,
  Classified: 4,
  Covert: 5,
  Special: 6,
  Unknown: 99,
};

function getRarityRank(name?: string): number {
  return rarityOrder[name || 'Unknown'] ?? 99;
}

function PhotoCard({
  skin,
  isFavorite,
  onToggleFavorite,
  showFavoriteButton,
}: {
  skin: CSSkin;
  isFavorite: boolean;
  onToggleFavorite: (skin: CSSkin) => void;
  showFavoriteButton: boolean;
}) {
  return (
    <article className="skin-card">
      <div className="image-wrapper">
        <img src={skin.image || logo} alt={skin.name} className="skin-image" />
        {showFavoriteButton && (
          <button
            type="button"
            className="favorite-button"
            onClick={() => onToggleFavorite(skin)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="skin-info">
        <h3>{skin.name}</h3>
        <p>{skin.weapon?.name || 'Unknown weapon'}</p>
        <p className="skin-rarity">{skin.rarity?.name || 'Unknown rarity'}</p>
      </div>
    </article>
  );
}

function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [skins, setSkins] = useState<CSSkin[]>([]);
  const [skinsLoading, setSkinsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [weaponFilter, setWeaponFilter] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Skins load for everyone, logged in or not.
  useEffect(() => {
    let isMounted = true;

    fetchSkins()
      .then((data) => {
        if (isMounted) {
          setSkins(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load skins');
        }
      })
      .finally(() => {
        if (isMounted) {
          setSkinsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Favorites only load once a user is logged in.
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    getFavorites(user.email).then((favs) => {
      setFavoriteIds(new Set(favs.map((f: any) => f.skin_id)));
    });
  }, [user]);

  // If someone logs out while sitting on the Favorites tab, bounce them back.
  useEffect(() => {
    if (!user && activeTab === 'favorites') {
      setActiveTab('all');
    }
  }, [user, activeTab]);

  const toggleFavorite = async (skin: CSSkin) => {
    if (!user) return;
    const isFav = favoriteIds.has(skin.id);
    if (isFav) {
      await removeFavorite(user.email, skin.id);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(skin.id);
        return next;
      });
    } else {
      await addFavorite(user.email, skin.id, skin.name, skin.image);
      setFavoriteIds((prev) => new Set(prev).add(skin.id));
    }
  };

  const rarityOptions = useMemo(() => {
    return Array.from(new Set(skins.map((skin) => skin.rarity?.name || 'Unknown'))).sort(
      (a, b) => getRarityRank(a) - getRarityRank(b),
    );
  }, [skins]);

  const visibleSkins = useMemo(() => {
    const filtered = skins.filter((skin) => {
      const skinRarity = skin.rarity?.name || 'Unknown';
      return selectedRarity === 'all' || skinRarity === selectedRarity;
    });

    return [...filtered].sort((a, b) => {
      const rarityDiff = getRarityRank(a.rarity?.name) - getRarityRank(b.rarity?.name);
      if (rarityDiff !== 0) {
        return rarityDiff;
      }
      return a.name.localeCompare(b.name);
    });
  }, [selectedRarity, skins]);

  const weaponOptions = useMemo(() => {
    const options = Array.from(
      new Set(
        visibleSkins
          .map((skin) => skin.weapon?.name || '')
          .filter((name) => {
            const lower = name.toLowerCase();
            const excludedWeapons = [
              'bayonet',
              'hand wraps',
              'karambit',
              'm9 bayonet',
              'shadow daggers',
            ];
            return (
              !lower.includes('glove') &&
              !lower.includes('knife') &&
              !excludedWeapons.some((excluded) => lower.includes(excluded))
            );
          }),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return options;
  }, [visibleSkins]);

  const groupedByRarity = useMemo(() => {
    const groups = new Map<string, CSSkin[]>();

    visibleSkins.forEach((skin) => {
      const key = skin.rarity?.name || 'Unknown';
      const next = groups.get(key) || [];
      next.push(skin);
      groups.set(key, next);
    });

    return Array.from(groups.entries()).sort((a, b) => getRarityRank(a[0]) - getRarityRank(b[0]));
  }, [visibleSkins]);

  const weapons = useMemo(() => {
    const groups = new Map<string, CSSkin[]>();

    visibleSkins.forEach((skin) => {
      const weaponName = skin.weapon?.name || '';
      const weaponNameLower = weaponName.toLowerCase();
      const excludedWeapons = [
        'bayonet',
        'hand wraps',
        'karambit',
        'm9 bayonet',
        'shadow daggers',
      ];

      if (
        weaponNameLower.includes('glove') ||
        weaponNameLower.includes('knife') ||
        excludedWeapons.some((excluded) => weaponNameLower.includes(excluded))
      ) {
        return;
      }

      if (weaponFilter !== 'all' && !weaponNameLower.includes(weaponFilter.toLowerCase())) {
        return;
      }

      const key = weaponName || 'Unknown weapon';
      const next = groups.get(key) || [];
      next.push(skin);
      groups.set(key, next);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleSkins, weaponFilter]);

  const favoriteSkins = useMemo(() => {
    return skins.filter((skin) => favoriteIds.has(skin.id));
  }, [skins, favoriteIds]);

  const groupedFavorites = useMemo(() => {
    return [...favoriteSkins]
      .sort((a, b) => {
        const rarityDiff = getRarityRank(a.rarity?.name) - getRarityRank(b.rarity?.name);
        return rarityDiff !== 0 ? rarityDiff : a.name.localeCompare(b.name);
      })
      .reduce((groups, skin) => {
        const key = skin.rarity?.name || 'Unknown';
        const existing = groups.find(([r]) => r === key);
        if (existing) {
          existing[1].push(skin);
        } else {
          groups.push([key, [skin]]);
        }
        return groups;
      }, [] as [string, CSSkin[]][]);
  }, [favoriteSkins]);

  const gloves = useMemo(() => {
    const groups = new Map<string, CSSkin[]>();

    visibleSkins.forEach((skin) => {
      const weaponName = skin.weapon?.name || 'Unknown glove';
      const weaponNameLower = weaponName.toLowerCase();
      if (!weaponNameLower.includes('glove')) {
        return;
      }

      const next = groups.get(weaponName) || [];
      next.push(skin);
      groups.set(weaponName, next);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleSkins]);

  const knives = useMemo(() => {
    const groups = new Map<string, CSSkin[]>();

    visibleSkins.forEach((skin) => {
      const weaponName = skin.weapon?.name || 'Unknown knife';
      const weaponNameLower = weaponName.toLowerCase();
      if (!weaponNameLower.includes('knife')) {
        return;
      }

      const next = groups.get(weaponName) || [];
      next.push(skin);
      groups.set(weaponName, next);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleSkins]);

  if (authLoading) {
    return (
      <div className="app-shell">
        <p className="status">Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">CS:GO Skin Album</p>
          <h1>Browse skins by rarity</h1>
          <p>Explore every item and sort them from common to rare.</p>
        </div>
        {user ? (
          <div className="user-info">
            <img src={user.picture || logo} alt={user.name} className="user-avatar" />
            <span>{user.name}</span>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        ) : (
          <div className="user-info">
            <LoginScreen onSuccess={login} />
          </div>
        )}
      </header>

      <section className="controls">
        <div className="tabs" role="tablist" aria-label="Browse tabs">
          <button type="button" className={activeTab === 'all' ? 'tab active' : 'tab'} onClick={() => setActiveTab('all')}>
            All Items
          </button>
          <button type="button" className={activeTab === 'weapons' ? 'tab active' : 'tab'} onClick={() => setActiveTab('weapons')}>
            Weapons
          </button>
          <button type="button" className={activeTab === 'gloves' ? 'tab active' : 'tab'} onClick={() => setActiveTab('gloves')}>
            Gloves
          </button>
          <button type="button" className={activeTab === 'knives' ? 'tab active' : 'tab'} onClick={() => setActiveTab('knives')}>
            Knives
          </button>
          {user && (
            <button type="button" className={activeTab === 'favorites' ? 'tab active' : 'tab'} onClick={() => setActiveTab('favorites')}>
              Favorites
            </button>
          )}
        </div>

        <div className="filter-group">
          <label className="filter">
            <span>Filter by rarity</span>
            <select value={selectedRarity} onChange={(event) => setSelectedRarity(event.target.value)}>
              <option value="all">All rarities</option>
              {rarityOptions.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </label>

          {activeTab === 'weapons' && (
            <label className="filter">
              <span>Filter by weapons</span>
              <select value={weaponFilter} onChange={(event) => setWeaponFilter(event.target.value)}>
                <option value="all">All weapons</option>
                {weaponOptions.map((weapon) => (
                  <option key={weapon} value={weapon}>
                    {weapon}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {skinsLoading && <p className="status">Loading skins...</p>}
      {error && <p className="status error">{error}</p>}

      {!skinsLoading && !error && (
        <>
          {activeTab === 'all' && (
            <div className="gallery">
              {groupedByRarity.map(([rarity, items]) => (
                <section key={rarity} className="rarity-section">
                  <div className="rarity-heading">
                    <h2>{rarity}</h2>
                    <span>{items.length} skins</span>
                  </div>
                  <div className="card-grid">
                    {items.map((skin) => (
                      <PhotoCard
                        key={skin.id}
                        skin={skin}
                        isFavorite={favoriteIds.has(skin.id)}
                        onToggleFavorite={toggleFavorite}
                        showFavoriteButton={!!user}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === 'weapons' && (
            <div className="weapon-list">
              {weapons.map(([weapon, weaponSkins]) => (
                <section key={weapon} className="weapon-section">
                  <div className="weapon-heading">
                    <h2>{weapon}</h2>
                    <span>{weaponSkins.length} skins</span>
                  </div>
                  <div className="card-grid">
                    {weaponSkins.map((skin) => (
                      <PhotoCard
                        key={skin.id}
                        skin={skin}
                        isFavorite={favoriteIds.has(skin.id)}
                        onToggleFavorite={toggleFavorite}
                        showFavoriteButton={!!user}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === 'gloves' && (
            <div className="weapon-list">
              {gloves.map(([weapon, gloveSkins]) => (
                <section key={weapon} className="weapon-section">
                  <div className="weapon-heading">
                    <h2>{weapon}</h2>
                    <span>{gloveSkins.length} skins</span>
                  </div>
                  <div className="card-grid">
                    {gloveSkins.map((skin) => (
                      <PhotoCard
                        key={skin.id}
                        skin={skin}
                        isFavorite={favoriteIds.has(skin.id)}
                        onToggleFavorite={toggleFavorite}
                        showFavoriteButton={!!user}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === 'knives' && (
            <div className="weapon-list">
              {knives.map(([weapon, knifeSkins]) => (
                <section key={weapon} className="weapon-section">
                  <div className="weapon-heading">
                    <h2>{weapon}</h2>
                    <span>{knifeSkins.length} skins</span>
                  </div>
                  <div className="card-grid">
                    {knifeSkins.map((skin) => (
                      <PhotoCard
                        key={skin.id}
                        skin={skin}
                        isFavorite={favoriteIds.has(skin.id)}
                        onToggleFavorite={toggleFavorite}
                        showFavoriteButton={!!user}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && user && (
            <div className="gallery">
              {favoriteSkins.length === 0 ? (
                <p className="status">You have no favorites yet.</p>
              ) : (
                groupedFavorites.map(([rarity, items]) => (
                  <section key={rarity} className="rarity-section">
                    <div className="rarity-heading">
                      <h2>{rarity}</h2>
                      <span>{items.length} skins</span>
                    </div>
                    <div className="card-grid">
                      {items.map((skin) => (
                        <PhotoCard
                          key={skin.id}
                          skin={skin}
                          isFavorite={favoriteIds.has(skin.id)}
                          onToggleFavorite={toggleFavorite}
                          showFavoriteButton={!!user}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;