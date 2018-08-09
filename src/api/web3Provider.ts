const WAIT_FOR_SDK_TIMEOUT = 30000

import { ProviderInterface } from './types'
import { windowLoaded, promisify } from 'utils'
import { Account } from 'types'
import Web3 from 'web3'
// import { resolve } from 'url';
// import { rejects } from 'assert';

const getProvider = () => {
  if (typeof window !== 'undefined' && window.web3) {
    return window.web3.currentProvider
  }

  return new Web3.providers.HttpProvider('http://localhost:8545')
}

const waitForWeb3Ready = async () => {
  const win: any = window
  if (window.web3 || win.imToken) {
    // web3 or the SDK is already loaded
    return window.web3
  } else {
    // If web3 is not loaded, we wait for the SDK to get injected
    return new Promise((resolve, reject) => {
      window.addEventListener('sdkReady', () => {
        resolve(window.web3)
      })

      setTimeout(() => {
        reject(new Error(`The web3 was not injected within ${WAIT_FOR_SDK_TIMEOUT / 1000}s`))
      }, WAIT_FOR_SDK_TIMEOUT)
    })
  }
}

const setupWeb3 = async () => {
  // Wait for window and web3 injection
  await windowLoaded
  await waitForWeb3Ready()

  if ((
    typeof navigator !== 'undefined' && !navigator.onLine
  ) || typeof window.web3  === 'undefined') {
    throw 'Web3 connectivity issues due to client network connectivity loss'
  }

  return new Web3(getProvider())
}

export const promisedWeb3 = init()

async function init(): Promise<ProviderInterface> {
  try {
    const web3 = await setupWeb3()

    const getAccounts = promisify(web3.eth.getAccounts, web3.eth)
    const getBalance = promisify(web3.eth.getBalance, web3.eth)

    const getBlock = promisify(web3.eth.getBlock, web3.eth)
    const getTransaction = promisify(web3.eth.getTransaction, web3.eth)
    const getTransactionReceipt = promisify(web3.eth.getTransactionReceipt, web3.eth)

    const getCurrentAccount = async () => {
      const [account] = await getAccounts()

      return account
    }

    const getETHBalance = async (account: Account, inETH?: boolean) => {
      const wei = await getBalance(account)

      return inETH ? web3.fromWei(wei, 'ether') : wei
    }

    const getNetwork = promisify(web3.version.getNetwork, web3.version)

    const isConnected = web3.isConnected.bind(web3)

    const setProvider = web3.setProvider.bind(web3)

    const isAddress = web3.isAddress.bind(web3)

    const resetProvider = () => setProvider(getProvider())

    const getTimestamp = async (block = 'latest') => {
      const blockData = await promisify(web3.eth.getBlock, web3.eth)(block)

      return blockData.timestamp
    }

    return {
      getCurrentAccount,
      getAccounts,
      getBlock,
      getTransaction,
      getTransactionReceipt,
      getETHBalance,
      getNetwork,
      isConnected,
      isAddress,
      get currentProvider() {
        return web3.currentProvider
      },
      web3,
      setProvider,
      resetProvider,
      getTimestamp,
    }
  } catch (err) {
    console.error(err)
  }
}
