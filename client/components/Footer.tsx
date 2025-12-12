import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Shop",
    links: [
      { name: "Women", href: "/shop?category=women" },
      { name: "Men", href: "/shop?category=men" },
      { name: "Accessories", href: "/shop?category=accessories" },
      { name: "New Arrivals", href: "/shop?sort=new" },
      { name: "Sale", href: "/shop?sort=sale" },
    ],
  },
  {
    title: "Help",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "FAQ", href: "/faq" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" },
      { name: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="container-wide py-16">
        {/* Footer sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wider mb-4 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter and social */}
        <div className="border-t border-primary-foreground/20 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase">
                Subscribe to our Newsletter
              </h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Get exclusive offers and updates delivered to your inbox.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 text-primary bg-primary-foreground/10 text-primary-foreground placeholder-primary-foreground/50 focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social links */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-3 uppercase">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                >
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
            <p>&copy; 2024 LUXE. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Accessibility
              </a>
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
