export const depositChannels=[{id:"channel-one",name:"Channel One"},{id:"channel-two",name:"Channel Two"},{id:"channel-three",name:"Channel Three"}] as const;
export const depositMethods=["bKash","Nagad","Rocket","Upay","CellPin","USDT"] as const;
export const withdrawalMethods=["Bank","bKash","Nagad","Rocket","Upay","CellPin"] as const;
export const transactionTabs=["Deposit","Withdrawal","Ticket Transaction"] as const;
export const languages=["English","বাংলা"] as const;

export const cryptoDepositConfig={
 "USDT (BEP20)":{walletAddress:"",qrImageUrl:""},
 "USDT (TRC20)":{walletAddress:"",qrImageUrl:""},
 "USDT (ERC20)":{walletAddress:"",qrImageUrl:""}
} as const;

export const fiatPaymentAccounts:Record<string,Record<string,string>>={
 "channel-one":{"bKash":"","Nagad":"","Rocket":"","Upay":"","CellPin":""},
 "channel-two":{"bKash":"","Nagad":"","Rocket":"","Upay":"","CellPin":""},
 "channel-three":{"bKash":"","Nagad":"","Rocket":"","Upay":"","CellPin":""}
};
export const fiatWithdrawalChannels=[{id:"channel-one",name:"Channel One"},{id:"channel-two",name:"Channel Two"},{id:"channel-three",name:"Channel Three"}] as const;
