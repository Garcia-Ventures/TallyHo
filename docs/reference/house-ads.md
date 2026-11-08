# Reference: House Ad Rotation

TallyHo shows a single sponsored card on the home screen and again on the game-over sheet. Until an external ad network is connected, that card rotates through **house ads** only: Garcia Ventures properties and Eric N. Garcia's own site.

The catalog lives in `AD_CONFIG.houseAds` (`src/constants/config.ts`). `AdBannerCard` asks `nextHouseAd` for the next entry.

## Rotation

- The first impression in a session starts at a random catalog index.
- Each later impression (another screen, or a new mount of the card) advances one step and wraps.
- React strict mode does not consume an extra step. The card records one impression per placement.
- `settings.isAdFree` hides the card.
- `settings.isAdBlocked` replaces the rotation with `AD_CONFIG.adBlockerFallbackAd`, which opens the TallyHo Pro sheet.
- An entry with no `linkUrl` opens the TallyHo Pro sheet. Every other entry opens `linkUrl`.

Impressions and taps are `ad_impression` and `ad_click` in OpenPanel, with `adId`, `placement`, and `badge`.

## Catalog

| Id                       | Destination                      | Click                     |
| :----------------------- | :------------------------------- | :------------------------ |
| `house_ad_pro`           | TallyHo Pro lifetime unlock      | In-app purchase sheet     |
| `house_ad_parable_bloom` | https://parable-bloom.pages.dev/ | Play Parable Bloom        |
| `house_ad_gventures`     | https://gventureshq.com          | Garcia Ventures HQ        |
| `house_ad_gv_travel`     | https://gv-travel.com/           | GV Travel                 |
| `house_ad_gv_design`     | https://design.gventureshq.com   | GV Tech Design playground |
| `house_ad_eric`          | https://garciaericn.com/         | Eric N. Garcia            |

GV Travel does not have a custom domain in the HQ ventures list yet. The ad uses the live Pages site. Tally (the envelope budget app) has no public URL, so it is not in the rotation.

## Adding an entry

Add an `AdContent` object to `houseAds` and extend the id and URL assertions in `src/constants/config.test.ts`. Use a public URL you have loaded in a browser. Leave `linkUrl` unset only when the button should open the Pro sheet.
