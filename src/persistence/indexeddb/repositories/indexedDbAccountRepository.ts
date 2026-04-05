import { CreditCardAccount } from "../../../domain/accounts/account.types";
import { AccountRepository } from "../../contracts/accountRepository";
import { StorageAdapter } from "../../contracts/storageAdapter";
import { serializeAccount, deserializeAccount } from "../../mappers/serializeAccount";
import { STORE_NAMES } from "../db.schema";

export class IndexedDbAccountRepository implements AccountRepository {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async listAll(): Promise<CreditCardAccount[]> {
    const records = await this.storageAdapter.getAll<unknown>(STORE_NAMES.accounts);
    return records.map(deserializeAccount).filter((record): record is CreditCardAccount => record !== null);
  }

  async replaceAll(accounts: CreditCardAccount[]): Promise<void> {
    await this.storageAdapter.clear(STORE_NAMES.accounts);

    for (const account of accounts) {
      await this.storageAdapter.put(STORE_NAMES.accounts, serializeAccount(account));
    }
  }
}
