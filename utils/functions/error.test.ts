import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { extractErrorMessage } from "./error";

describe("extractErrorMessage", () => {
  it("turns FastAPI validation details into readable text", () => {
    const error = new AxiosError("Request failed", "422", undefined, undefined, {
      data: {
        detail: [{ type: "uuid_parsing", loc: ["path", "conversation_id"], msg: "Input should be a valid UUID" }],
      },
      status: 422,
      statusText: "Unprocessable Entity",
      headers: {},
      config: { headers: {} } as never,
    });

    expect(extractErrorMessage(error)).toBe(
      "path → conversation_id: Input should be a valid UUID",
    );
  });
});
