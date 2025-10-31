import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { useConnect } from './hooks/useConnect';
import { createRemarkTransaction, polkadotSigner } from './utils/sdk-interface';

interface Match {
  id: string;
  contestant1: string;
  contestant2: string;
  initialPool: number;
  winner: 1 | 2 | null;
  createdAt: number;
  createdBy: string;
}

const STORAGE_KEY = 'prediction-marketplace-matches';

function Prediction() {
  const { selectedAccount } = useConnect();
  const [matches, setMatches] = useState<Match[]>([]);
  const [contestant1, setContestant1] = useState('');
  const [contestant2, setContestant2] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pickingWinnerMatchId, setPickingWinnerMatchId] = useState<
    string | null
  >(null);

  // Load matches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedMatches = JSON.parse(stored);
        setMatches(parsedMatches);
      } catch (e) {
        console.error('Error loading matches:', e);
      }
    }
  }, []);

  // Save matches to localStorage
  const saveMatches = (newMatches: Match[]) => {
    setMatches(newMatches);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMatches));
  };

  const createMatch = async () => {
    if (!selectedAccount || !contestant1.trim() || !contestant2.trim()) return;

    setIsCreating(true);

    try {
      // Sign a message with the wallet
      const signer = await polkadotSigner();
      if (!signer) throw new Error('No signer found');

      const message = `Create match: ${contestant1} vs ${contestant2}`;

      // Wait for signing to complete before creating match
      await new Promise<void>((resolve, reject) => {
        createRemarkTransaction(
          'passet',
          message,
          selectedAccount.address,
          signer,
          {
            onTxHash: () => {
              console.log('Match creation signed');
              // Create match after signing is confirmed
              const newMatch: Match = {
                id: Date.now().toString(),
                contestant1: contestant1.trim(),
                contestant2: contestant2.trim(),
                initialPool: 10, // $10 USDT initial pool
                winner: null,
                createdAt: Date.now(),
                createdBy: selectedAccount.address,
              };

              saveMatches([...matches, newMatch]);
              setContestant1('');
              setContestant2('');
              resolve();
            },
            onFinalized: () => {
              console.log('Match creation finalized');
            },
            onError: (error) => {
              console.error('Signing error:', error);
              reject(new Error(error));
            },
          }
        );
      });

      setIsCreating(false);
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
      setIsCreating(false);
    }
  };

  const declareWinner = async (matchId: string, winner: 1 | 2) => {
    if (!selectedAccount) return;

    const match = matches.find((m) => m.id === matchId);
    if (!match || match.createdBy !== selectedAccount.address) {
      alert('Only the match creator can declare the winner!');
      return;
    }

    try {
      const signer = await polkadotSigner();
      if (!signer) throw new Error('No signer found');

      const winnerName = winner === 1 ? match.contestant1 : match.contestant2;
      const message = `Declare winner: ${winnerName}`;

      // Update match immediately
      const updatedMatches = matches.map((m) => {
        if (m.id === matchId) return { ...m, winner };

        return m;
      });

      saveMatches(updatedMatches);
      setPickingWinnerMatchId(null);

      // Trigger confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Sign the winner declaration in background
      createRemarkTransaction(
        'passet',
        message,
        selectedAccount.address,
        signer,
        {
          onTxHash: () => {
            console.log('Winner declaration signed');
          },
          onFinalized: () => {
            console.log('Winner declaration finalized');
          },
          onError: (error) => {
            console.error('Signing error:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error declaring winner:', error);
      alert('Failed to declare winner. Transaction was cancelled or failed.');
    }
  };

  const activeMatches = matches.filter((m) => m.winner === null);
  const completedMatches = matches.filter((m) => m.winner !== null);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Header />

      <section className="py-16 hidden sm:block">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            🥊 Arm Wrestling Arena
          </h1>
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <span>Winner takes $10 USDT!</span>
          </p>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4 flex-1">
        <div className="max-w-4xl mx-auto">
          {!selectedAccount && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                Connect Your Wallet
              </h2>
              <p className="text-gray-500">
                Please connect your wallet to create matches and place bets.
              </p>
            </div>
          )}

          {selectedAccount && (
            <>
              {/* Create Match Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Create New Match
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Contestant 1 Name"
                    value={contestant1}
                    onChange={(e) => setContestant1(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Contestant 2 Name"
                    value={contestant2}
                    onChange={(e) => setContestant2(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={createMatch}
                  disabled={
                    isCreating || !contestant1.trim() || !contestant2.trim()
                  }
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating Match...' : 'Create Match & Sign'}
                </button>
              </div>

              {/* Active Matches */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Active Matches ({activeMatches.length})
                </h2>
                {activeMatches.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-400">
                      No active matches. Create one above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMatches.map((match) => {
                      const totalPool = match.initialPool;
                      const isCreator =
                        match.createdBy === selectedAccount.address;

                      return (
                        <div
                          key={match.id}
                          className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-purple-300 transition-all"
                        >
                          {isCreator && (
                            <div className="flex justify-end mb-4">
                              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                Your Match
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="flex-1 text-right">
                              <h3 className="text-2xl font-bold text-blue-600 mb-1">
                                {match.contestant1}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Contestant 1
                              </p>
                            </div>

                            <div className="relative px-6">
                              <div className="text-4xl font-black text-red-600 animate-pulse">
                                VS
                              </div>
                              <div className="absolute -top-2 -left-2 text-6xl opacity-10">
                                ⚔️
                              </div>
                            </div>

                            <div className="flex-1 text-left">
                              <h3 className="text-2xl font-bold text-green-600 mb-1">
                                {match.contestant2}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Contestant 2
                              </p>
                            </div>
                          </div>

                          <div className="text-center mb-6">
                            <p className="text-lg font-semibold text-yellow-600">
                              💰 Prize Pool: ${totalPool} USDT
                            </p>
                          </div>

                          <div className="flex justify-center">
                            {isCreator && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPickingWinnerMatchId(match.id)
                                }
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                              >
                                🏆 Pick Winner
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Completed Matches */}
              {completedMatches.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Completed Matches ({completedMatches.length})
                  </h2>
                  <div className="space-y-4">
                    {completedMatches.map((match) => {
                      const winnerName =
                        match.winner === 1
                          ? match.contestant1
                          : match.contestant2;
                      const totalPool = match.initialPool;

                      return (
                        <div
                          key={match.id}
                          className="bg-white rounded-lg border-2 border-gray-300 p-6 opacity-80"
                        >
                          <div className="flex justify-end gap-2 mb-4">
                            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                              Match Closed
                            </span>
                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                              🏆 {winnerName}
                            </span>
                          </div>

                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="flex-1 text-right">
                              <h3
                                className={`text-2xl font-bold mb-1 ${
                                  match.winner === 1
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {match.contestant1}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Contestant 1
                              </p>
                            </div>

                            <div className="relative px-6">
                              <div className="text-4xl font-black text-gray-400">
                                VS
                              </div>
                            </div>

                            <div className="flex-1 text-left">
                              <h3
                                className={`text-2xl font-bold mb-1 ${
                                  match.winner === 2
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {match.contestant2}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Contestant 2
                              </p>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-500">
                              Prize Pool: ${totalPool} USDT
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Winner Selection Modal */}
      {pickingWinnerMatchId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🏆 Pick the Winner
            </h3>
            {(() => {
              const match = matches.find((m) => m.id === pickingWinnerMatchId);
              if (!match) return null;

              return (
                <>
                  <p className="text-gray-600 mb-6">
                    Who won the arm wrestling match?
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => declareWinner(match.id, 1)}
                      className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {match.contestant1} Wins! 🎉
                    </button>
                    <button
                      type="button"
                      onClick={() => declareWinner(match.id, 2)}
                      className="w-full bg-green-600 text-white px-6 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {match.contestant2} Wins! 🎉
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickingWinnerMatchId(null)}
                      className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Prediction;
