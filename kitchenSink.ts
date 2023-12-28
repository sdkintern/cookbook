// creating a private key via viem
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

function createViemKey() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
}
