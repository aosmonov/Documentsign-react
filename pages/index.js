import Head from "next/head";
import { Inter } from "next/font/google";
import { Contract, providers, ethers } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ADDRESS, NFT_ABI } from "constants";
import "bootstrap/dist/css/bootstrap.css";
import Metamask from "./components/Metamask";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  const [coins, setCoins] = useState([]);
  const [docMessage, setDocMessage] = useState("");

  const getDocuments = async () => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const maxId = Number(await nftContract.documentId());
      const _nfts = [];
      for (let i = maxId; i > 0; i--) {
        let result = await nftContract.documents(i);
        let signers = await nftContract.getSigners(i);
        _nfts.push({ ...result, signers: signers, id: i });
      }
      
      setCoins(_nfts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (walletConnected) {
      getDocuments();
    }
  }, [walletConnected]);

  const sign = async (docId) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    await nftContract.signDocument(docId);

    setTimeout(() => getDocuments(), 10000);
  };

  const addDocument = async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
    await nftContract.createDocument(docMessage);
    setDocMessage("");
    setTimeout(() => getDocuments(), 10000);
  };

  return (
    <>
      <Head>
        <title>Document sign</title>
        <meta name="description" content="Frontend for Document Sign application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
            WeCore
          </a>
          <div className="collapse navbar-collapse"></div>
          <Metamask
            walletConnected={walletConnected}
            setWalletConnected={setWalletConnected}
            web3ModalRef={web3ModalRef}
          />
        </div>
      </nav>
      <main role="main">
        <div className="jumbotron">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <h2 className="display-4">Document Sign</h2>
                <p>
                  To sign document write text on textarea at right and click add. Before adding make sure you are connected. You can click on Connect button at top right
                </p>
              </div>
              <div className="col-md-6 col-lg-8 clearfix">
                <textarea
                  className="form-control"
                  rows="6"
                  value={docMessage}
                  onChange={(e) => setDocMessage(e.target.value)}
                ></textarea>
                <button
                  className="btn btn-success mt-2 float-end"
                  onClick={addDocument}
                  disabled={!walletConnected}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row gy-3">
            {coins.map((item, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.info}</h5>
                    <p className="title-text">
                      Signers{" "}
                      <span className="badge bg-info">
                        {Number(item.signatureCount)}
                      </span>
                    </p>
                    <hr />
                    <div className="mb-4">
                      {item.signers.map((signer, index2) => (
                        <p key={"t-" + index + "-" + index2} className="small-text">{signer}</p>
                      ))}
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm mt-auto"
                      disabled={!walletConnected}
                      onClick={() => sign(item.id)}
                    >
                      Sign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
