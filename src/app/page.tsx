import Link from 'next/link';

export default function Home() {
  return (
    <div className="container animate-fade-in">
      <div className="flex flex-col items-center justify-center text-center mt-8 gap-6" style={{ minHeight: '60vh' }}>
        <h1 style={{ maxWidth: '800px' }}>
          Sell Anything, Let <span style={{ color: "var(--primary)" }}>AI</span> Handle the Marketing.
        </h1>
        <p style={{ maxWidth: '600px' }}>
          Oskido combines your personal creator store with an AI powerhouse. Upload a product and 
          watch as we generate text, image, and voice ads, deploying them directly to Meta.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/register" className="btn btn-primary">
            Start Your 30-Day Free Trial
          </Link>
          <Link href="/marketplace" className="btn btn-outline">
            Browse Marketplace
          </Link>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '3rem', marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="flex justify-between items-center gap-8" style={{ flexWrap: 'wrap' }}>
          <div className="flex-col gap-4" style={{ flex: '1 1 300px' }}>
            <h3>1. Create Your Store</h3>
            <p>Setup your personal link and branding in seconds.</p>
          </div>
          <div className="flex-col gap-4" style={{ flex: '1 1 300px' }}>
            <h3>2. Upload Products</h3>
            <p>Physical goods or digital courses. We support it all.</p>
          </div>
          <div className="flex-col gap-4" style={{ flex: '1 1 300px' }}>
            <h3>3. AI Generates Ads</h3>
            <p>Perfect visuals and voiceovers, ready for Facebook & Instagram.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
