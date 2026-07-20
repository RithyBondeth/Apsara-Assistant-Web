import api from "@/lib/axios";
import { IPage } from "@/utils/interfaces/common/page.interface";

/** Must not exceed the API's MAX_PAGE_SIZE, which rejects anything larger. */
const FETCH_ALL_PAGE_SIZE = 200;

/**
 * Walk every page of a list endpoint and return the whole set.
 *
 * For callers that genuinely need all rows rather than a page: pickers
 * (an order's product/customer select), id→name lookups, and anything that
 * *computes* over the list — analytics aggregates are wrong, not merely
 * incomplete, if they run on a truncated array.
 *
 * Paging through beats requesting one huge limit: there's no magic number to
 * outgrow, and it can't silently truncate the way the un-paginated fetches did.
 */
export async function fetchEveryPage<T>(
  url: string,
  params: object = {},
): Promise<{ items: T[]; total: number }> {
  const collected: T[] = [];
  let skip = 0;
  let total = 0;

  do {
    const { data } = await api.get<IPage<T>>(url, {
      params: { ...params, skip, limit: FETCH_ALL_PAGE_SIZE },
    });
    collected.push(...data.items);
    total = data.total;
    skip += FETCH_ALL_PAGE_SIZE;
    // A short page (e.g. rows deleted mid-walk) would otherwise leave
    // `collected.length` permanently below `total` and spin this loop.
    if (data.items.length === 0) break;
  } while (collected.length < total);

  return { items: collected, total };
}
