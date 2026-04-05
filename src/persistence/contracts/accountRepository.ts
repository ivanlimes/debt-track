import { CreditCardAccount } from "../../domain/accounts/account.types";

export interface AccountRepository {
  listAll(): Promise<CreditCardAccount[]>;
  replaceAll(accounts: CreditCardAccount[]): Promise<void>;
}
