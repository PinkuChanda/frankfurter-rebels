import Link from "next/link"
import Image from "next/image"
import { Facebook, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black/40 backdrop-blur-sm border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/team-logo.png" alt="Frankfurter Rebels Logo" width={50} height={50} />
              <h3 className="text-xl font-bold text-white">Frankfurter Rebels</h3>
            </div>
            <p className="text-white/70 text-sm">
              A passionate cricket team based in Frankfurt, Germany. Join us in our journey to cricket excellence.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/70">
                <Mail className="w-5 h-5 text-amber-400" />
                <a href="mailto:frankfurter.rebels@gmail.com" className="hover:text-amber-400 transition-colors">
                  frankfurter.rebels@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Phone className="w-5 h-5 text-amber-400" />
                <a href="tel:01590 1971305" className="hover:text-amber-400 transition-colors">
                  01590 1971305
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Facebook className="w-5 h-5 text-amber-400" />
                <a
                  href="https://www.facebook.com/61574919590604"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Follow us on Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-amber-400 transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Frankfurter Rebels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
