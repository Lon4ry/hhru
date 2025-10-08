import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FiltersSheet } from "@/shared/ui/filters-sheet";

describe("FiltersSheet", () => {
  it("opens and closes dialog with provided content", async () => {
    const user = userEvent.setup();
    render(
      <FiltersSheet title="Фильтры вакансий" triggerLabel="Открыть">
        <div>Содержимое фильтров</div>
      </FiltersSheet>,
    );

    const trigger = screen.getByRole("button", { name: /Открыть/i });
    await user.click(trigger);

    expect(screen.getByText("Фильтры вакансий")).toBeInTheDocument();
    expect(screen.getByText("Содержимое фильтров")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Закрыть" }));

    expect(screen.queryByText("Содержимое фильтров")).not.toBeInTheDocument();
  });
});
