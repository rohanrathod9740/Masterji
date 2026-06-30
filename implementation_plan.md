# Implementation Plan — Client Dashboard Consultant Filtering

Update the client dashboard consultant listing page ([page.tsx](file:///home/ybl/proj/prdv2/app/tenant/client/(protected)/page.tsx)) to filter and search consultants via the backend API. This aligns with the categories and filtering capabilities implemented in the prior onboarding refactoring.

## User Review Required

> [!NOTE]
> **Server-side Search & Filtering**
> Rather than fetching the first 20 consultants on mount and performing client-side filters (which can result in missing search matches if they are outside the first page of results), the dashboard will query `/api/client/consultants` dynamically when the category tab or search input changes.

## Proposed Changes

### Client Dashboard

#### [MODIFY] [page.tsx](file:///home/ybl/proj/prdv2/app/tenant/client/(protected)/page.tsx)
- Modify the `useEffect` hook to trigger on changes to `selectedSection` and `search`.
- Map the selected category ID (e.g. `medical`, `legal`) to uppercase category enums expected by the backend (`MEDICAL`, `LEGAL`, etc.).
- Query `/api/client/consultants?category=...&search=...` using `URLSearchParams`.
- Introduce a `300ms` debounce timer for search input changes to minimize database/network load while typing.
- Remove client-side post-filtering so that the results from the backend are displayed directly.

---

## Verification Plan

### Manual Verification
- Select different category tabs (e.g. "Medical", "Legal") and verify that correct consultants are loaded.
- Type a search query into the search bar, verify the debounce works, and check that search results are correctly returned.
- Check that when no search query or category is selected, the full list of verified consultants is loaded.
