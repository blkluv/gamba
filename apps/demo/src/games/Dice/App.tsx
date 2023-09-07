import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ResponsiveSize, useGameControls } from 'gamba/react-ui'
import React, { useState } from 'react'
import * as Tone from 'tone'
import Slider from './Slider'
import { GameContainer, SemiCircleContainer, StatContainer, StatContainerWrapper, StatItem, StyledSlider, WagerButtons, WagerInput, WagerSection } from './styles'

import loseSrc from './lose.mp3'
import winSrc from './win.mp3'

const MAX_PAYOUT = 6

const createSound = (url: string) => new Tone.Player({ url }).toDestination()

const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

function Dice() {
  const gamba = useGamba()
  const [_wager, setWager] = useState(0.05)
  const [loading, setLoading] = useState(false)
  const [resultIndex, setResultIndex] = useState(-1)
  const [odds, setOdds] = useState(50)

  const maxBet = Math.min(lamportsToSol(gamba.balances.total), MAX_PAYOUT * (odds / 100))
  const wager = Math.min(maxBet, _wager)

  const multiplier = 100 / odds

  const bet = React.useMemo(
    () => {
      return Array.from({ length: 100 }).map((_, i) => {
        if (i < odds) {
          return +multiplier.toFixed(4)
        }
        return 0
      })
    }
    , [odds],
  )

  useGameControls({
    play: {
      type: 'button',
      disabled: loading,
      onClick: () => play(),
    },
  })

  const play = async () => {
    try {
      setLoading(true)

      await gamba.play({
        bet,
        wager: solToLamports(wager),
      })

      const result = await gamba.awaitResult()
      const resultnr = result.resultIndex + 1

      setResultIndex(resultnr)
      const win = result.payout > 0
      if (win) {
        soundWin.start()
      } else {
        soundLose.start()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveSize maxScale={1.25}>
        <GameContainer>
          <StatContainerWrapper>
            <SemiCircleContainer>
              <div>{odds + 1}</div>
              <div>Roll Under</div>
            </SemiCircleContainer>
            <StatContainer>
              <StatItem>
                <div>{odds}%</div>
                <div>Win odds</div>
              </StatItem>
              <StatItem>
                <div>{multiplier.toFixed(2)}x</div>
                <div>Multiplier</div>
              </StatItem>
              <StatItem>
                <div>{(wager * multiplier - wager).toFixed(3)} SOL</div>
                <div>Payout</div>
              </StatItem>
              <StatItem>
                <div>{maxBet.toFixed(2)} SOL</div>
                <div>Max Bet</div>
              </StatItem>
            </StatContainer>
          </StatContainerWrapper>

          <Slider
            resultIndex={resultIndex}
            disabled={loading}
            min={1}
            max={100}
            value={odds}
            onChange={(value) => {
              setOdds(value)
              let newWager = wager // Compute the new wager based on the new odds value
              if (newWager > maxBet) {
                newWager = maxBet
              }
              setWager(newWager)
            }}
          />

          <WagerSection>
            <div>
              <WagerInput>
                <input
                  disabled={loading}
                  type="number"
                  min="0.05"
                  step="0.01"
                  max={maxBet.toFixed(2)}
                  value={wager}
                  onChange={(e) => {
                    let newWager = Number(e.target.value)
                    if (newWager > maxBet) {
                      newWager = maxBet
                    }
                    setWager(newWager)
                  }}
                />
                SOL
              </WagerInput>
              <StyledSlider
                disabled={loading}
                type="range"
                min="0.05"
                step="0.01"
                max={maxBet.toFixed(2)}
                value={wager}
                onChange={(e) => {
                  let newWager = Number(e.target.value)
                  if (newWager > maxBet) {
                    newWager = maxBet
                  }
                  setWager(newWager)
                }}
              />
              <WagerButtons>
                <button onClick={() => setWager(0.05)}>Min</button>
                <button onClick={() => setWager(Math.min(wager * 2, maxBet))}>2x</button>
                <button onClick={() => setWager(wager / 2)}>1/2</button>
                <button onClick={() => setWager(maxBet)}>Max</button>
              </WagerButtons>
            </div>
          </WagerSection>

        </GameContainer>
      </ResponsiveSize>
    </>
  )
}

export default Dice