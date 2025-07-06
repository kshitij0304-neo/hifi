// Loading Animation
window.addEventListener('load', () => {
  document.querySelector('.loading-screen').style.opacity = '0';
  setTimeout(() => {
    document.querySelector('.loading-screen').style.display = 'none';
  }, 1000);
});

// GSAP Scroll Animation
gsap.from(".hero h2", { opacity: 0, y: 50, duration: 1 });
gsap.from(".hero p", { opacity: 0, y: 50, delay: 0.3 });
gsap.from(".hero button", { opacity: 0, y: 50, delay: 0.6 });

// MetaMask Integration
document.getElementById('connectWallet').addEventListener('click', async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      alert(`Connected: ${accounts[0]}`);
    } catch (err) {
      alert('Wallet connection failed');
    }
  } else {
    alert('MetaMask not found!');
  }
});

// Dummy Mint Button
document.getElementById('mintButton').addEventListener('click', () => {
  alert('Minting process would be triggered here');
});
