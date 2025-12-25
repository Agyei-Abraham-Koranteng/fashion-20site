import { Link } from "react-router-dom";

export default function HomeTest() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to MadeInFashion</h1>
      <p className="text-lg mb-8">Fashion E-commerce Store</p>
      <Link to="/shop" className="btn-primary inline-block">
        Browse Products
      </Link>
    </div>
  );
}
