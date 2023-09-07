import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusBalance, useGamba } from 'gamba/react'
import { formatLamports, useClaim, useCloseAccount, useCreateAccount, useRedeemBonus } from 'gamba/react-ui'
import React, { useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Loader } from '../components/Loader'
import { Modal } from '../components/Modal'
import { Svg } from '../components/Svg'
import { Value } from '../components/Value'
import { useOnClickOutside } from '../hooks/useOnClickOutside'

function RedeemBonusButton() {
  const [redeemBonus, loading] = useRedeemBonus()
  const bonusBalance = useBonusBalance()

  if (bonusBalance === 0) {
    return null
  }

  return (
    <Button onClick={() => redeemBonus(bonusBalance)} loading={loading} className="yellow list shine">
      Redeem {formatLamports(bonusBalance, 'gSOL')}
    </Button>
  )
}

function ClaimButton() {
  const gamba = useGamba()
  const [claim, loading] = useClaim()

  if (gamba.balances.user === 0) {
    return null
  }

  return (
    <Button onClick={() => claim()} loading={loading} className="green list shine">
      Claim {formatLamports(gamba.balances.user)}
    </Button>
  )
}

function CopyAddressButton() {
  const gamba = useGamba()
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(gamba.wallet.publicKey.toBase58())
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  return (
    <Button onClick={copy} className="transparent list">
      {copied ? 'Copied' : 'Copy Address'}
    </Button>
  )
}

function ShuffleSeedButton() {
  const gamba = useGamba()

  const shuffle = () => {
    gamba.updateSeed()
  }

  return (
    <Button onClick={shuffle} className="list transparent">
      SEED: {gamba.seed}
      <Svg.Shuffle />
    </Button>
  )
}

function CloseAccountButton({ onClosed }: {onClosed?: () => void}) {
  const gamba = useGamba()
  const [closeAccount, loading] = useCloseAccount()

  const close = async () => {
    await closeAccount()
    onClosed && onClosed()
  }

  if (!gamba.user.created) return null

  return (
    <Button loading={loading} onClick={close} className="list transparent">
      Close Account
    </Button>
  )
}

function CreateAccountButton() {
  const gamba = useGamba()
  const [createAccount, loading] = useCreateAccount()

  if (gamba.user.created) return null

  return (
    <Button loading={loading} onClick={createAccount} className="list transparent">
      Create Account
    </Button>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const [modal, setModal] = React.useState(false)
  const gamba = useGamba()
  const wallet = useWallet()
  const ref = React.useRef<HTMLDivElement>(null!)
  const [visible, setVisible] = useState(false)

  useOnClickOutside(ref, () => setVisible(false))

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  return (
    <>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h1>More Options</h1>
          <ShuffleSeedButton />
          <CloseAccountButton onClosed={() => setModal(false)} />
          <CreateAccountButton />
          <ButtonLink className="list transparent" href="https://gamba.so/" target="_blank">
            More info <Svg.ExternalLink />
          </ButtonLink>
        </Modal>
      )}
      <div style={{ position: 'relative', minWidth: '180px' }} ref={ref}>
        {wallet.connected ? (
          <>
            <Button className="dark" style={{ width: '100%' }} onClick={() => setVisible(!visible)}>
              <Value>
                {formatLamports(gamba.balances.total)}
              </Value>
              <img src={wallet.wallet?.adapter.icon} height="20px" />
              {gamba.user?.created && gamba.user?.status !== 'playing' && <Loader size={1} />}
            </Button>
            <Dropdown visible={visible}>
              <CopyAddressButton />
              <ClaimButton />
              <RedeemBonusButton />
              {wallet.connected && (
                <Button onClick={() => wallet.disconnect()} className="transparent list">
                  Disconnect
                </Button>
              )}
              <Button onClick={() => setModal(true)} className="transparent list">
                More Options <Svg.ArrowRight />
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button className="dark" style={{ width: '100%' }} onClick={connect}>
            {wallet.connecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </>
  )
}