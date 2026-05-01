// Firebase sync interface — local no-op implementation for v1
// Swap LocalSyncService for FirebaseSyncService when ready

export interface SyncService {
  syncTransactions(userId: string): Promise<void>;
  syncBudgets(userId: string): Promise<void>;
  onRemoteChange(callback: () => void): () => void;
}

class LocalSyncService implements SyncService {
  async syncTransactions(_userId: string): Promise<void> {}
  async syncBudgets(_userId: string): Promise<void> {}
  onRemoteChange(_callback: () => void): () => void {
    return () => {};
  }
}

export const syncService: SyncService = new LocalSyncService();
