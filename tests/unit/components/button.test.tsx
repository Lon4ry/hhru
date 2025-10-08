import { render, screen, fireEvent } from "@testing-library/react";

import { Button } from "@/shared/ui/button";

describe("Button", () => {
  it("renders children and triggers click", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Найти работу</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Найти работу" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables button", () => {
    render(
      <Button loading variant="secondary">
        Сохранить
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Загрузка..." });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-slate-100");
  });
});
