import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { EmptyState } from "../../components/primitives/EmptyState";
import { FilterKey, SortKey } from "../../domain/shared/enums";
import { selectAccounts } from "../../state/selectors/account.selectors";
import {
  filterCardsViewRows,
  selectCardsViewRows,
  sortCardsViewRows,
} from "../../state/selectors/cards.selectors";
import { CardsControlBar } from "./components/CardsControlBar";
import { CardsTablePanel } from "./components/CardsTablePanel";

export function CardsScreen() {
  const { state, dispatch } = useAppState();
  const { addCard, addPayment, editCard, inspectAccount } = useWorkspaceActions();
  const accounts = useMemo(() => selectAccounts(state), [state]);
  const defaultSort = state.domain.preferences.defaultSort;
  const defaultFilter = state.domain.preferences.defaultFilter ?? "all_open";
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort);
  const [filterKey, setFilterKey] = useState<FilterKey>(defaultFilter);

  useEffect(() => {
    setSortKey(defaultSort);
  }, [defaultSort]);

  useEffect(() => {
    setFilterKey(defaultFilter);
  }, [defaultFilter]);

  const cardsRows = useMemo(() => selectCardsViewRows(state), [state]);
  const filteredRows = useMemo(() => filterCardsViewRows(cardsRows, filterKey), [cardsRows, filterKey]);
  const visibleRows = useMemo(() => sortCardsViewRows(filteredRows, sortKey), [filteredRows, sortKey]);
  const selectedAccountId = state.ui.selection.selectedAccountId;

  useEffect(() => {
    if (!selectedAccountId) {
      return;
    }

    const isSelectedVisible = visibleRows.some((row) => row.accountId === selectedAccountId);

    if (!isSelectedVisible) {
      dispatch({ type: "selection/selectAccount", payload: null });
      dispatch({ type: "inspector/close" });
    }
  }, [dispatch, selectedAccountId, visibleRows]);

  if (accounts.length === 0) {
    return (
      <section className="cards-screen">
        <EmptyState
          title="No cards yet"
          description="The Cards destination becomes the primary management and comparison surface once at least one tracked credit card exists."
          action={
            <Button variant="primary" onClick={() => addCard()}>
              Add first card
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="cards-screen">
      <div className="cards-screen__layout">
        <CardsControlBar
          sortKey={sortKey}
          filterKey={filterKey}
          visibleCount={visibleRows.length}
          totalCount={cardsRows.length}
          onChangeSort={setSortKey}
          onChangeFilter={setFilterKey}
          onAddCard={() => addCard()}
          onAddPayment={() => addPayment(selectedAccountId)}
        />

        <CardsTablePanel
          rows={visibleRows}
          selectedAccountId={selectedAccountId}
          onInspectAccount={inspectAccount}
          onEditAccount={editCard}
          onAddPayment={(accountId) => addPayment(accountId)}
        />
      </div>
    </section>
  );
}
