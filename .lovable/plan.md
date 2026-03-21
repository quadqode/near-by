

## Plan: Fix App Name + Radius Circle Issues

### 1. Rename "CoWork Drop" to "NearBy" everywhere

Files to update:
- **`src/components/SplashScreen.tsx`** (line 57): Change "CoWork Drop" to "NearBy"
- **`src/components/PinListView.tsx`** (line 285): Change "CoWork Drop" to "NearBy"
- **`src/components/RegisterPlaceDialog.tsx`** (line 82): Change "CoWork Drop" to "NearBy"
- **`index.html`**: Title and meta tags already say "Near By" -- update to "NearBy" consistently

### 2. Fix radius circle and marker filtering

The core bug: the map `useEffect` has `userPos` in its dependency array, causing the entire map to be destroyed and recreated on every location change. The `updateRadius` closure also captures stale `userPos`.

**Fix in `src/components/CoworkMap.tsx`:**
- Remove `userPos` from the map init `useEffect` dependency array -- only init the map once
- Use a `useRef` to track the latest `userPos` so the `updateRadius` callback always reads the current value
- In the second `useEffect` (line 201-212) that handles userPos changes: update the radius circle center using the ref, and call `updateRadiusCircle` after `flyTo` completes
- Ensure `filteredPlaces` strictly filters by `visibleRadius` from `userPos`

### 3. Verify search bar suggestions

Already confirmed working -- typing "Hauz Khas" shows Delhi-restricted autocomplete suggestions. No changes needed.

### Summary of files to edit
1. `src/components/SplashScreen.tsx` -- rename to NearBy
2. `src/components/PinListView.tsx` -- rename to NearBy
3. `src/components/RegisterPlaceDialog.tsx` -- rename to NearBy
4. `index.html` -- consistent "NearBy" in title/meta
5. `src/components/CoworkMap.tsx` -- fix map re-init bug, use ref for userPos in radius logic

