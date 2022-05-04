const ethers = require('ethers');  
const { AgreementAddress, AgreementContractAbi, AgreementAbi } = require('./config');  
var contractList = [];
var setContractState=[];


const createAgreement = async (buyerAddress,sellerAddress,price,stakePercentBuyer,stakePercentSeller,title, description) => { 
    
    const formattedPrice = ethers.utils.parseEther(price);  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); 
    const agreementContract = new ethers.Contract(
      AgreementAddress,
      AgreementContractAbi,
      signer
    ); 
    let txn; 
    try {
      const formattedPrice = ethers.utils.parseEther(price.toString());
      txn = await agreementContract.agreementCreate(
        buyerAddress,
        sellerAddress,
        formattedPrice,
        stakePercentBuyer.toString(),
        stakePercentSeller.toString(),
        title,
        description
      );
      await txn.wait(); 
      console.log(txn, "transaction");  
    } catch (err) { 
      console.log(err); 
    }
  };

  const getContractList= async(address)=>{ 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const agreementContract = new ethers.Contract(
      AgreementAddress,
      AgreementContractAbi,
      signer
    );
    let agreAddress = await agreementContract.getAgreementByParties(
        address
    );  
    contractList=[...agreAddress]; 
      agreementContract.on("CreateAgreement", (buyer, seller, price, address,title, description) => {
        if (
          props.currentAccount.toLowerCase() === buyer.toLowerCase() ||
          props.currentAccount.toLowerCase() === seller.toLowerCase()
        ) { 
          contractList.map((prevState) => { 
            if (!prevState.includes(address)) return [address, ...prevState];
            return prevState;
          });
        } 
    })
    console.log(agreAddress);
    if(contractList != null && contractList.length != 0 ){
        return contractList;
    } 
  return  contractList;
  }

  const cleanAgreement = (agreementDetails) => {
    let cleanAgreement = {
      active: agreementDetails.active,
      cancelled: agreementDetails.cancelled,
      buyer: agreementDetails.buyer,
      seller: agreementDetails.seller,
      buyerCancel: agreementDetails.buyerCancel,
      sellerCancel: agreementDetails.sellerCancel,
      buyerStake: agreementDetails.buyerStake,
      sellerStake: agreementDetails.sellerStake,
      address: agreementDetails.agreAddress,
      statePercent: agreementDetails.statePercent,
      sellerPercent: agreementDetails.sellerPercent,
      price: ethers.utils.formatEther(agreementDetails.salePrice),
      title: agreementDetails.title,
      description: agreementDetails.description,
    };
    return cleanAgreement;
  };

  const agreementLists= async(contractAddress)=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );

    let agreementDetails = await agreementContract.getStatus(); 
    let list = cleanAgreement(agreementDetails);
     setContractState.push(list);  

    agreementContract.on("AgreementStateChanged", (buyer, seller, state) => {
       let data= cleanAgreement(state);
        setContractState.push(data);  
      });
      return setContractState;
  } 

  const stake = async (contractAddress,contractState, userAdd) => {  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );

    let txn;
    try {
      let per;
      let stake = Number(contractState.price);
      if (contractState.buyer === userAdd) {
        per = Number(contractState.statePercent);
      } else {
        per = Number(contractState.sellerPercent);
      }
      stake = (stake * per) / 100;
      const formattedPrice = ethers.utils.parseEther(String(stake));
      txn = await agreementContract.stake({ value: formattedPrice });
      await txn.wait();
     
    } catch (err) {
      console.log(err);
    }
  };

  const withdrawStake = async (contractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );
    let txn;
    try {
      txn = await agreementContract.revokeStake();
      await txn.wait(); 
    } catch (err) { 
      console.log(err);
    }
  };

  const cancel = async (contractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );
    let txn;

    try {
      txn = await agreementContract.cancel();
      await txn.wait(); 
    } catch (err) {
       console.log(err);
    }
  };

  const revokeCancel = async (contractAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );
    let txn;

    try {
      txn = await agreementContract.revokeCancellation();
      await txn.wait(); 
    } catch (err) {
      
      console.log(err);
    }
  };

  const confirm = async (contractAddress) => { 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const agreementContract = new ethers.Contract(
      contractAddress,
      AgreementAbi,
      signer
    );
    let txn; 
    try {
      txn = await agreementContract.confirm();
      await txn.wait(); 
    } catch (err) { 
      console.log(err);
    }
  }; 

module.exports={
    createAgreement,
    getContractList,
    contractList,
    setContractState,
    agreementLists,
    stake,
    withdrawStake,
    cancel,
    revokeCancel,
    confirm
}