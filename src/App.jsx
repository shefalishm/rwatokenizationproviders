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
  { name: "ADDX", url: "https://addx.co", serviceType: "Marketplace & Exchange", bestFor: "Issuers who need a licensed exchange to list and trade tokenized private market assets in APAC", desc: "Helps you list and sell tokenized alternative investments (PE, hedge funds, real estate, VC) to accredited investors through a MAS-licensed exchange in Singapore. If you have already tokenized and need a regulated venue to distribute and trade in Asia, ADDX is the marketplace.", longDesc: "ADDX solves the distribution problem for tokenized private market assets. If you have tokenized an asset but need a regulated venue where accredited investors can discover, buy, and trade it, ADDX provides that marketplace. MAS-licensed in Singapore, it handles investor onboarding, KYC, and secondary trading. You bring the tokenized asset, ADDX provides the investor base and regulatory wrapper. Covers private equity, hedge funds, real estate, and VC.", tags: ["Exchange","MAS","Private Markets","Distribution"], hq: "Singapore", founded: 2017, keyStats: ["MAS-Licensed","Private Markets","Accredited Investors","APAC"], assetClasses: ["Private Equity","Hedge Funds","Real Estate","VC"], chains: ["Ethereum"], tier: "Marketplace" },
  { name: "Archax", url: "https://archax.com", serviceType: "Marketplace & Exchange", bestFor: "Issuers needing a fully regulated UK venue to issue, trade, and custody tokenized securities", desc: "Provides a one-stop regulated venue in the UK where you can issue, trade, and store tokenized securities. FCA-licensed as exchange, broker, and custodian. If you need to reach UK and European institutional investors with a tokenized offering, Archax handles the full chain.", longDesc: "Archax removes the need to coordinate separate exchange, brokerage, and custody providers in the UK. With triple FCA licensing, it covers issuance, secondary trading, and storage in one regulated framework. If you are a fund manager or issuer targeting UK/European institutional capital with tokenized securities, bonds, or funds, Archax provides the complete regulated infrastructure.", tags: ["FCA","Exchange","Custody","UK"], hq: "UK", founded: 2018, keyStats: ["FCA Triple-Licensed","UK Leader","Exchange + Custody","Institutional"], assetClasses: ["Securities","Funds","Bonds"], chains: ["Ethereum","Hedera","Polygon"], tier: "Marketplace" },
  { name: "Backed Finance", url: "https://backed.fi", serviceType: "Token Issuance", bestFor: "DeFi protocols and institutions wanting EU-compliant tokenized securities that anyone can hold on-chain", desc: "Issues tokenized securities (ETFs, bonds, equities) that trade freely on public blockchains while the issuance itself is EU-compliant and 1:1 backed. If you want permissionless on-chain exposure to traditional assets without KYC at the holder level, Backed creates those tokens.", longDesc: "Backed Finance solves a specific problem: how to put traditional securities on-chain in a way that is compliant at issuance but permissionless at the holder level. They issue tokens from Switzerland under EU frameworks, backed 1:1 by real assets held by regulated custodians. DeFi protocols can integrate these tokens without requiring their users to KYC. Useful for building on-chain structured products or providing DeFi liquidity pools with real-world yield.", tags: ["Permissionless","EU-Compliant","1:1 Backed","DeFi-Friendly"], hq: "Switzerland", founded: 2021, keyStats: ["EU-Compliant","Permissionless","1:1 Backed","Swiss"], assetClasses: ["ETFs","Bonds","Equities"], chains: ["Ethereum","Gnosis","Polygon"], tier: "Issuance" },
  { name: "Centrifuge", url: "https://centrifuge.io", serviceType: "Credit & Lending Protocol", bestFor: "Lenders and borrowers who want to tokenize real-world loans and access DeFi capital pools", desc: "Connects real-world borrowers (trade finance, real estate loans, consumer credit) with on-chain capital from DeFi. If you are a lending company that wants to raise capital by tokenizing your loan book and tapping into DeFi liquidity, Centrifuge is the protocol.", longDesc: "Centrifuge is not a generic tokenization platform. It specifically solves capital access for real-world lenders. If you originate loans (trade finance, real estate, consumer credit) and want to raise capital by tokenizing those loans and connecting to DeFi pools (including MakerDAO), Centrifuge provides the protocol, the chain, and the investor base. Institutional investors use Centrifuge to deploy capital into real-world credit with on-chain transparency.", tags: ["DeFi","Credit","MakerDAO","Lending"], hq: "Germany", founded: 2017, keyStats: ["MakerDAO Integrated","DeFi Credit Pioneer","Own Chain","Multi-Pool"], assetClasses: ["Trade Finance","Real Estate Credit","Consumer Lending"], chains: ["Centrifuge Chain","Ethereum"], tier: "Protocol" },
  { name: "DigiShares", url: "https://digishares.io", serviceType: "White-Label Platform", bestFor: "Real estate companies and marketplace operators who want to launch their own branded tokenization platform", desc: "Gives you a ready-made, white-label tokenization platform so you can launch your own branded real estate marketplace without building from scratch. Supports 40+ countries and 90+ wallet integrations. You focus on sourcing deals, DigiShares handles the tech.", longDesc: "DigiShares is for companies that want to be the tokenization platform, not just use one. If you are a real estate developer, fund manager, or marketplace operator wanting to launch your own branded tokenization marketplace, DigiShares provides the complete white-label infrastructure: token issuance, investor onboarding, compliance, and a marketplace interface. You bring the brand and the deals, they provide the technology stack.", tags: ["White-Label","B2B","Marketplace","Self-Branded"], hq: "Denmark", founded: 2018, keyStats: ["40+ Countries","90+ Wallets","White-Label","B2B"], assetClasses: ["Real Estate","Funds"], chains: ["Ethereum","Polygon"], tier: "Platform" },
  { name: "Figure Markets", url: "https://figuremarkets.com", serviceType: "Lending & Issuance Platform", bestFor: "Financial institutions looking to tokenize high-volume lending products like home equity loans at scale", desc: "Tokenizes home equity loans (HELOCs) and securities at massive scale on its own Provenance blockchain. If you are a financial institution that originates loans and wants to process them entirely on-chain for speed, transparency, and cost reduction, Figure has proven this works at billions in volume.", longDesc: "Figure Markets proved that tokenization is not just for exotic assets. It processes billions in home equity loans entirely on the Provenance blockchain, reducing settlement from weeks to days. If you are a bank, lender, or mortgage company wanting to move your lending operations on-chain for operational efficiency, Figure provides the blockchain, the marketplace, and the proven volume. This is tokenization as infrastructure, not tokenization as a product.", tags: ["HELOC","High Volume","Provenance","Lending"], hq: "USA", founded: 2018, keyStats: ["Billions Originated","Own Blockchain","HELOC Pioneer","Scaled"], assetClasses: ["Home Equity","Securities","Loans"], chains: ["Provenance"], tier: "Enterprise" },
  { name: "Mantra Chain", url: "https://mantrachain.io", serviceType: "Blockchain Infrastructure (L1)", bestFor: "Builders who need a compliance-ready L1 blockchain designed for RWA tokenization in MENA/Asia", desc: "Provides a Layer 1 blockchain with compliance built in (KYC/AML modules, permissioned access, regulatory reporting). If you are building a tokenization product and need a chain where regulatory compliance is a native feature rather than an afterthought, Mantra is the infrastructure layer.", longDesc: "Mantra Chain is not a tokenization platform you use to tokenize an asset. It is the blockchain you build your tokenization product on. If you are a developer, fintech, or institution that needs a chain with built-in compliance (KYC/AML, permissioned access, regulatory reporting), Mantra provides that infrastructure. Based in UAE, it is particularly well-positioned for MENA and Asian markets where regulators are actively supporting digital asset frameworks.", tags: ["L1 Chain","Compliance Built-In","MENA","Developer Infrastructure"], hq: "UAE", founded: 2020, keyStats: ["Compliance L1","UAE-Based","MENA Focus","Built-In KYC"], assetClasses: ["Real Estate","Commodities","Securities"], chains: ["Mantra (Own L1)"], tier: "Infrastructure" },
  { name: "Maple Finance", url: "https://maple.finance", serviceType: "Credit & Lending Protocol", bestFor: "Institutional borrowers seeking on-chain credit and lenders wanting transparent, tokenized lending exposure", desc: "Runs an on-chain institutional lending market. If you are a crypto company needing to borrow against your business, or an institutional lender wanting transparent, on-chain credit exposure, Maple connects you through managed lending pools with credit expert oversight.", longDesc: "Maple Finance operates on-chain credit markets for institutional borrowers and lenders. Pool delegates (credit experts) assess borrowers and manage lending pools. If you are a trading firm, market maker, or crypto company needing institutional credit, Maple is where you borrow. If you are an institutional lender wanting transparent on-chain credit exposure with professional risk management, Maple is where you deploy capital. Billions processed in institutional loans.", tags: ["Institutional Lending","Pool Delegates","On-Chain Credit","Borrowing"], hq: "Australia", founded: 2020, keyStats: ["Institutional Lending","Pool Delegates","Billions Processed","Credit Markets"], assetClasses: ["Corporate Credit","Institutional Loans"], chains: ["Ethereum","Solana","Base"], tier: "Protocol" },
  { name: "Ondo Finance", url: "https://ondo.finance", serviceType: "Yield & Treasury Tokenization", bestFor: "Institutions and DeFi protocols wanting on-chain exposure to US Treasury yields without off-chain complexity", desc: "Gives you on-chain access to US Treasury yields. If you are an institution, DAO treasury, or DeFi protocol that wants to earn government bond yields without leaving the blockchain, Ondo tokenizes Treasuries into products you can hold and integrate.", longDesc: "Ondo Finance solves one problem clearly: getting US Treasury yields on-chain. If you are a DAO with idle stablecoins, an institution wanting blockchain-native yield, or a DeFi protocol needing a stable yield source, Ondo tokenizes US Treasuries and bonds into on-chain products. You deposit, you earn Treasury yields, the complexity of buying government bonds is abstracted away. Central to the $3B+ tokenized treasury market.", tags: ["US Treasuries","On-Chain Yield","Institutional","DeFi Yield"], hq: "USA", founded: 2021, keyStats: ["Tokenized Treasuries","Institutional-Grade","Rapid Growth","DeFi Integrated"], assetClasses: ["US Treasuries","Bonds","Money Market"], chains: ["Ethereum","Solana","Mantle"], tier: "Yield" },
  { name: "Plume Network", url: "https://plumenetwork.xyz", serviceType: "Blockchain Infrastructure (L2)", bestFor: "Developers building RWA applications who need a chain with native compliance, identity, and DeFi composability", desc: "Provides a dedicated Layer 2 blockchain where RWA applications can be built with compliance, identity, and DeFi composability as native features. If you are a developer building a tokenization app, lending protocol, or RWA marketplace and want infrastructure purpose-built for real-world assets (not repurposed from a general L2), Plume is the chain.", longDesc: "Plume Network is not a platform that tokenizes your asset. It is the blockchain you build your RWA product on. Unlike general-purpose L2s, Plume optimizes its entire architecture for real-world asset use cases: compliance modules, identity layers, and DeFi primitives are native to the chain. Developers building tokenization platforms, RWA lending protocols, or asset marketplaces get infrastructure designed for their specific needs rather than adapting a general-purpose chain. Also useful for existing tokenized assets that want DeFi composability (RWAfi).", tags: ["L2 Chain","Developer Infrastructure","RWAfi","DeFi Composable"], hq: "USA", founded: 2023, keyStats: ["RWA-Dedicated L2","DeFi Composable","Modular","Growing Ecosystem"], assetClasses: ["Multi-Asset","RWAfi","Developer Platform"], chains: ["Plume L2 (Ethereum)"], tier: "Infrastructure" },
  { name: "Polymath / Polymesh", url: "https://polymesh.network", serviceType: "Blockchain Infrastructure (L1)", bestFor: "Issuers of regulated securities who need a blockchain where compliance is built into every transaction", desc: "A purpose-built blockchain for regulated securities. If you are issuing tokens that must comply with securities law and you do not want to bolt compliance onto a general-purpose chain, Polymesh has identity, compliance, and governance as base-layer features. Every transaction is natively compliant.", longDesc: "Polymesh took the position that regulated securities should not run on general-purpose blockchains. Instead of adding compliance as smart contract layers on top of Ethereum, Polymesh built identity, compliance, confidentiality, and governance directly into the chain. If you are issuing equity, debt, or fund tokens under securities regulation and need provable compliance at the chain level (not the application level), Polymesh is the infrastructure choice. The trade-off: you are locked into the Polymesh ecosystem.", tags: ["L1 Chain","Native Compliance","Regulated Securities","Identity Layer"], hq: "Canada", founded: 2017, keyStats: ["Purpose-Built L1","Native Compliance","Identity Layer","Governance"], assetClasses: ["Securities","Equity","Debt","Funds"], chains: ["Polymesh (Own L1)"], tier: "Infrastructure" },
  { name: "RealT", url: "https://realt.co", serviceType: "Fractional Real Estate Platform", bestFor: "Retail investors wanting to buy fractional ownership in US rental properties and earn daily stablecoin income", desc: "Lets you buy fractional ownership in US rental properties starting at $50. You earn daily stablecoin dividends from rental income directly to your wallet. If you want passive real estate income without buying a whole property, RealT handles the tokenization, property management, and rent distribution.", longDesc: "RealT is the simplest answer to 'how do I invest in real estate with crypto?' You browse properties, buy token fractions (starting at $50), and receive daily stablecoin dividends from rental income directly to your wallet. Each property is held in a dedicated LLC, and your tokens represent fractional LLC membership interests. RealT handles everything: property acquisition, management, tenant relations, maintenance, and rent distribution. $150M+ tokenized across 200+ properties.", tags: ["Fractional Ownership","Daily Dividends","$50 Minimum","Rental Income"], hq: "USA", founded: 2019, keyStats: ["$150M+ Tokenized","Daily Dividends","$50 Minimum","200+ Properties"], assetClasses: ["Residential Real Estate"], chains: ["Ethereum","Gnosis Chain"], tier: "Retail" },
  { name: "Securitize", url: "https://securitize.io", serviceType: "Full-Lifecycle Issuance Platform", bestFor: "Fund managers and issuers who need SEC-compliant tokenization with built-in secondary market trading", desc: "Handles everything from creating your tokenized security to trading it on a secondary market, all under SEC regulation. If you are a fund manager or asset issuer in the US who needs a regulated, end-to-end platform (issuance, compliance, cap table, investor verification, secondary trading), Securitize is the institutional standard. Powers BlackRock's BUIDL fund.", longDesc: "Securitize is the most vertically integrated tokenization platform. It operates as an SEC-registered transfer agent with its own ATS (Alternative Trading System) for secondary trading. This means you can issue a tokenized security, manage your cap table, verify investors, maintain compliance, and enable secondary market trading all within one platform under one regulatory umbrella. The BlackRock BUIDL fund ($1B+ on-chain) runs on Securitize, which is the strongest institutional endorsement in the market.", tags: ["SEC Regulated","Transfer Agent","ATS","BlackRock BUIDL"], hq: "USA", founded: 2017, keyStats: ["$1B+ On-Chain","SEC Registered","BlackRock BUIDL","Full Lifecycle"], assetClasses: ["Funds","Securities","Real Estate","Credit"], chains: ["Ethereum","Avalanche","Polygon"], tier: "Enterprise" },
  { name: "StegX", url: "https://stegx.io", serviceType: "Real Estate Tokenization Marketplace", bestFor: "Institutional real estate investors and developers in the Gulf region wanting to tokenize high-value properties on Hedera", desc: "Tokenizes institutional-grade commercial and luxury real estate in the Gulf region using Hedera blockchain and the ERC-7518 standard. If you are a real estate developer or institutional investor in the UAE/MENA wanting to fractionalize and distribute high-value properties on-chain, StegX provides the marketplace.", longDesc: "StegX targets a specific niche: institutional real estate tokenization in the Gulf region. Built on Hedera (known for enterprise adoption and low fees) using the ERC-7518 standard in collaboration with Zoniqx, StegX provides the marketplace where developers can tokenize commercial and luxury properties and institutional investors can access fractional ownership. If you have a $50M+ property in Dubai or Abu Dhabi and want to fractionalize it for a broader investor base, StegX is built for that use case.", tags: ["Gulf Region","Hedera","Institutional RE","ERC-7518"], hq: "UAE", founded: 2023, keyStats: ["Hedera-Based","ERC-7518","UAE Market","Institutional RE"], assetClasses: ["Commercial Real Estate","Luxury Properties"], chains: ["Hedera"], tier: "Marketplace" },
  { name: "Superstate", url: "https://superstate.co", serviceType: "Regulated Fund Tokenization", bestFor: "Institutional investors wanting regulated, on-chain fund products for Treasury and money market exposure", desc: "Creates regulated tokenized fund products that give institutional investors on-chain access to US Treasuries and money markets. If you want the yield of traditional fixed income with the composability of blockchain, through a fully regulated fund structure (not a DeFi protocol), Superstate bridges that gap.", longDesc: "Superstate builds regulated tokenized funds. Founded by Robert Leshner (creator of Compound), it bridges DeFi innovation with traditional fund regulation. Unlike DeFi yield protocols, Superstate products are fully regulated fund structures, meaning institutional investors with compliance requirements can participate. If you are a family office, RIA, or institutional allocator wanting Treasury yield on-chain through a structure your compliance team will approve, Superstate is the answer.", tags: ["Regulated Funds","Institutional","Compound Founder","Compliant Yield"], hq: "USA", founded: 2023, keyStats: ["Regulated Funds","DeFi-Native Team","Institutional","Compound Founder"], assetClasses: ["US Treasuries","Money Market","Short-Term Bonds"], chains: ["Ethereum"], tier: "Yield" },
  { name: "Taurus", url: "https://taurushq.com", serviceType: "Bank Infrastructure Platform", bestFor: "Banks and financial institutions wanting to add tokenization, custody, and trading to their existing systems", desc: "Gives banks a complete digital asset infrastructure stack (custody + tokenization + trading) that integrates with their existing banking systems. If you are a bank wanting to offer tokenized securities to your clients without building crypto infrastructure from scratch, Taurus provides the bank-grade platform.", longDesc: "Taurus is built for banks, not crypto startups. If you are a traditional bank or financial institution wanting to add digital asset capabilities (tokenization, custody, trading) without rebuilding your infrastructure, Taurus provides a full-stack platform that meets banking-grade security and compliance requirements. It integrates with existing banking workflows rather than requiring crypto-native processes. Swiss-regulated and trusted by European banks.", tags: ["Bank Infrastructure","Swiss","Full-Stack","Banking-Grade"], hq: "Switzerland", founded: 2018, keyStats: ["Bank-Grade","Swiss Regulated","Full-Stack","Enterprise"], assetClasses: ["Multi-Asset","Securities","Funds"], chains: ["Ethereum","Polygon","Tezos"], tier: "Enterprise" },
  { name: "Tokeny", url: "https://tokeny.com", serviceType: "Compliance & Issuance Platform", bestFor: "Fund managers and enterprises wanting institutional-grade tokenization with the most adopted compliance standard (ERC-3643)", desc: "Provides the compliance infrastructure for tokenized securities using ERC-3643, the most widely adopted permissioned token standard ($32B+ tokenized). Acquired by Apex Group ($3T+ in assets), giving direct integration with institutional fund administration. If you need proven compliance rails for a large-scale tokenization, Tokeny is the standard.", longDesc: "Tokeny solves the compliance problem at scale. The ERC-3643 standard it created ensures that only verified, eligible investors can hold and transfer your tokens, with compliance enforced at the smart contract level. With $32B+ tokenized across hundreds of issuances, it is the most battle-tested compliance framework. The Apex Group acquisition means Tokeny now integrates directly with institutional fund administration infrastructure servicing $3T+ in assets. If you are a fund manager tokenizing a fund for institutional distribution, Tokeny provides the compliance and distribution layer.", tags: ["ERC-3643","Compliance","Apex Group","$32B+ Tokenized"], hq: "Luxembourg", founded: 2017, keyStats: ["$32B+ Tokenized","ERC-3643 Creator","Apex Group","Institutional"], assetClasses: ["Funds","Bonds","Equity","Real Estate"], chains: ["Ethereum","Polygon"], tier: "Enterprise" },
  { name: "Zoniqx", url: "https://www.zoniqx.com", serviceType: "Full-Stack Tokenization Infrastructure", bestFor: "Enterprises needing a chain-agnostic, modular tokenization platform they can white-label and deploy across any blockchain", desc: "Provides the complete infrastructure to tokenize any asset on any chain. Modular suite covers the full lifecycle: token issuance (zProtocol/ERC-7518), lifecycle management (TALM), distribution (zConnect), compliance (zCompliance), payments (zPay), and identity (zIdentity). If you want one platform that works across Ethereum, Hedera, XRPL, and private chains without being locked in, Zoniqx is the infrastructure layer.", longDesc: "Zoniqx is not a marketplace or an exchange. It is the infrastructure you use to build your tokenization product. The modular TPaaS (Tokenization Platform as a Service) suite means you pick the components you need: zProtocol for token creation using the ERC-7518 standard, TALM for lifecycle management from issuance through redemption, zConnect for multi-channel distribution, zCompliance for regulatory requirements, zPay for payment rail integration, and zIdentity for investor verification. The platform is chain-agnostic (Ethereum, Hedera, XRPL, private chains) and has tokenized $5B+ with partnerships including PwC and Deloitte. Best for enterprises wanting full control without vendor lock-in.", tags: ["ERC-7518","TPaaS","Multi-Chain","AI-Native","Full Lifecycle","Chain-Agnostic"], hq: "USA", founded: 2020, keyStats: ["$5B+ Tokenized","Multi-Chain","ERC-7518","PwC Partner"], assetClasses: ["Real Estate","Securities","Bonds","Private Equity","Commodities"], chains: ["Ethereum","Hedera","XRPL","Private Chains"], tier: "Enterprise" },
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

  const tiers = ["All", "Enterprise", "Infrastructure", "Protocol", "Marketplace", "Issuance", "Yield", "Platform", "Retail"];
  const tierColors = { Enterprise: "#1a73e8", Infrastructure: "#ea580c", Protocol: "#7c3aed", Marketplace: "#059669", Issuance: "#0891b2", Yield: "#d97706", Platform: "#6366f1", Retail: "#e11d48" };

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
    <div style={{ "--font-display": "'Inter', 'General Sans', system-ui, sans-serif", "--font-body": "'Inter', 'General Sans', system-ui, sans-serif", "--font-mono": "'JetBrains Mono', monospace", "--blue": "#1a73e8", "--blue-light": "#4FA8D8", "--navy": "#0b1526", "--navy-mid": "#0f1d30", "--slate": "#64748b", fontFamily: "var(--font-body)", background: "#fafbfd", color: "#0f172a", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

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
              <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 20px", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
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
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#1a73e8", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1 }}>
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
              <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>Asset Classes Tokenized</h2>
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
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "5px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "#1a73e808", color: "#1a73e8", fontWeight: 700, border: "1px solid #1a73e812" }}>{v.serviceType}</span>
                                <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>{v.hq} · {v.founded}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8", transition: "transform 0.3s", transform: isExpanded ? "rotate(180deg)" : "none", flexShrink: 0 }}>▼</div>
                        </div>
                        {/* Best For */}
                        <div style={{ fontSize: "12px", color: "#0f172a", margin: "0 0 8px", padding: "8px 12px", background: "#f0f6ff", borderRadius: "8px", borderLeft: "3px solid #1a73e8", lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: "#1a73e8", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1px" }}>Best for: </span>
                          {v.bestFor}
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
                          <div style={{ fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 800, marginBottom: "10px" }}>What They Do</div>
                          <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 600, marginBottom: "6px" }}>{v.serviceType}</div>
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
              <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>Get Your Platform Listed</h2>
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
