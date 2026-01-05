// Ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Three.js Galaxy Background ---
    const canvas = document.getElementById('three-bg');
    let scene, camera, renderer, material, mesh;
    let uniforms;

    // Initialize Three.js scene
    function initThreeJS() {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2; // Move camera back to see the plane

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0); // Transparent background for canvas

        // Shader Uniforms (dynamic values for the shader)
        uniforms = {
            u_time: { type: 'f', value: 1.0 },
            u_resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            u_mouse: { type: 'v2', value: new THREE.Vector2(0.0, 0.0) }
        };

        // Shader Material (GLSL code for the nebula effect)
        // Vertex Shader: Passes position and UV coordinates to fragment shader
        const vertexShader = `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        // Fragment Shader: Generates the colorful nebula pattern
        const fragmentShader = `
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;

            // Function to generate a random number (pseudo-random based on position)
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            // Function to create a smooth noise pattern (similar to Perlin noise)
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);

                // Four corners of a rectangle surrounding st
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));

                // Smooth interpolation
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
            }

            // Fractal Brownian Motion (FBM) for complex noise patterns
            float fbm(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 0.0;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0; // Increase frequency
                    amplitude *= 0.5; // Decrease amplitude
                }
                return value;
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                st.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

                vec2 p = st * 4.0; // Scale the noise pattern
                p += u_time * 0.1; // Animate the noise over time

                float n = fbm(p); // Get FBM noise value

                // Add a subtle distortion based on mouse position
                vec2 mouse_norm = u_mouse / u_resolution;
                n += fbm(p + mouse_norm * 0.5) * 0.2;

                // Create color gradients based on noise value
                vec3 color1 = vec3(0.1, 0.0, 0.2); // Dark Purple
                vec3 color2 = vec3(0.5, 0.1, 0.6); // Medium Purple
                vec3 color3 = vec3(0.9, 0.2, 0.4); // Pink
                vec3 color4 = vec3(0.1, 0.5, 0.8); // Blue

                vec3 finalColor = mix(mix(color1, color2, n * 2.0), mix(color3, color4, n * 2.0 - 1.0), n);

                // Add a subtle glow effect
                float glow = smoothstep(0.3, 1.0, n) * 0.5;
                finalColor += glow * vec3(0.8, 0.6, 1.0); // Light purple/blue glow

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        // Create a plane that fills the screen
        mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), material);
        scene.add(mesh);

        // Handle mouse movement for interactive background
        window.addEventListener('mousemove', (event) => {
            uniforms.u_mouse.value.x = event.clientX;
            uniforms.u_mouse.value.y = window.innerHeight - event.clientY; // Invert Y for shader
        });

        // Start animation loop
        animateThreeJS();
    }

    // Animation loop for Three.js
    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);
        uniforms.u_time.value += 0.01; // Increment time for animation
        renderer.render(scene, camera);
    }

    // Handle window resizing for Three.js
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.x = window.innerWidth;
        uniforms.u_resolution.value.y = window.innerHeight;
    }

    window.addEventListener('resize', onWindowResize);

    // Initialize Three.js when the window loads
    window.onload = initThreeJS;


    // --- GSAP Animations and Smooth Scroll ---

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            gsap.to(window, { duration: 1, scrollTo: targetId, ease: "power2.inOut" });
        });
    });

    // Header fade-in animation
    gsap.from("header", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // Hero section animations
    gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 1
    });
    gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 1.3
    });
    gsap.from(".hero-button", {
        opacity: 0,
        y: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 1.6
    });

    // Section reveal animations on scroll
    gsap.utils.toArray("section:not(#home)").forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 100,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%", // When top of section enters 80% of viewport
                end: "bottom 20%",
                toggleActions: "play none none reverse", // Play on enter, reverse on leave
                // markers: true // Uncomment for debugging scroll triggers
            }
        });
    });

    // NFT Card animations on scroll
    gsap.utils.toArray(".nft-card").forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            scale: 0.8,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: i * 0.1, // Stagger animation
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none reverse",
            }
        });
    });

    // Roadmap item animations on scroll
    gsap.utils.toArray(".roadmap-item").forEach((item, i) => {
        gsap.from(item, {
            opacity: 0,
            x: i % 2 === 0 ? -100 : 100, // Alternate direction
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse",
            }
        });
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('-translate-x-full');
        mobileMenu.classList.add('translate-x-0');
    });

    closeMobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('-translate-x-full');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('-translate-x-full');
        });
    });


    // --- MetaMask / Wallet Connection ---
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletStatus = document.getElementById('walletStatus');
    const mintNowBtn = document.getElementById('mintNowBtn');

    let connectedAccount = null;

    // Function to connect to MetaMask
    async function connectWallet() {
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                connectedAccount = accounts[0];
                walletStatus.textContent = `Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
                connectWalletBtn.textContent = "Wallet Connected";
                connectWalletBtn.disabled = true; // Disable button after connection
                mintNowBtn.classList.remove('opacity-50', 'cursor-not-allowed'); // Enable mint button
                mintNowBtn.disabled = false;
                console.log("MetaMask connected:", connectedAccount);

                // Listen for account changes
                window.ethereum.on('accountsChanged', (newAccounts) => {
                    if (newAccounts.length > 0) {
                        connectedAccount = newAccounts[0];
                        walletStatus.textContent = `Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
                        console.log("Account changed to:", connectedAccount);
                    } else {
                        connectedAccount = null;
                        walletStatus.textContent = "Wallet disconnected.";
                        connectWalletBtn.textContent = "Connect Wallet";
                        connectWalletBtn.disabled = false;
                        mintNowBtn.classList.add('opacity-50', 'cursor-not-allowed'); // Disable mint button
                        mintNowBtn.disabled = true;
                        console.log("MetaMask disconnected.");
                    }
                });

                 // Listen for chain changes
                window.ethereum.on('chainChanged', (chainId) => {
                    console.log("Network changed to:", chainId);
                    // You might want to reload the page or update UI based on chainId
                    // window.location.reload();
                });

            } catch (error) {
                console.error("User rejected connection or other error:", error);
                walletStatus.textContent = "Connection rejected or failed.";
            }
        } else {
            walletStatus.textContent = "MetaMask not detected. Please install it.";
            console.warn("MetaMask is not installed!");
            // Optionally, provide a link to install MetaMask
            // window.open("https://metamask.io/download/", "_blank");
        }
    }

    // Placeholder for Minting functionality
    async function mintNFT() {
        if (!connectedAccount) {
            walletStatus.textContent = "Please connect your wallet first!";
            console.warn("Cannot mint: Wallet not connected.");
            return;
        }

        // In a real dApp, you would interact with your smart contract here.
        // This is a simplified placeholder.
        try {
            // Example: Sending a transaction (replace with your actual contract interaction)
            // const transactionParameters = {
            //     to: 'YOUR_CONTRACT_ADDRESS', // Required (for contract interaction)
            //     from: connectedAccount, // Required
            //     value: '0x0', // Optional, if sending ETH with the transaction
            //     data: '0x...', // Optional, contract method call data
            // };
            // const txHash = await window.ethereum.request({
            //     method: 'eth_sendTransaction',
            //     params: [transactionParameters],
            // });
            // console.log("Minting transaction sent:", txHash);
            // walletStatus.textContent = `Minting in progress! Tx: ${txHash.substring(0, 10)}...`;

            // For now, just simulate success
            walletStatus.textContent = `Minting successful! (Simulated for ${connectedAccount.substring(0, 6)}...)`;
            console.log("Simulated NFT mint for account:", connectedAccount);

        } catch (error) {
            console.error("Minting failed:", error);
            walletStatus.textContent = `Minting failed: ${error.message || error}`;
        }
    }

    // Attach event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    mintNowBtn.addEventListener('click', mintNFT);

    // Initial check for MetaMask on page load
    if (window.ethereum && window.ethereum.isConnected()) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    connectedAccount = accounts[0];
                    walletStatus.textContent = `Connected: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
                    connectWalletBtn.textContent = "Wallet Connected";
                    connectWalletBtn.disabled = true;
                    mintNowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    mintNowBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error("Error checking existing connection:", error);
            });
    } else {
        mintNowBtn.classList.add('opacity-50', 'cursor-not-allowed'); // Disable mint button if no wallet
        mintNowBtn.disabled = true;
    }
});
