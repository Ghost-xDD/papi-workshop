#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod prediction_market {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[cfg_attr(
        feature = "std",
        derive(
            Debug,
            PartialEq,
            Eq,
            ink::storage::traits::StorageLayout,
        )
    )]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Market {
        pub id: u64,
        pub question: String,
        pub yes_total: u64,
        pub no_total: u64,
        pub resolved: bool,
        pub yes_wins: bool,
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct PredictionMarket {
        markets: Mapping<u64, Market>,
        counter: u64,
        // (market_id, user_account, voted_yes) => amount
        votes: Mapping<(u64, AccountId, bool), u64>,
    }

    impl PredictionMarket {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                markets: Mapping::default(),
                counter: 0,
                votes: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn create_market(&mut self, question: String) -> u64 {
            let caller_h160 = self.env().caller();
            let mut data = [0u8; 32];
            data[12..].copy_from_slice(caller_h160.as_bytes());
            let _caller = AccountId::from(data);

            let id = self.counter;

            let market = Market {
                id,
                question,
                yes_total: 0,
                no_total: 0,
                resolved: false,
                yes_wins: false,
            };

            self.markets.insert(id, &market);
            self.counter = self.counter.saturating_add(1);

            id
        }

        #[ink(message)]
        pub fn vote(&mut self, market_id: u64, vote_yes: bool, amount: u64) {
            let caller_h160 = self.env().caller();
            let mut data = [0u8; 32];
            data[12..].copy_from_slice(caller_h160.as_bytes());
            let caller = AccountId::from(data);

            if let Some(mut market) = self.markets.get(market_id) {
                // Update totals
                if vote_yes {
                    market.yes_total = market.yes_total.saturating_add(amount);
                } else {
                    market.no_total = market.no_total.saturating_add(amount);
                }

                // Store user vote
                let key = (market_id, caller, vote_yes);
                let current = self.votes.get(&key).unwrap_or_default();
                self.votes.insert(&key, &(current.saturating_add(amount)));

                self.markets.insert(market_id, &market);
            }
        }

        #[ink(message)]
        pub fn resolve(&mut self, market_id: u64, yes_wins: bool) {
            if let Some(mut market) = self.markets.get(market_id) {
                market.resolved = true;
                market.yes_wins = yes_wins;
                self.markets.insert(market_id, &market);
            }
        }

        #[ink(message)]
        pub fn get_market(&self, market_id: u64) -> Option<Market> {
            self.markets.get(market_id)
        }

        #[ink(message)]
        pub fn get_vote(&self, market_id: u64, user: AccountId, voted_yes: bool) -> u64 {
            self.votes.get(&(market_id, user, voted_yes)).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_counter(&self) -> u64 {
            self.counter
        }
    }
}
