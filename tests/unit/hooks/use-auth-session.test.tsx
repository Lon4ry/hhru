import { render, screen } from "@testing-library/react";

import { Providers } from "@/app/providers";

jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="session-provider">{children}</div>,
}));

describe("Providers", () => {
  it("wraps children with SessionProvider", () => {
    render(
      <Providers>
        <span>Контент</span>
      </Providers>,
    );

    const container = screen.getByTestId("session-provider");
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Контент");
  });
});
