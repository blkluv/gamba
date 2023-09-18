import { solToLamports } from 'gamba'

export const WAGER_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1, 2].map(solToLamports)

export const RANK_SYMBOLS: Record<number, string> = {
  0: '2',
  1: '3',
  2: '4',
  3: '5',
  4: '6',
  5: '7',
  6: '8',
  7: '9',
  8: '10',
  9: 'J',
  10: 'Q',
  11: 'K',
  12: 'A',
}
export const RANKS = Object.keys(RANK_SYMBOLS).length

export { default as SOUND_CARD } from './card.mp3'
export { default as SOUND_FINISH } from './finish.mp3'
export { default as SOUND_LOSE } from './lose.mp3'
export { default as SOUND_PLAY } from './play.mp3'
export { default as SOUND_WIN } from './win.mp3'

