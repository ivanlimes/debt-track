import { useCallback } from "react";
import { useAppState } from "../providers/AppProviders";
import { NavigationDestination } from "../../state/appState.types";

type DestinationOption = {
  destination?: NavigationDestination;
};

export function useWorkspaceActions() {
  const { dispatch } = useAppState();

  const navigateTo = useCallback(
    (destination: NavigationDestination) => {
      dispatch({ type: "navigation/setDestination", payload: destination });
    },
    [dispatch],
  );

  const inspectAccount = useCallback(
    (accountId: string, options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "selection/selectAccount", payload: accountId });
      dispatch({ type: "inspector/open" });
    },
    [dispatch, navigateTo],
  );

  const addCard = useCallback(
    (options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "editing/start", payload: { flow: "addCard" } });
    },
    [dispatch, navigateTo],
  );

  const editCard = useCallback(
    (accountId: string, options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "selection/selectAccount", payload: accountId });
      dispatch({ type: "inspector/open" });
      dispatch({ type: "editing/start", payload: { flow: "editCard", targetId: accountId } });
    },
    [dispatch, navigateTo],
  );

  const closeAccount = useCallback(
    (accountId: string, options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "selection/selectAccount", payload: accountId });
      dispatch({ type: "inspector/open" });
      dispatch({ type: "editing/start", payload: { flow: "closeAccount", targetId: accountId } });
    },
    [dispatch, navigateTo],
  );

  const addPayment = useCallback(
    (accountId?: string | null, options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      if (accountId) {
        dispatch({ type: "selection/selectAccount", payload: accountId });
        dispatch({ type: "inspector/open" });
      }

      dispatch({
        type: "editing/start",
        payload: { flow: "addPayment", targetId: accountId ?? null },
      });
    },
    [dispatch, navigateTo],
  );

  const editPayment = useCallback(
    (paymentId: string, options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "selection/selectPayment", payload: paymentId });
      dispatch({ type: "editing/start", payload: { flow: "editPayment", targetId: paymentId } });
    },
    [dispatch, navigateTo],
  );

  const editPlan = useCallback(
    (options?: DestinationOption) => {
      if (options?.destination) {
        navigateTo(options.destination);
      }

      dispatch({ type: "editing/start", payload: { flow: "editPlan" } });
    },
    [dispatch, navigateTo],
  );

  return {
    navigateTo,
    inspectAccount,
    addCard,
    editCard,
    closeAccount,
    addPayment,
    editPayment,
    editPlan,
  };
}
