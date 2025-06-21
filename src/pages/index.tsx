import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Head from "next/head";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = '0xfef23139179004d7d636a1e66316e42085640262';
const CONTRACT_ABI = [
  'function MAX_PEERS() view returns (uint8)',
  'function ID_LENGTH() view returns (uint16)',
  'function getPeerCount(address) view returns (uint8)',
  'function getAllPeerIds(address) view returns (string[])',
  'function getPeerId(address, uint8) view returns (string)',
  'function addPeerId(string calldata peerId)',
  'function setPeerId(uint8 slot, string calldata peerId)',
  'function removePeerId(uint8 slot)'
];

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState(null);
  const [peerIds, setPeerIds] = useState([]);
  const [count, setCount] = useState(0);
  const [inputSlot, setInputSlot] = useState(0);
  const [inputPeerId, setInputPeerId] = useState('');
  const [wait, setWait] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum)
      setProvider(prov);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (provider === null) {
        return
      }
      setError(null);

      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      const sig = await provider.getSigner();
      setSigner(sig);
      const ctr = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sig);
      setContract(ctr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const loadPeerData = async () => {
    if (!contract || !account) return;
    try {
      setError(null);
      setWait(true);
      const c = await contract.getPeerCount(account);
      setCount(c);
      const list = await contract.getAllPeerIds(account);
      setPeerIds(list);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setWait(false);
    }
  };

  useEffect(() => {
    loadPeerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account]);

  const handleAdd = async () => {
    try {
      if (contract === null) {
        return
      }

      setError(null);
      setWait(true);
      const tx = await contract.addPeerId(inputPeerId);
      await tx.wait();
      loadPeerData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setWait(false);
    }
  };

  const handleSet = async () => {
    try {
      if (contract === null) {
        return
      }

      setError(null);
      setWait(true);
      const tx = await contract.setPeerId(inputSlot, inputPeerId);
      await tx.wait();
      loadPeerData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setWait(false);
    }
  };

  const handleRemove = async () => {
    try {
      if (contract === null) {
        return
      }

      setError(null);
      setWait(true);
      const tx = await contract.removePeerId(inputSlot);
      await tx.wait();
      loadPeerData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally{
      setWait(false);
    }
  };

  const containerStyle = { maxWidth: '600px', margin: '0 auto', padding: '16px', fontFamily: 'Arial, sans-serif' };
  const buttonStyle = { padding: '8px 16px', margin: '4px', cursor: 'pointer' };
  const buttonStylel = { padding: '8px 16px', margin: '4px 4px 4px 0', cursor: 'pointer' };
  const inputStyle = { padding: '8px', marginRight: '8px' };
  const listStyle = { listStyleType: 'none' };


  return (
    <>
      <Head>
        <title>Manage on-chain Libp2p Bootstrappers</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={containerStyle}>
        <h1>DApp for managing on-chain Libp2p bootstrapper peer IDs</h1>
        <div style={{padding: "0.5rem 0"}}>Deployed on Sepolia Testnet</div>
        <p>Contract address: {CONTRACT_ADDRESS}</p>
        <p style={{ padding:"0.5rem 0"}}>Add up to 32 bootstrapper peer IDs to a smart contract that other libp2p peers can bootstrap from. Use libp2p <a href="https://github.com/libp2p/js-libp2p-delegated-peer-routing">delegated routing</a> to resolve peer IDs to multiaddrs.</p>
        {!account ? (
          <button onClick={connectWallet} style={buttonStyle}>
            Connect Wallet
          </button>
        ) : (
            <div style={{ paddingTop: "1em" }}>
              <p>Account Connected: {account}</p>
              <p style={{ paddingTop: "1em" }}>Bootstrapper Peer IDs: {count}</p>
              <ul style={listStyle}>
                {peerIds.map((id, i) => (
                  <li key={i}>{i}: {id}</li>
                ))}
              </ul>
              <div style={{ paddingTop: "1em" }}>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={inputSlot}
                  onChange={e => setInputSlot(parseInt(e.target.value, 10) || 0)}
                  placeholder="Slot (0-31)"
                  style={{ ...inputStyle, width: '100px' }}
                />
                <input
                  type="text"
                  value={inputPeerId}
                  onChange={e => setInputPeerId(e.target.value)}
                  placeholder="Peer ID (Qm... 12D... Max 52 bytes)"
                  style={{ ...inputStyle, width: '300px' }}
                />
              </div>
              <div>
                <button onClick={handleAdd} style={buttonStylel}>
                  Add Peer
                </button>
                <button onClick={handleSet} style={buttonStyle}>
                  Set Peer
                </button>
                <button onClick={handleRemove} style={buttonStyle}>
                  Remove Peer
                </button>
                <button onClick={loadPeerData} style={buttonStyle}>
                  Refresh
                </button>
              </div>
            </div>
          )}
            <div>
              { wait && <>Waiting for transaction confirmation</>}
            </div>
            <div>
              { error }
            </div>
        <div style={{ padding: "0.5rem 0"}}><a href="https://github.com/dozyio/evm-bootstrap-contract">Contract</a> - <a href="https://github.com/dozyio/libp2p-evm-bootstrap-dapp">DApp (this page)</a> - <a href="https://github.com/dozyio/js-libp2p-evm-bootstrap">JS Libp2p Library</a> - <a href="https://github.com/dozyio/evm-bootstrap-demo">Demo source</a> <a href="https://dozy.io/evm-bootstrap-demo/">Demo site</a></div>
    </div>
    </>
  );
}
