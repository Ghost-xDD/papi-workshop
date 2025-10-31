#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prediction_market {
    use ink::prelude::string::String;
    use ink::storage::Mapping;
    use ink::primitives::{H160, U256};

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum Outcome {
        Pending,
        Yes,
        No,
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Market {
        pub id: u64,
        pub question: String,
        pub creator: H160,
        pub outcome: Outcome,
        pub total_yes: Balance,
        pub total_no: Balance,
        pub resolved: bool,
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct PredictionMarket {
        markets: Mapping<u64, Market>,
        market_counter: u64,
        // (market_id, user, is_yes) => bet_amount
        bets: Mapping<(u64, H160, bool), Balance>,
        // Track if user claimed
        claimed: Mapping<(u64, H160), bool>,
    }

    impl PredictionMarket {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        /// Create a new prediction market
        #[ink(message)]
        pub fn create_market(&mut self, question: String) -> u64 {
            let market_id = self.market_counter;
            let caller = self.env().caller();

            let market = Market {
                id: market_id,
                question,
                creator: caller,
                outcome: Outcome::Pending,
                total_yes: 0,
                total_no: 0,
                resolved: false,
            };

            self.markets.insert(market_id, &market);
            self.market_counter = self.market_counter.saturating_add(1);

            market_id
        }

        /// Bet on Yes or No
        #[ink(message, payable)]
        pub fn place_bet(&mut self, market_id: u64, bet_on_yes: bool) {
            let caller = self.env().caller();
            // Convert U256 to u128 immediately to avoid U256 ops
            let amount = self.env().transferred_value().as_u128();

            // Get market
            let mut market = self.markets.get(market_id).expect("Market not found");
            assert!(!market.resolved, "Market already resolved");
            assert!(amount > 0, "Must bet some amount");

            // Update totals
            if bet_on_yes {
                market.total_yes = market.total_yes.saturating_add(amount);
            } else {
                market.total_no = market.total_no.saturating_add(amount);
            }

            // Store user's bet
            let current_bet = self.bets.get((market_id, caller, bet_on_yes)).unwrap_or(0);
            self.bets.insert((market_id, caller, bet_on_yes), &(current_bet.saturating_add(amount)));

            self.markets.insert(market_id, &market);
        }

        /// Resolve market - only creator can call
        #[ink(message)]
        pub fn resolve(&mut self, market_id: u64, yes_wins: bool) {
            let caller = self.env().caller();
            let mut market = self.markets.get(market_id).expect("Market not found");

            assert_eq!(caller, market.creator, "Only creator can resolve");
            assert!(!market.resolved, "Already resolved");

            market.outcome = if yes_wins { Outcome::Yes } else { Outcome::No };
            market.resolved = true;

            self.markets.insert(market_id, &market);
        }

        /// Claim winnings
        #[ink(message)]
        pub fn claim(&mut self, market_id: u64) {
            let caller = self.env().caller();
            let market = self.markets.get(market_id).expect("Market not found");

            assert!(market.resolved, "Market not resolved");
            
            let already_claimed = self.claimed.get((market_id, caller)).unwrap_or(false);
            assert!(!already_claimed, "Already claimed");

            let won_yes = market.outcome == Outcome::Yes;
            let user_bet = self.bets.get((market_id, caller, won_yes)).unwrap_or(0);

            assert!(user_bet > 0, "No winning bet");

            // Calculate winnings: (user_bet / winning_total) * total_pool
            let winning_total = if won_yes { market.total_yes } else { market.total_no };
            let total_pool = market.total_yes.saturating_add(market.total_no);

            // Simple u128 math, then convert to U256 for transfer
            let winnings = user_bet
                .saturating_mul(total_pool)
                .checked_div(winning_total)
                .unwrap_or(0);

            // Mark as claimed
            self.claimed.insert((market_id, caller), &true);

            // Convert u128 to U256 for transfer
            let amount_u256 = U256::from(winnings);
            self.env().transfer(caller, amount_u256).expect("Transfer failed");
        }

        /// Get market details
        #[ink(message)]
        pub fn get_market(&self, market_id: u64) -> Option<Market> {
            self.markets.get(market_id)
        }

        /// Get user's bet
        #[ink(message)]
        pub fn get_bet(&self, market_id: u64, user: H160, bet_on_yes: bool) -> Balance {
            self.bets.get((market_id, user, bet_on_yes)).unwrap_or(0)
        }

        /// Get total markets
        #[ink(message)]
        pub fn get_market_count(&self) -> u64 {
            self.market_counter
        }

        /// Check if user claimed
        #[ink(message)]
        pub fn has_claimed(&self, market_id: u64, user: H160) -> bool {
            self.claimed.get((market_id, user)).unwrap_or(false)
        }
    }
}

