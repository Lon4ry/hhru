import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder/Decoder for jsdom environment
if (!(global as typeof globalThis).TextEncoder) {
  (global as typeof globalThis).TextEncoder = TextEncoder as never;
}
if (!(global as typeof globalThis).TextDecoder) {
  (global as typeof globalThis).TextDecoder = TextDecoder as never;
}

const pushMock = jest.fn();
const replaceMock = jest.fn();
const prefetchMock = jest.fn();
const backMock = jest.fn();

const useRouterMock = jest.fn(() => ({
  push: pushMock,
  replace: replaceMock,
  prefetch: prefetchMock,
  back: backMock,
}));

jest.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
  revalidatePath: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(() => {
  pushMock.mockClear();
  replaceMock.mockClear();
  prefetchMock.mockClear();
  backMock.mockClear();
  jest.clearAllMocks();
});

export { useRouterMock };
