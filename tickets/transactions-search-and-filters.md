# TODO: Transaction discovery across full history

The transaction page currently loads only the first 100 entries. Build search,
filters, and history navigation together so results remain accurate for accounts
with more than one page of transactions. The backend already supports year/month
and page parameters and returns pagination metadata; the current frontend client
unwraps the response and discards that metadata.

- Add backend query parameters for description search, wallet, and transaction type.
  Preserve the existing year/month and page parameters.
- Apply all query parameters before pagination and return a matching total count.
- Expose the existing pagination metadata to the transaction page.
- Add a period selector, search field, and wallet/type filters to the page. On
  mobile, place secondary filters in a sheet and show the active filter count.
- Add pagination or Load more, plus a result count and a clear no-results state.
- Keep query state in the URL so browser Back and shared links restore the view.
- Add backend regression coverage for combined filters and page boundaries.
