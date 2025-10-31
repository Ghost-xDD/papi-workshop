import { createInkSdk } from '@polkadot-api/sdk-ink';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';

import { decodeAddress, keccakAsU8a } from '@polkadot/util-crypto';

import { Binary } from 'polkadot-api';
import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { contracts } from './descriptors/dist';

import { useConnect } from './hooks/useConnect';

import sdk, { config } from './utils/sdk';
import { polkadotSigner } from './utils/sdk-interface';

function App() {
  const CONTRACT_ADDRESS = '0x7845C37F932323C4f206bbcf264841b44Ea073Dd';

  const { selectedAccount } = useConnect();
  const [isLoading, setIsLoading] = useState(true);
  const [todos, setTodos] = useState<
    Array<{ id: bigint; amount: number; content: string; completed: boolean }>
  >([]);
  const [, setTodoCounter] = useState<bigint>(0n);
  const [addTodoLoader, setAddTodoLoader] = useState<boolean>(false);

  // TODO: Step 1 - Initialize the PAPI client
  // Get the client from sdk('passet')
  // const { client } = sdk('passet');

  // TODO: Step 2 - Create the Ink SDK instance
  // Use createInkSdk() to create an Ink SDK instance from the client
  // const inkSdk = createInkSdk(client);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    (async () => {
      if (selectedAccount) {
        const checkMapping = async () => {
          setIsLoading(true);
          try {
            // TODO: Step 3 - Check if address is mapped
            // Use inkSdk.addressIsMapped() to check if the account is mapped
            const mapped = false; // Replace with actual check

            if (!mapped) {
              const provider = new WsProvider(
                config.pas_asset_hub.providers[0]
              );
              const api = await ApiPromise.create({ provider });

              const signer = selectedAccount.wallet!.signer;
              try {
                api.setSigner(signer);

                const tx = api.tx.revive.mapAccount();
                await tx.signAndSend(selectedAccount.address);

                // Wait a bit for the transaction to be processed
                timeout = setTimeout(() => {
                  setIsLoading(false);
                }, 3000);
              } catch (error) {
                console.error('Error mapping account:', error);
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Error checking mapping status:', error);
            setIsLoading(false);
          }
        };

        checkMapping();
      } else {
        setIsLoading(false);
      }
    })();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount]);

  const substrateToEthereumAddress = (ss58: string) => {
    // 1. Decode the SS58 to public key (Uint8Array of 32 bytes)
    const publicKey = decodeAddress(ss58);

    // 2. Hash it with keccak256
    const keccakHash = keccakAsU8a(publicKey);

    // 3. Ethereum address is last 20 bytes
    const ethAddress = keccakHash.slice(-20);

    // 4. Return hex string
    return u8aToHex(ethAddress);
  };

  const formatPAS = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    }
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getTodo = async (id: bigint) => {
    if (!selectedAccount) return;

    // TODO: Step 4 - Get the contract instance
    // Use inkSdk.getContract() to get the todo contract
    // const todoContract = inkSdk.getContract(contracts.todo, CONTRACT_ADDRESS);

    // TODO: Step 5 - Query the contract
    // Use todoContract.query() to get a specific todo
    // const result = await todoContract.query('get_todo', {
    //   data: { id },
    //   origin: selectedAccount.address,
    // });

    // console.warn(result, 'getTodo result');
    // return result;
  };

  const getCounter = async () => {
    if (!selectedAccount) return;

    // TODO: Step 6 - Get the contract instance
    // const todoContract = inkSdk.getContract(contracts.todo, CONTRACT_ADDRESS);

    // TODO: Step 7 - Query the counter
    // Use todoContract.query() to get the counter for the current account
    // const result = await todoContract.query('get_counter', {
    //   data: {
    //     account_id: Binary.fromHex(
    //       substrateToEthereumAddress(selectedAccount.address)
    //     ),
    //   },
    //   origin: selectedAccount.address,
    // });

    // console.warn(result, 'getCounter result');
    // return result;
  };

  // TODO: Step 8 - Implement fetchTodos function
  // This function should:
  // 1. Call getCounter() to get the total number of todos
  // 2. Loop through all todos and call getTodo() for each
  // 3. Build a todosList array with all the todos
  // 4. Call setTodos(todosList) to update the state
  const fetchTodos = async () => {
    if (!selectedAccount) return;

    try {
      // Your code here
      console.log('TODO: Implement fetchTodos');
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // TODO: Step 9 - Add useEffect to fetch todos when account is ready
//   This useEffect should call fetchTodos() when selectedAccount and isLoading change
//   useEffect(() => {
//     if (selectedAccount && !isLoading) {
//       fetchTodos();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedAccount, isLoading]);

  // TODO: Step 10 - Implement addTodo function
  // This function should:
  // 1. Get the signer using polkadotSigner()
  // 2. Get the contract instance
  // 3. Use todoContract.send() to send an 'add_todo' transaction
  // 4. Sign and submit the transaction
  // 5. Refresh todos after adding
  const addTodo = async (content: string) => {
    if (!selectedAccount || addTodoLoader) return;

    setAddTodoLoader(true);

    try {
      // Your code here
      console.log('TODO: Implement addTodo with content:', content);
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setAddTodoLoader(false);
    }
  };

  const toggleTodo = async (id: bigint) => {
    // if (!selectedAccount) return;

    // const signer = (await polkadotSigner())!;
    // const todoContract = inkSdk.getContract(contracts.todo, CONTRACT_ADDRESS);

    // const result = await todoContract
    //   .send('toggle_todo', {
    //     data: { id },
    //     origin: selectedAccount.address,
    //   })
    //   .signAndSubmit(signer);

    // console.warn(result, 'toggleTodo result');

    // // Refresh todos after toggling
    // setTimeout(() => {
    //   fetchTodos();
    // }, 2000);

    // return result;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Header />

      <section className="py-16 hidden sm:block">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Todo App</h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span
              className="icon-[token-branded--polkadot] animate-spin"
              style={{ animationDuration: '16s' }}
            />
            <span>Polkadot</span>
          </p>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4 flex-1">
        <div className="max-w-2xl mx-auto">
          {!selectedAccount && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                Connect Your Wallet
              </h2>
              <p className="text-gray-500">
                Please connect your wallet to start managing your todos.
              </p>
            </div>
          )}

          {selectedAccount && isLoading && (
            <div className="text-center py-20">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Setting up your account
              </h2>
              <p className="text-gray-500">
                Mapping your account to the blockchain
              </p>
            </div>
          )}

          {selectedAccount && !isLoading && (
            <>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="todoInput"
                    placeholder="What needs to be done?"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addTodo(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        'todoInput'
                      ) as HTMLInputElement;
                      if (input.value.trim()) {
                        addTodo(input.value.trim());
                        input.value = '';
                      }
                    }}
                    disabled={addTodoLoader}
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addTodoLoader ? 'Adding...' : 'Add Todo'}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Todos
                  </h2>
                  <span className="text-sm text-gray-500">
                    {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {todos.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-400">
                      No todos yet. Add one above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todos.map((todo) => (
                      <div
                        key={todo.id.toString()}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:border-gray-300 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleTodo(todo.id)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                            todo.completed
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {todo.completed && (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-base ${
                              todo.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-900'
                            }`}
                          >
                            {todo.content}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {formatPAS(todo.amount)} PAS
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              #{todo.id.toString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
