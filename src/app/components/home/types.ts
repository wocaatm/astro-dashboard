export interface SummaryData {
  totalPower: number,
  totalPoint: number,
  totalAsterix: number,
  stakeAddressCount: number,
}

export interface ListItem {
  index: number
  ownerAddress: string,
  point: string
  asterix: string | null
  power: string | null
}