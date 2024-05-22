import { redirect as nextRedirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import baseRedirect from "../../../src/navigation/shared/baseRedirect";

vi.mock("next/navigation");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("localePrefix: 'as-needed'", () => {
  describe("baseRedirect", () => {
    it("does localize redirects to internal paths", () => {
      baseRedirect({
        pathname: "/test/path",
        locale: "en",
        localePrefix: "as-needed",
      });
      expect(nextRedirect).toHaveBeenCalledTimes(1);
      expect(nextRedirect).toHaveBeenCalledWith("/en/test/path");
    });

    it("does not localize redirects to external paths", () => {
      baseRedirect({
        pathname: "https://example.com",
        locale: "en",
        localePrefix: "as-needed",
      });
      expect(nextRedirect).toHaveBeenCalledTimes(1);
      expect(nextRedirect).toHaveBeenCalledWith("https://example.com");
    });
  });
});

describe("localePrefix: 'never'", () => {
  describe("baseRedirect", () => {
    it("does localize redirects to internal paths", () => {
      baseRedirect({
        pathname: "/test/path",
        locale: "en",
        localePrefix: "never",
      });
      expect(nextRedirect).toHaveBeenCalledTimes(1);
      expect(nextRedirect).toHaveBeenCalledWith("/test/path");
    });

    it("does not localize redirects to external paths", () => {
      baseRedirect({
        pathname: "https://example.com",
        locale: "en",
        localePrefix: "never",
      });
      expect(nextRedirect).toHaveBeenCalledTimes(1);
      expect(nextRedirect).toHaveBeenCalledWith("https://example.com");
    });
  });
});
