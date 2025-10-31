# 🎓 PAPI Integration Workshop

Welcome to the **Polkadot API (PAPI) Workshop**! This hands-on tutorial teaches you how to build decentralized applications using the modern, type-safe PAPI SDK.

## 🎯 Workshop Goals

By completing this workshop, you'll learn:

1. **✅ SDK Initialization** - Connect to Polkadot networks
2. **✅ Wallet Integration** - Connect Talisman wallet
3. **✅ Contract Queries** - Read blockchain state (free operations)
4. **✅ Contract Transactions** - Write to blockchain (requires signing & gas)
5. **✅ Type Safety** - Leverage TypeScript for error-free contract calls
6. **✅ Address Mapping** - Handle Ethereum-compatible contracts (Revive pallet)

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:5173
```

## 📖 Workshop Structure

### **Step 1: Understanding the Contract**

Location: `contracts/lib.rs`

This is a simple Todo contract deployed on Passet testnet at:

```
0x489a97e43c53e52537a73997af4d4c145ca219db
```

**Contract Functions:**

- `add_todo(content)` - Create a new todo (payable, requires 100 PAS deposit)
- `toggle_todo(id)` - Mark todo as complete/incomplete
- `get_todo(id)` - Query a specific todo
- `get_counter(account_id)` - Get total todos for an account

### **Step 2: SDK Configuration**

Location: `src/utils/sdk.ts`

```typescript
// Configure which chains to connect to
export const config = {
  passet: {
    descriptor: passet,
    providers: ['wss://testnet-passet-hub.polkadot.io'],
  },
  // ... other chains
};

// Initialize SDK for a specific chain
const { client, api } = sdk('passet');
```

**Key Concepts:**

- **Descriptors**: Type information for each chain
- **Providers**: WebSocket endpoints (RPC nodes)
- **Client**: Main PAPI client instance

### **Step 3: Ink SDK Integration**

Location: `src/App.tsx` (lines 30-35)

```typescript
// Get PAPI client for Passet
const { client } = sdk('passet');

// Create Ink SDK for contract interactions
const inkSdk = createInkSdk(client);

// Get contract instance (type-safe!)
const todoContract = inkSdk.getContract(contracts.todo, CONTRACT_ADDRESS);
```

**Why Ink SDK?**

- Type-safe contract calls
- Automatic encoding/decoding
- Built-in error handling

### **Step 4: Contract Queries (READ)**

Location: `src/App.tsx` - `getTodo()` function

```typescript
// Queries are FREE - no gas, no signing
const result = await todoContract.query('get_todo', {
  data: { id }, // Function parameters
  origin: userAddress, // Who's calling (for state context)
});

// Result is type-safe!
if (result.success) {
  const todo = result.value.response;
  console.log(todo.content, todo.completed);
}
```

**When to use queries:**

- Reading data from the blockchain
- Checking balances or state
- Previewing transaction results
- No blockchain state changes

### **Step 5: Contract Transactions (WRITE)**

Location: `src/App.tsx` - `addTodo()` function

```typescript
// Get signer from wallet
const signer = await polkadotSigner();

// Send transaction (requires gas + signature)
const result = await todoContract
  .send('add_todo', {
    data: { content: 'My todo' },
    origin: userAddress,
    value: 100n * 10n ** 10n, // Optional: send tokens with call
  })
  .signAndSubmit(signer);
```

**Transaction Flow:**

1. User clicks button
2. Wallet prompts for signature
3. Transaction sent to blockchain
4. Wait for confirmation
5. Refresh UI with new data

### **Step 6: Address Mapping**

Location: `src/App.tsx` - `useEffect` (lines 36-90)

**Why mapping is needed:**

- Passet uses **Revive pallet** (Ethereum-compatible contracts)
- Substrate addresses (SS58) need mapping to Ethereum format (H160)
- One-time operation per account

```typescript
// Check if already mapped
const mapped = await inkSdk.addressIsMapped(userAddress);

if (!mapped) {
  // Create mapping transaction
  const tx = api.tx.revive.mapAccount();
  await tx.signAndSend(userAddress);
}
```

### **Step 7: Type Safety**

PAPI generates TypeScript types from chain metadata:

```typescript
// Descriptors provide full type safety
import { contracts } from './descriptors';

// TypeScript knows all contract functions & parameters!
todoContract.query('get_todo', { data: { id: 1n } }); // ✅ Type-safe
todoContract.query('invalid_function', {}); // ❌ Compile error
```

## 🔍 Explore the Code

### **Key Files:**

| File                         | Purpose                                         |
| ---------------------------- | ----------------------------------------------- |
| `src/App.tsx`                | Main application with PAPI integration examples |
| `src/utils/sdk.ts`           | SDK configuration & initialization              |
| `src/utils/sdk-interface.ts` | Helper functions for common operations          |
| `src/hooks/useConnect.ts`    | Wallet connection logic                         |
| `contracts/lib.rs`           | Smart contract source code                      |

### **PAPI Documentation:**

- 📚 **Main Docs**: https://papi.how/
- 🔧 **Ink SDK**: https://papi.how/ink-sdk
- 💬 **Discord**: https://discord.gg/polkadot

## 🎨 Customize the Workshop

Want to modify the contract? Here's how:

1. **Edit**: `contracts/lib.rs`
2. **Build**: See deployment guide in main README
3. **Deploy**: Use the deployed contract address
4. **Generate Types**: `npx papi ink add ./contracts/your.contract -k your_name`
5. **Update App**: Use new contract functions in `App.tsx`

## 🐛 Common Issues

### Wallet Not Connecting

- Ensure Talisman wallet extension is installed
- Check if you're on the correct network

### Transactions Failing

- Insufficient balance? Get tokens from faucet
- Account not mapped? App handles this automatically
- Wrong network? Check `src/utils/sdk.ts`

### Contract Not Found

- Verify contract address in `App.tsx`
- Check you're connected to Passet testnet
- Ensure contract is deployed on the correct chain

## 🎯 Workshop Exercises

Try these challenges to practice PAPI:

1. **Add a Delete Function**

   - Add `delete_todo(id)` to contract
   - Create UI button to delete
   - Handle transaction confirmation

2. **Add Filtering**

   - Filter completed vs pending todos
   - Use queries to fetch specific subsets

3. **Add Notifications**

   - Show toast when transactions succeed/fail
   - Display transaction hashes

4. **Multi-Chain Support**
   - Deploy contract on another chain
   - Add chain selector to UI
   - Switch between contracts

## 📚 Next Steps

After this workshop:

- Build your own contract
- Explore other PAPI features (storage queries, events, etc.)
- Join the Polkadot ecosystem!

---

**Happy Building! 🚀**
