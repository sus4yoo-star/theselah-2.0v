import { describe, it, expect } from "vitest";
import { splitDataUrl, defaultModel } from "./anthropic";

describe("splitDataUrl", () => {
  it("parses a valid base64 image data URL", () => {
    const parsed = splitDataUrl("data:image/png;base64,QUJD");
    expect(parsed).toEqual({ mediaType: "image/png", data: "QUJD" });
  });

  it("normalises image/jpg to image/jpeg", () => {
    expect(splitDataUrl("data:image/jpg;base64,QUJD")?.mediaType).toBe(
      "image/jpeg"
    );
  });

  it("rejects unsupported media types", () => {
    expect(splitDataUrl("data:image/svg+xml;base64,QUJD")).toBeNull();
    expect(splitDataUrl("data:text/plain;base64,QUJD")).toBeNull();
  });

  it("rejects malformed or empty input", () => {
    expect(splitDataUrl("")).toBeNull();
    expect(splitDataUrl("not-a-data-url")).toBeNull();
    expect(splitDataUrl("data:image/png;base64,")).toBeNull();
  });
});

describe("defaultModel", () => {
  it("falls back to a sensible default when the env var is unset", () => {
    const prev = process.env.ANTHROPIC_MODEL;
    delete process.env.ANTHROPIC_MODEL;
    expect(defaultModel()).toBe("claude-sonnet-4-6");
    if (prev !== undefined) process.env.ANTHROPIC_MODEL = prev;
  });
});
