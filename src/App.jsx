
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ── helpers ── */
function getDomain(url) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

/* ── data ── */
const ASSET_CLASSES = [
  { name: "Real Estate", count: 8, icon: "🏢", desc: "Residential, commercial and luxury property tokenization with fractional ownership and rental yield distribution" },
  { name: "US Treasuries", count: 5, icon: "🏛", desc: "On-chain access to short-term US government bond yields through regulated tokenized fund structures" },
  { name: "Corporate Credit", count: 4, icon: "📑", desc: "Institutional lending protocols and on-chain credit markets connecting capital with borrowers" },
  { name: "Equity & Securities", count: 7, icon: "📈", desc: "Tokenized company shares, security tokens and regulated digital securities on public blockchains" },
  { name: "Bonds & Debt", count: 4, icon: "🔗", desc: "On-chain corporate bond issuance, structured debt products and fixed income tokenization" },
  { name: "Private Equity & VC", count: 3, icon: "💎", desc: "Tokenized access to private equity funds, venture capital and alternative investments" },
  { name: "Funds & ETFs", count: 5, icon: "📊", desc: "Regulated tokenized fund products bringing traditional asset management structures on-chain" },
  { name: "Commodities", count: 2, icon: "⛏", desc: "Tokenized exposure to physical commodities including precious metals and energy resources" },
];

