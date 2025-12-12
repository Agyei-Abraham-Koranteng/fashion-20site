export default function HomeSimple() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">LUXE Fashion E-commerce</h1>
      <p className="text-xl mb-8">Welcome to our store</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary p-6 rounded-sm">Product 1</div>
        <div className="bg-secondary p-6 rounded-sm">Product 2</div>
      </div>
    </div>
  );
}
