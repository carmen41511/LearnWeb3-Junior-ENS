'use client';
import Head from "next/head";
import styles from "../app/page.module.css";
import Web3Modal from "web3modal";
import {ethers, providers} from "ethers";
import {useEffect, useRef, useState} from "react";

export default function Home() {
  // keep track of user's wallet connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // create a reference to the web3 modal (used for connecting to metamask), 
  // persists as long as the page lasts 
  const web3ModalRef = useRef();

  const [ens, setENS] = useState("");

  // save the address of the currently connected account
  const [address, setAddress] = useState("");

  // set the ENS (if the current connected address has an associated ENS) 
  // or sets the address of the connected account
  const setENSOrAddress = async (address, web3Provider) => {
    var _ens = await web3Provider.lookupAddress(address);

    if (_ens){
      setENS(_ens);
    } else {
      setAddress(address);
    }
  };

  // Metamask exposes a Signer API to allow your website to request signatures from the user using Signer func.
  const getProviderOrSigner = async (needSigner = false) => {

    // access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }
    const signer = web3Provider.getSigner();

    const address = await signer.getAddress();

    await setENSOrAddress(address, web3Provider);
    return signer;
  };

  // connects the MetaMask wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch(err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      <div> Wallet connected </div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // whenever the value of 'walletConnected' changes, this effect will be called
  useEffect(() => {
    if (!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to Carmen Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for Carmen Punks.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by LearnWeb3 Punks
      </footer>
    </div>
  );
}