const VENDORS = [
  { name: "ADDX", url: "https://addx.co", desc: "MAS-licensed private market exchange for tokenized alternative investments.", longDesc: "ADDX operates a MAS-licensed private market exchange in Singapore, providing accredited investors with access to tokenized alternative investments that were previously available only to institutional investors. The platform covers private equity, hedge funds, real estate, and venture capital through tokenized structures that lower minimum investment sizes while maintaining regulatory compliance under Singapore's frameworks.", tags: ["Exchange","MAS","Private Markets","Singapore"], hq: "Singapore", founded: 2017, keyStats: ["MAS-Licensed","Private Markets","Accredited Investors","APAC Leader"], assetClasses: ["Private Equity","Hedge Funds","Real Estate","VC"], chains: ["Ethereum"], tier: "Exchange" },
  { name: "Archax", url: "https://archax.com", desc: "FCA-regulated digital securities exchange, broker and custodian in the UK.", longDesc: "Archax is the most comprehensively regulated digital asset venue in the UK, holding FCA approval as an exchange, broker, and custodian. This triple-licensed status means institutions can issue, trade, and store tokenized securities within a single regulated framework. Archax has partnered with major financial institutions including abrdn.", tags: ["FCA","Exchange","UK","Custodian"], hq: "UK", founded: 2018, keyStats: ["FCA Triple-Licensed","UK Leader","Exchange + Custody","Institutional Partners"], assetClasses: ["Securities","Funds","Bonds"], chains: ["Ethereum","Hedera","Polygon"], tier: "Exchange" },
  { name: "Backed Finance", url: "https://backed.fi", desc: "Tokenized securities tracking real-world assets on public blockchains, EU-compliant.", longDesc: "Backed Finance issues tokenized securities that track real-world assets on public blockchains under EU-compliant frameworks. Operating from Switzerland, Backed creates tokens backed 1:1 by the underlying assets held by regulated custodians. Their approach is permissionless at the token level but compliant at the issuance level, bridging DeFi accessibility with regulatory compliance.", tags: ["Securities","Permissionless","EU","1:1 Backed"], hq: "Switzerland", founded: 2021, keyStats: ["EU-Compliant","Permissionless","1:1 Backed","Swiss Regulated"], assetClasses: ["ETFs","Bonds","Equities"], chains: ["Ethereum","Gnosis","Polygon"], tier: "Institutional" },
  { name: "Centrifuge", url: "https://centrifuge.io", desc: "DeFi protocol for tokenizing real-world credit assets, deeply integrated with MakerDAO.", longDesc: "Centrifuge is the leading DeFi protocol for tokenizing real-world credit, connecting institutional capital with real-world lending opportunities. Deeply integrated with MakerDAO, allowing tokenized credit assets to serve as collateral for DAI generation. Operates its own Substrate-based chain and has processed significant volumes across trade finance, real estate lending, and consumer credit.", tags: ["DeFi","Credit","MakerDAO","Substrate"], hq: "Germany", founded: 2017, keyStats: ["MakerDAO Integrated","DeFi Credit Pioneer","Own Chain","Multi-Pool"], assetClasses: ["Trade Finance","Real Estate Credit","Consumer Lending"], chains: ["Centrifuge Chain","Ethereum"], tier: "DeFi" },
  { name: "DigiShares", url: "https://digishares.io", desc: "White-label tokenization for real estate across 40+ countries with 90+ wallet integrations.", longDesc: "DigiShares provides white-label tokenization infrastructure designed for platform operators who want to launch their own branded real estate tokenization marketplace. The platform supports 40+ countries and integrates with 90+ wallets, targeting the B2B market where real estate developers, fund managers, and marketplace operators want tokenization capabilities without building from scratch.", tags: ["White-Label","Real Estate","Global","B2B"], hq: "Denmark", founded: 2018, keyStats: ["40+ Countries","90+ Wallets","White-Label","B2B Platform"], assetClasses: ["Real Estate","Funds"], chains: ["Ethereum","Polygon"], tier: "Platform" },
  { name: "Figure Markets", url: "https://figuremarkets.com", desc: "Provenance blockchain marketplace for tokenized home equity and securities.", longDesc: "Figure Markets, built on the Provenance blockchain, has pioneered tokenized home equity lending (HELOC). The platform has originated billions in home equity loans processed entirely on blockchain, demonstrating that tokenization can handle high-volume, real-world financial products at scale. Proof that tokenization is not limited to exotic assets but can transform everyday financial products.", tags: ["Provenance","HELOC","Securities","High Volume"], hq: "USA", founded: 2018, keyStats: ["Billions Originated","Own Blockchain","HELOC Pioneer","Scaled Production"], assetClasses: ["Home Equity","Securities","Loans"], chains: ["Provenance"], tier: "Enterprise" },
  { name: "Mantra Chain", url: "https://mantrachain.io", desc: "L1 blockchain designed for tokenized RWAs with regulatory compliance modules.", longDesc: "Mantra Chain is a Layer 1 blockchain built from the ground up for tokenized real-world assets with regulatory compliance as a core feature. Operating from the UAE, strategically positioned in one of the world's most crypto-friendly regulatory environments. The chain includes built-in compliance modules for KYC/AML, permissioned access controls, and regulatory reporting.", tags: ["L1","Compliance","RWA","UAE"], hq: "UAE", founded: 2020, keyStats: ["Compliance L1","UAE-Based","MENA Focus","Built-In KYC"], assetClasses: ["Real Estate","Commodities","Securities"], chains: ["Mantra (Own L1)"], tier: "Infrastructure" },
  { name: "Maple Finance", url: "https://maple.finance", desc: "On-chain institutional capital market protocol for tokenized lending and credit.", longDesc: "Maple Finance operates an on-chain institutional capital market where credit experts (pool delegates) manage lending pools that institutional borrowers access. The protocol has processed billions in institutional loans including to major crypto market makers and trading firms. Represents the intersection of tokenized credit and institutional lending with transparent, on-chain credit markets.", tags: ["Lending","Credit","Institutional","Pool Delegates"], hq: "Australia", founded: 2020, keyStats: ["Institutional Lending","Pool Delegates","On-Chain Credit","Billions Processed"], assetClasses: ["Corporate Credit","Institutional Loans"], chains: ["Ethereum","Solana","Base"], tier: "DeFi" },
  { name: "Ondo Finance", url: "https://ondo.finance", desc: "Institutional-grade tokenized US Treasuries and bonds providing on-chain yield access.", longDesc: "Ondo Finance has become the leading platform for institutional-grade tokenized US Treasuries, bringing traditional fixed income yields on-chain. Their products provide direct exposure to short-term US government bonds through tokenized structures accessible to institutional and qualified investors. The tokenized treasury market now exceeds $3B in 2026 and Ondo is at the center of it.", tags: ["Treasuries","Yield","Institutional","Fixed Income"], hq: "USA", founded: 2021, keyStats: ["Tokenized Treasuries","Institutional-Grade","Rapid Growth","DeFi Integrated"], assetClasses: ["US Treasuries","Bonds","Money Market"], chains: ["Ethereum","Solana","Mantle"], tier: "Institutional" },
  { name: "Plume Network", url: "https://plumenetwork.xyz", desc: "Modular L2 blockchain purpose-built for RWA tokenization and DeFi composability.", longDesc: "Plume Network is building a modular Layer 2 blockchain specifically designed for RWA tokenization with native DeFi composability. Unlike tokenization platforms that sit on top of general-purpose chains, Plume optimizes the entire chain architecture for RWA use cases: compliance modules, identity layers, and DeFi primitives are built into the chain itself. This RWAfi approach positions Plume as the dedicated infrastructure layer.", tags: ["L2","Modular","RWAfi","DeFi Native"], hq: "USA", founded: 2023, keyStats: ["RWA-Dedicated L2","DeFi Composable","Modular Architecture","Growing Ecosystem"], assetClasses: ["Multi-Asset","RWAfi"], chains: ["Plume L2 (Ethereum)"], tier: "Infrastructure" },
  { name: "Polymath / Polymesh", url: "https://polymesh.network", desc: "Purpose-built L1 blockchain for regulated securities with built-in identity and governance.", longDesc: "Polymesh took the radical approach of building an entirely new blockchain specifically for regulated securities rather than building on existing general-purpose chains. The chain has identity, compliance, confidentiality, and governance built into its base layer, eliminating the need for complex smart contract workarounds. Compliance is not an add-on but a fundamental property of every transaction.", tags: ["L1 Chain","Regulated","Securities","Built-In Compliance"], hq: "Canada", founded: 2017, keyStats: ["Purpose-Built L1","Native Compliance","Identity Layer","Governance"], assetClasses: ["Securities","Equity","Debt","Funds"], chains: ["Polymesh (Own L1)"], tier: "Infrastructure" },
  { name: "RealT", url: "https://realt.co", desc: "Fractional real estate on Ethereum with $150M+ tokenized and daily stablecoin dividends.", longDesc: "RealT pioneered fractional real estate tokenization, allowing investors to buy shares in US rental properties with minimums as low as $50. The platform has tokenized $150M+ in real estate and distributes rental income daily as stablecoin dividends directly to token holders' wallets. Each property is held in a dedicated LLC, and tokens represent fractional LLC membership interests.", tags: ["Real Estate","Fractional","DeFi","Daily Yield"], hq: "USA", founded: 2019, keyStats: ["$150M+ Tokenized","Daily Dividends","$50 Minimum","200+ Properties"], assetClasses: ["Residential Real Estate"], chains: ["Ethereum","Gnosis Chain"], tier: "Retail" },
  { name: "Securitize", url: "https://securitize.io", desc: "SEC-registered platform powering BlackRock BUIDL fund with $1B+ on-chain assets, transfer agent and ATS capabilities.", longDesc: "Securitize is the most institutionally connected tokenization platform, operating as a SEC-registered transfer agent with an integrated ATS for secondary trading. The platform gained massive institutional credibility through its partnership with BlackRock on the BUIDL fund, which has accumulated $1B+ in on-chain assets. Handles the full lifecycle: issuance, compliance, cap table management, investor verification, and secondary market trading.", tags: ["SEC Regulated","Transfer Agent","ATS","BlackRock"], hq: "USA", founded: 2017, keyStats: ["$1B+ On-Chain","SEC Registered","BlackRock BUIDL","Transfer Agent"], assetClasses: ["Funds","Securities","Real Estate","Credit"], chains: ["Ethereum","Avalanche","Polygon"], tier: "Enterprise" },
  { name: "StegX", url: "https://stegx.io", desc: "Institutional marketplace for tokenized real estate on Hedera via ERC-7518.", longDesc: "StegX is building an institutional-grade marketplace for tokenized real estate on Hedera, leveraging the ERC-7518 standard in collaboration with Zoniqx. Based in the UAE, StegX targets institutional real estate tokenization in the Gulf region, where regulatory frameworks are actively supporting digital asset innovation. Focuses on high-value commercial and luxury real estate properties.", tags: ["Real Estate","Hedera","Institutional","UAE"], hq: "UAE", founded: 2023, keyStats: ["Hedera-Based","ERC-7518","UAE Market","Institutional RE"], assetClasses: ["Commercial Real Estate","Luxury Properties"], chains: ["Hedera"], tier: "Institutional" },
  { name: "Superstate", url: "https://superstate.co", desc: "Regulated tokenized fund products for institutional on-chain access to traditional assets.", longDesc: "Superstate builds regulated tokenized fund products that bring traditional asset management on-chain. Founded by Robert Leshner (creator of Compound), the company bridges the credibility of DeFi innovation with the rigor of traditional fund regulation. Products provide institutional investors with on-chain access to traditional assets through fully regulated fund structures.", tags: ["Funds","Regulated","Institutional","Compound Founder"], hq: "USA", founded: 2023, keyStats: ["Regulated Funds","DeFi-Native Team","Institutional","Compound Founder"], assetClasses: ["US Treasuries","Money Market","Short-Term Bonds"], chains: ["Ethereum"], tier: "Institutional" },
  { name: "Taurus", url: "https://taurushq.com", desc: "Swiss digital asset infrastructure for banks covering custody, tokenization and trading.", longDesc: "Taurus provides full-stack digital asset infrastructure designed specifically for banks and financial institutions. The Swiss-based company covers custody, tokenization, and trading in an integrated platform that meets banking-grade security and compliance requirements. The bank-first approach means the platform integrates with existing banking infrastructure rather than requiring crypto-native workflows.", tags: ["Swiss","Banks","Full-Stack","Banking-Grade"], hq: "Switzerland", founded: 2018, keyStats: ["Bank-Grade","Swiss Regulated","Full-Stack","Enterprise"], assetClasses: ["Multi-Asset","Securities","Funds"], chains: ["Ethereum","Polygon","Tezos"], tier: "Enterprise" },
  { name: "Tokeny", url: "https://tokeny.com", desc: "Apex Group-acquired platform, $32B+ tokenized, creator of the ERC-3643 compliance standard.", longDesc: "Tokeny created the ERC-3643 token standard, the most widely adopted permissioned token standard in institutional tokenization. The standard has been used to tokenize $32B+ in assets across hundreds of issuances. Acquired by Apex Group, one of the world's largest fund administrators with $3T+ in assets serviced, giving the platform direct distribution into institutional fund infrastructure.", tags: ["Enterprise","ERC-3643","Compliance","Apex Group"], hq: "Luxembourg", founded: 2017, keyStats: ["$32B+ Tokenized","ERC-3643 Creator","Apex Group Acquired","Institutional"], assetClasses: ["Funds","Bonds","Equity","Real Estate"], chains: ["Ethereum","Polygon"], tier: "Enterprise" },
  { name: "Zoniqx", url: "https://www.zoniqx.com", desc: "AI-native tokenization infrastructure with zProtocol (DyCIST/ERC-7518), TALM lifecycle management, $5B+ tokenized across public, private and hybrid chains.", longDesc: "Zoniqx delivers a complete Tokenization Platform as a Service (TPaaS) through its modular suite: zProtocol powers the DyCIST/ERC-7518 token standard for dynamic, compliant, interoperable security tokens. TALM provides full lifecycle management from issuance through redemption. zConnect handles distribution, zCompliance manages regulatory requirements, zPay integrates payment rails, and zIdentity handles investor verification. The platform operates across public chains (Ethereum, Hedera, XRPL), private chains, and hybrid architectures.", tags: ["ERC-7518","TPaaS","Multi-Chain","AI-Native","zProtocol","zConnect"], hq: "USA", founded: 2020, keyStats: ["$5B+ Tokenized","Multi-Chain","ERC-7518 Standard","PwC Partner"], assetClasses: ["Real Estate","Securities","Bonds","Private Equity","Commodities"], chains: ["Ethereum","Hedera","XRPL","Private Chains"], tier: "Enterprise" },
];

