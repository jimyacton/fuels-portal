import type { BN } from 'fuels';
import { Address, NativeAssetId, Wallet } from 'fuels';

const { GENESIS_SECRET, VITE_FUEL_PROVIDER_URL } = process.env;

type SeedWalletOptions = {
  gasPrice?: number;
};

export async function seedWallet(
  address: string,
  amount: BN,
  options: SeedWalletOptions = {}
) {
  const genesisWallet = Wallet.fromPrivateKey(
    GENESIS_SECRET,
    VITE_FUEL_PROVIDER_URL
  );
  const response = await genesisWallet.transfer(
    Address.fromString(address),
    amount,
    NativeAssetId,
    { gasPrice: 1, ...options }
  );
  await response.wait();
}