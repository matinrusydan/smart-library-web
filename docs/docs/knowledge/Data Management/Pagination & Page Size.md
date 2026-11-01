# Pagination and Page Size

The shared `Pagination` component exposes a page-size selector with the user-facing label “Pilih data yang ingin ditampilkan” and options 10, 25, 50, and 100. The caller owns `page`, `pageSize`, and callbacks; changing page size resets the current page to 1 and the caller clamps the page if the result set shrinks. In feature modules, paging must be implemented in the repository query with validated `limit` and `offset`; do not fetch an unbounded business table solely to slice it in the browser. The design-system showcase uses labeled in-memory fixtures only.