/* ── Logo Component ── */
function VendorLogo({ url, name, size = 48 }) {
  const domain = getDomain(url);
  const [src, setSrc] = useState(`https://logo.clearbit.com/${domain}`);
  const [failed, setFailed] = useState(0);
  const fallbacks = [`https://logo.clearbit.com/${domain}`, `https://www.google.com/s2/favicons?domain=${domain}&sz=128`];
  const handleError = () => {
    const n = failed + 1;
    setFailed(n);
    if (n < fallbacks.length) setSrc(fallbacks[n]);
    else setSrc(null);
  };
  if (!src) return (
    <div style={{ width: size, height: size, borderRadius: 14, background: "linear-gradient(145deg, #1a73e8, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.4, fontFamily: "var(--font-display)", flexShrink: 0 }}>{name[0]}</div>
  );
  return <img src={src} alt={name} onError={handleError} style={{ width: size, height: size, borderRadius: 14, objectFit: "contain", background: "#fff", border: "1px solid #e4e8ee", flexShrink: 0 }} />;
}

/* ── 3D Tilt Card ── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
    el.style.boxShadow = `${-x * 20}px ${y * 20}px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)`;
  }, []);
  const handleLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
  }, []);
  return <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease", transformStyle: "preserve-3d", willChange: "transform", ...style }}>{children}</div>;
}

/* ── Animated Counter ── */
function Counter({ end, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        let c = 0; const step = end / 35;
        const iv = setInterval(() => { c += step; if (c >= end) { setVal(end); clearInterval(iv); } else setVal(Math.floor(c)); }, 40);
      }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ── Scroll Reveal ── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

/* ── Main Page ── */
export default function TokenizationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [activeAssetClass, setActiveAssetClass] = useState(0);
  const canvasRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let anim;
    const resize = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; ctx.scale(2, 2); };
    resize();
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26,115,232,0.2)"; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(26,115,232,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", resize); };
  }, []);

  const tiers = ["All", "Enterprise", "Institutional", "DeFi", "Infrastructure", "Platform", "Retail", "Exchange"];
  const tierColors = { Enterprise: "#1a73e8", Institutional: "#0891b2", DeFi: "#7c3aed", Infrastructure: "#ea580c", Platform: "#059669", Retail: "#d97706", Exchange: "#4338ca" };

  const filtered = useMemo(() => {
    let v = [...VENDORS];
    if (filterTier !== "All") v = v.filter(x => x.tier === filterTier);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      v = v.filter(x => x.name.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q) || x.tags.some(t => t.toLowerCase().includes(q)) || x.hq.toLowerCase().includes(q) || x.assetClasses.some(a => a.toLowerCase().includes(q)));
    }
    return v;
  }, [searchQuery, filterTier]);

  const expandedData = expandedVendor ? VENDORS.find(v => v.name === expandedVendor) : null;

  return (
    <div style={{ "--font-display": "'Clash Display', 'Switzer', system-ui, sans-serif", "--font-body": "'Switzer', 'General Sans', system-ui, sans-serif", "--font-mono": "'JetBrains Mono', monospace", "--blue": "#1a73e8", "--blue-light": "#4FA8D8", "--navy": "#0b1526", "--navy-mid": "#0f1d30", "--slate": "#64748b", fontFamily: "var(--font-body)", background: "#fafbfd", color: "#0f172a", minHeight: "100vh" }}>
      <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=switzer@400,500,600,700&f[]=general-sans@400,500,600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes heroGlow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
        @keyframes gridPulse { 0%,100% { opacity: 0.03; } 50% { opacity: 0.06; } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes borderGlow { 0%,100% { border-color: rgba(79,168,216,0.1); } 50% { border-color: rgba(79,168,216,0.3); } }
        ::selection { background: #1a73e830; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
      `}</style>

      {/* ═══ HERO ═══ */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(165deg, #eef4ff, #dbeafe, #eff6ff)", minHeight: "520px" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "-15%", right: "5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,115,232,0.08), transparent 65%)", animation: "heroGlow 8s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,168,216,0.06), transparent 65%)", animation: "heroGlow 12s ease-in-out infinite 3s", pointerEvents: "none" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(26,115,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,115,232,0.04) 1px, transparent 1px)", backgroundSize: "80px 80px", animation: "gridPulse 8s ease infinite", pointerEvents: "none" }} />
        {/* Diagonal accent line */}
        <div style={{ position: "absolute", top: 0, right: "20%", width: "1px", height: "100%", background: "linear-gradient(to bottom, transparent, rgba(26,115,232,0.1), transparent)", transform: "rotate(15deg)", transformOrigin: "top", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "48px 32px 60px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
            <a href="https://www.fluidrwa.com" style={{ color: "#64748b", textDecoration: "none", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px" }}>FLUIDRWA</a>
            <span style={{ color: "#cbd5e1", fontSize: "8px" }}>●</span>
            <a href="https://www.fluidrwa.com/web3vendorecosystem" style={{ color: "#64748b", textDecoration: "none", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px" }}>ECOSYSTEM</a>
            <span style={{ color: "#cbd5e1", fontSize: "8px" }}>●</span>
            <span style={{ color: "#1a73e8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>TOKENIZATION</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "60px", alignItems: "end" }}>
            <div>
              {/* Category tag */}
              <div style={{ display: "inline-block", marginBottom: "20px", padding: "8px 20px", background: "#fff", border: "1px solid #1a73e820", borderRadius: "100px", boxShadow: "0 2px 12px rgba(26,115,232,0.06)" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#1a73e8", textTransform: "uppercase", letterSpacing: "3px" }}>◈ Category Deep Dive</span>
              </div>
              <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 700, lineHeight: 0.95, margin: "0 0 20px", fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
                <span style={{ color: "#0f172a" }}>RWA Tokenization</span><br />
                <span style={{ color: "#1a73e8" }}>Solution Providers</span>
              </h1>
              <p style={{ fontSize: "16px", color: "#475569", maxWidth: "520px", lineHeight: 1.65, margin: "0 0 36px", fontWeight: 400 }}>
                End-to-end platforms converting real-world assets into blockchain-native digital tokens. The foundation layer of every tokenized offering, from US Treasuries to commercial real estate.
              </p>
            </div>

            {/* Stats block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#1a73e815", borderRadius: "20px", overflow: "hidden", minWidth: "280px", boxShadow: "0 4px 20px rgba(26,115,232,0.06)" }}>
              {[
                { label: "Vendors", val: 18, suf: "" },
                { label: "Combined AUM", val: 40, suf: "B+", pre: "$" },
                { label: "Countries", val: 14, suf: "" },
                { label: "Chains", val: 15, suf: "+" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", padding: "24px 20px" }}>
                  <div style={{ fontSize: "30px", fontWeight: 700, color: "#1a73e8", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    <Counter end={s.val} suffix={s.suf} prefix={s.pre || ""} />
                  </div>
                  <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2.5px", fontWeight: 800, marginTop: "6px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker / marquee */}
        <div style={{ borderTop: "1px solid #1a73e810", background: "#f0f6ff", padding: "10px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", animation: "marquee 40s linear infinite", width: "max-content" }}>
            {[...VENDORS, ...VENDORS].map((v, i) => (
              <span key={i} style={{ padding: "0 32px", fontSize: "11px", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}>
                {v.name.toUpperCase()} <span style={{ color: "#cbd5e1" }}>|</span> {v.hq} <span style={{ color: "#cbd5e1" }}>|</span> {v.founded}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ ASSET CLASSES SECTION ═══ */}
      <Reveal>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 32px 40px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "9px", color: "var(--blue)", textTransform: "uppercase", letterSpacing: "4px", fontWeight: 800, marginBottom: "8px" }}>Coverage</div>
              <h2 style={{ fontSize: "32px", fontWeight: 700, margin: 0, letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>Asset Classes Tokenized</h2>
            </div>
            <span style={{ fontSize: "11px", color: "var(--slate)", fontFamily: "var(--font-mono)" }}>{ASSET_CLASSES.length} categories</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" }}>
            {ASSET_CLASSES.map((ac, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <TiltCard>
                  <div onClick={() => setActiveAssetClass(i)}
                    style={{
                      padding: "24px", borderRadius: "16px", cursor: "pointer",
                      background: activeAssetClass === i ? "linear-gradient(145deg, #1a73e8, #2563eb)" : "#fff",
                      border: `1px solid ${activeAssetClass === i ? "#1a73e8" : "#e8ecf1"}`,
                      transition: "background 0.3s, border-color 0.3s, color 0.3s",
                    }}>
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>{ac.icon}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: activeAssetClass === i ? "#fff" : "#0f172a", marginBottom: "4px", letterSpacing: "-0.01em" }}>{ac.name}</div>
                    <div style={{ fontSize: "11px", color: activeAssetClass === i ? "#ffffffcc" : "#94a3b8", lineHeight: 1.5, marginBottom: "10px" }}>{ac.desc}</div>
                    <div style={{ fontSize: "10px", color: activeAssetClass === i ? "#ffffffee" : "var(--blue)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{ac.count} platforms</div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ═══ VENDOR DIRECTORY ═══ */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 32px 0" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontSize: "9px", color: "var(--blue)", textTransform: "uppercase", letterSpacing: "4px", fontWeight: 800, marginBottom: "8px" }}>Directory</div>
              <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>All Platforms</h2>
            </div>
          </div>
        </Reveal>

        {/* Sticky filters */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fafbfd", padding: "16px 0", borderBottom: "1px solid #e8ecf1", marginBottom: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {tiers.map(t => (
                <button key={t} onClick={() => { setFilterTier(t); setExpandedVendor(null); }}
                  style={{
                    padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
                    fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-body)", transition: "all 0.2s",
                    background: filterTier === t ? "#1a73e8" : "#fff",
                    border: `1px solid ${filterTier === t ? "#1a73e8" : "#e2e8f0"}`,
                    color: filterTier === t ? "#fff" : "#64748b",
                  }}>
                  {t === "All" ? `All (${VENDORS.length})` : t}
                </button>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setExpandedVendor(null); }}
                placeholder="Search vendors, chains, asset classes..."
                style={{ padding: "9px 14px 9px 36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "12px", outline: "none", fontFamily: "var(--font-body)", width: "260px", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>⌕</span>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: "16px", color: "#94a3b8", fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
          {filtered.length} VENDOR{filtered.length !== 1 ? "S" : ""}
          {filterTier !== "All" && <span> / <span style={{ color: tierColors[filterTier] }}>{filterTier.toUpperCase()}</span></span>}
        </div>

        {/* Vendor grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "10px", paddingBottom: "40px" }}>
          {filtered.map((v, i) => {
            const tc = tierColors[v.tier] || "#64748b";
            const isExpanded = expandedVendor === v.name;

            return (
              <Reveal key={v.name} delay={i * 0.03}>
                <div style={{ gridColumn: isExpanded ? "1 / -1" : undefined }}>
                  <TiltCard style={isExpanded ? { transform: "none" } : undefined}>
                    <div onClick={() => setExpandedVendor(isExpanded ? null : v.name)}
                      style={{
                        background: "#fff", border: `1px solid ${isExpanded ? tc + "30" : "#e8ecf1"}`,
                        borderRadius: "16px", cursor: "pointer", overflow: "hidden",
                        borderLeft: isExpanded ? `3px solid ${tc}` : undefined,
                      }}>
                      <div style={{ padding: "22px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <VendorLogo url={v.url} name={v.name} size={48} />
                            <div>
                              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{v.name}</h3>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "5px" }}>
                                <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>{v.hq}</span>
                                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#cbd5e1" }} />
                                <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>{v.founded}</span>
                                <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "6px", background: tc + "0c", color: tc, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>{v.tier}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8", transition: "transform 0.3s", transform: isExpanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>▼</div>
                        </div>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: isExpanded ? 99 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {isExpanded ? v.longDesc : v.desc}
                        </p>
                        {/* Asset classes inline */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                          {v.assetClasses.slice(0, isExpanded ? 99 : 3).map((a, j) => (
                            <span key={j} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "6px", background: "#0f172a06", color: "#334155", fontWeight: 600, border: "1px solid #0f172a08" }}>{a}</span>
                          ))}
                          {!isExpanded && v.assetClasses.length > 3 && <span style={{ fontSize: "10px", color: "#94a3b8", padding: "3px 6px" }}>+{v.assetClasses.length - 3}</span>}
                        </div>
                        {!isExpanded && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {v.keyStats.slice(0, 3).map((s, j) => (
                              <span key={j} style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "100px", background: tc + "08", color: tc, fontWeight: 700 }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TiltCard>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ margin: "6px 0 0", borderRadius: "16px", overflow: "hidden", border: "1px solid #e8ecf1", background: "#fff" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "#e8ecf1" }}>
                        <div style={{ background: "#fafbfd", padding: "24px" }}>
                          <div style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 800, marginBottom: "10px" }}>Key Highlights</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {v.keyStats.map((s, j) => (
                              <span key={j} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "8px", background: tc + "0a", border: `1px solid ${tc}15`, color: tc, fontWeight: 700 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ background: "#fafbfd", padding: "24px" }}>
                          <div style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 800, marginBottom: "10px" }}>Asset Classes</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {v.assetClasses.map((a, j) => (
                              <span key={j} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "8px", background: "#f1f5f9", color: "#334155", fontWeight: 600 }}>{a}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ background: "#fafbfd", padding: "24px" }}>
                          <div style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 800, marginBottom: "10px" }}>Supported Chains</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {v.chains.map((c, j) => (
                              <span key={j} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "8px", background: "#0f172a08", border: "1px solid #0f172a0c", color: "#334155", fontWeight: 600 }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {v.tags.map((t, j) => (
                            <span key={j} style={{ fontSize: "9px", padding: "3px 8px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #e8ecf1", color: "#64748b", fontWeight: 500 }}>{t}</span>
                          ))}
                        </div>
                        <a href={v.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "12px", background: "#1a73e8", color: "#fff", fontWeight: 700, fontSize: "13px", textDecoration: "none", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = tc; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${tc}30`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#1a73e8"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                          Visit {v.name} <span style={{ fontSize: "16px" }}>↗</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>No vendors match your criteria.</div>}
      </div>

      {/* ═══ SELECTION GUIDE ═══ */}
      <Reveal>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 32px 60px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8ecf1", overflow: "hidden", boxShadow: "0 4px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ padding: "48px 48px 20px" }}>
              <div style={{ fontSize: "9px", color: "var(--blue)", textTransform: "uppercase", letterSpacing: "4px", fontWeight: 800, marginBottom: "12px" }}>Selection Framework</div>
              <h2 style={{ fontSize: "30px", fontWeight: 700, margin: "0 0 24px", letterSpacing: "-0.03em", fontFamily: "var(--font-display)", lineHeight: 1.15 }}>How to Evaluate a Tokenization Platform</h2>
            </div>
            <div style={{ padding: "0 48px 48px" }}>
              {[
                { q: "What asset class are you tokenizing?", a: "Real estate platforms (RealT, DigiShares, StegX) differ fundamentally from treasury platforms (Ondo, Superstate) and credit protocols (Centrifuge, Maple). Match the specialization to your asset." },
                { q: "Which jurisdictions do your investors sit in?", a: "SEC-regulated platforms (Securitize, tZERO) serve US investors. MAS-licensed venues (ADDX) serve APAC. FCA-approved venues (Archax) serve UK. EU-compliant issuers (Tokeny, Backed Finance) serve Europe under MiCA." },
                { q: "Do you need integrated secondary markets?", a: "Securitize has its own ATS. ADDX and Archax are exchanges. Zoniqx connects to multiple distribution channels via zConnect. Standalone platforms require you to source your own liquidity venue." },
                { q: "Is multi-chain important?", a: "Zoniqx operates across Ethereum, Hedera, XRPL, and private chains. Securitize runs on Ethereum, Avalanche, and Polygon. Purpose-built chains (Polymesh, Plume, Mantra) lock you into their ecosystem but offer deeper integration." },
                { q: "What is your compliance budget?", a: "Enterprise platforms (Zoniqx, Securitize, Tokeny) require meaningful implementation budgets. Self-service platforms offer lower cost but less customization. Match your vendor tier to your project economics." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div style={{ display: "flex", gap: "20px", padding: "20px 0", borderBottom: i < 4 ? "1px solid #f1f5f9" : "none", alignItems: "flex-start" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "14px", fontFamily: "var(--font-display)", flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontSize: "14px", letterSpacing: "-0.01em" }}>{item.q}</div>
                      <div style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.65 }}>{item.a}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ═══ CTA ═══ */}
      <Reveal>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 60px" }}>
          <div style={{ textAlign: "center", padding: "72px 32px", background: "linear-gradient(145deg, #dbeafe, #eff6ff, #e0ecff)", borderRadius: "24px", position: "relative", overflow: "hidden", border: "1px solid #1a73e810" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(26,115,232,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(26,115,232,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,115,232,0.05), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 700, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em", fontFamily: "var(--font-display)" }}>Get Your Platform Listed</h2>
              <p style={{ color: "#475569", fontSize: "15px", maxWidth: "460px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                Join {VENDORS.length} tokenization providers in the most comprehensive RWA vendor directory. Premium and featured placements available.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="https://www.fluidrwa.com/"
                  style={{ padding: "14px 36px", borderRadius: "12px", background: "#1a73e8", color: "#fff", fontWeight: 700, fontSize: "14px", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 20px rgba(26,115,232,0.25)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(26,115,232,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,115,232,0.25)"; }}>
                  Request Listing
                </a>
                <a href="https://www.fluidrwa.com/web3vendorecosystem"
                  style={{ padding: "14px 36px", borderRadius: "12px", background: "#fff", border: "1px solid #1a73e825", color: "#1a73e8", fontWeight: 600, fontSize: "14px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#1a73e850"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1a73e825"}>
                  Browse All 257+ Vendors ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 16px 40px", borderTop: "1px solid #e8ecf1", maxWidth: "1280px", margin: "0 auto" }}>
        <p style={{ color: "#94a3b8", fontSize: "11px", margin: 0 }}>
          © 2026 <a href="https://www.fluidrwa.com" style={{ color: "#94a3b8", textDecoration: "none" }}>FluidRWA</a>. All Rights Reserved. | <a href="https://www.fluidrwa.com/web3vendorecosystem" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Back to Full Ecosystem</a>
        </p>
      </footer>
    </div>
  );
}
