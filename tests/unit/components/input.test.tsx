import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "@/shared/ui/input";

describe("Input", () => {
  it("renders label, helper text and handles input", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Input
        label="Поиск"
        placeholder="Введите запрос"
        helperText="Можно вводить ключевые слова"
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText("Введите запрос");
    expect(screen.getByText("Поиск")).toBeInTheDocument();
    expect(
      screen.getByText("Можно вводить ключевые слова"),
    ).toBeInTheDocument();

    await user.type(input, "React");

    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("React");
  });

  it("renders error text with red color", () => {
    render(<Input label="Email" error="Некорректный email" />);

    const error = screen.getByText("Некорректный email");
    expect(error).toHaveClass("text-red-500");
  });
});
