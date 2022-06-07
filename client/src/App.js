import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from "./ipfs"
import CryptoJS from "crypto-js";




import "./App.css";

class App extends Component {
 
  constructor(props) {
    super(props)

    this.state = {
      ipfsHash: '',
      web3: null,
      buffer: null,
      account: null, 
      readFromBlockchain: null,
      raw: null,
      key : '',
      ciphertext: ''  
    
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
 
 
  
  }

 
  


  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
   await contract.methods.set(this.state.ipfsHash).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
   const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ ipfsHash: response });
    console.log("Procitano sa blockchaina : ", response)
    
  };

  getYourTemplate = async () => {
  const { contract } = this.state;
   const response = await contract.methods.get().call();
   console.log("Response " , response)
   this.setState({ readFromBlockchain: response });

    
  };

  


 // konvertuje seletovani fajl u buffer tako da moze da se posalje na IPFS
 captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader(); 
   reader.readAsText(file);
    reader.onload = ()  => {
    this.setState({raw: reader.result})
    console.log("raw file : ", this.state.raw);
    this.encryptDataWithAES();
  }

 
}

encryptDataWithAES(){
  var data = this.state.raw;
  var key = this.state.key;
  console.log("key - ",key)

  // Encrypt
  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  //log encrypted data
  console.log('Encrypt Data -')
  console.log(ciphertext);
  this.setState({ciphertext : ciphertext });

  this.setState({buffer:Buffer(ciphertext)})
  console.log("buffer file : ", this.state.buffer);

   // Decrypt
   var bytes = CryptoJS.AES.decrypt(ciphertext, key);
   var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
 
   //log decrypted Data
   console.log('decrypted Data -')
   console.log(decryptedData);


  
}


// salje na IPFS i vraca hash
onSubmit(event) {
  event.preventDefault();
   ipfs.files.add(this.state.buffer, (error, result) => {
     if(error){
       console.log(error)
       return
     }

   this.setState({ipfsHash : result[0].hash})
   this.runExample();
   console.log('ipfsHash', this.state.ipfsHash )
   });


  

}




getInputValueKey = (event)=>{
  // show the user input value to console
  const userValue = event.target.value;
  this.setState({key: userValue});
  console.log(this.state.key);
};



render() {
  return (
    <div className="App">
      
      <nav className="nav">
        <h2 className="title">Simulacija čuvanja biometrijskih šema na blokčejnu putem IPFS sistema</h2>
      </nav>
     
      <main className="body">
        <div >
           <div className="mainContainer">
            <p className="firstParagraph"></p>
          
            
            <h2 className="title">Učitajte svoje biometrijske podatke</h2>
            <form className="formForUpload" onSubmit={this.onSubmit} >
            <label>Unesite vaš privatni ključ za šifrovanje podataka</label>
            <input className="inputKey" type="text" onChange={this.getInputValueKey} /><br></br>
            
              <input className=""  type='file' onChange={this.captureFile} /><br></br>
              <input className="button" type='submit' value="Sačuvaj podatke na blokčejnu" />
              <hr></hr>
            </form>
            <button className="button" onClick={this.getYourTemplate}>Pročitaj zapis na blokčejnu </button>
          <p> Adresa šifrovanih podataka na IPFS sistemu : {this.state.readFromBlockchain} </p>
          <a className="linkToIPFS" href={`https://ipfs.io/ipfs/${this.state.readFromBlockchain}`} >Link ka šifrovanim podacima</a>
         
            <hr></hr>
            <div className="bottomConteiner">
            <div className="top">
            <p>Biometrijska šema Vaših podataka šifrovana AES algoritmom</p>
            <textarea className="encrypt" value={this.state.ciphertext}></textarea>
            </div>
            <hr></hr>
            <div className="bottom">
            <p>Dešifjute svoje podatke</p>
            <label>Unesite vaš privatni ključ za šifrovanje podataka</label>
            <input className="inputKey" type="text" onChange={this.getInputValueKey} /><br></br>
            <textarea className="encrypt" value={this.state.ciphertext}></textarea>
            </div>

            </div>
           
          
          
          </div>
         

        </div>
      </main>
    
    </div>

  );
}
}



export default App;
