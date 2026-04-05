import { Button } from "../../../components/primitives/Button";
import { Panel } from "../../../components/primitives/Panel";
import { Select } from "../../../components/primitives/Select";
import { Stack } from "../../../components/primitives/Stack";
import { FilterKey, SortKey } from "../../../domain/shared/enums";
import { cardsFilterOptions, cardsSortOptions } from "../cards.options";

type CardsControlBarProps = {
  sortKey: SortKey;
  filterKey: FilterKey;
  visibleCount: number;
  totalCount: number;
  onChangeSort: (value: SortKey) => void;
  onChangeFilter: (value: FilterKey) => void;
  onAddCard: () => void;
  onAddPayment: () => void;
};

export function CardsControlBar({
  sortKey,
  filterKey,
  visibleCount,
  totalCount,
  onChangeSort,
  onChangeFilter,
  onAddCard,
  onAddPayment,
}: CardsControlBarProps) {
  return (
    <Panel
      title="Cards"
      description="Primary comparison surface for balances, costs, and timing risk. Sorting and filtering here must stay strategy-driven, not cosmetic."
      actions={
        <Stack direction="horizontal" gap="sm" wrap="wrap">
          <Button variant="secondary" onClick={onAddPayment}>Add extra payment</Button>
          <Button variant="primary" onClick={onAddCard}>Add card</Button>
        </Stack>
      }
    >
      <div className="cards-controls">
        <div className="cards-controls__filters">
          <Select
            label="Sort cards by"
            value={sortKey}
            options={cardsSortOptions}
            onChange={(event) => onChangeSort(event.target.value as SortKey)}
          />
          <Select
            label="Filter cards by"
            value={filterKey}
            options={cardsFilterOptions}
            onChange={(event) => onChangeFilter(event.target.value as FilterKey)}
          />
        </div>

        <div className="cards-controls__status">
          <strong>{visibleCount}</strong>
          <span>visible card{visibleCount === 1 ? "" : "s"}</span>
          <span className="cards-controls__status-detail">out of {totalCount} tracked</span>
        </div>
      </div>
    </Panel>
  );
}
