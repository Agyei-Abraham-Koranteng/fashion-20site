import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="container-wide py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">404</div>
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or is still being built.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">
              Go to Home
            </Link>
            <Link to="/shop" className="btn-secondary">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
