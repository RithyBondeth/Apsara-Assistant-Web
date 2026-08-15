import api from "@/lib/axios";

const PAGE_SIZE = 100;

/** Load a complete collection from the API's offset/limit list endpoints. */
export async function fetchAllPages<T>(
  path: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const rows: T[] = [];
  let skip = 0;

  for (;;) {
    const { data } = await api.get<T[]>(path, {
      params: { ...params, skip, limit: PAGE_SIZE },
    });
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
    skip += data.length;
  }
}
