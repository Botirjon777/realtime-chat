"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  Clock,
  ChevronRight,
  Search,
  User,
  Heart,
} from "lucide-react";
import ChatWidget from "@/components/chat-widget";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  {
    id: 1,
    name: "Quantum Precision Watch",
    price: "$299.00",
    image: "/products/smartwatch.png",
    category: "Wearables",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: "Sonic Pro Headsets",
    price: "$349.00",
    image: "/products/headphones.png",
    category: "Audio",
    rating: 4.8,
    reviews: 256,
  },
  {
    id: 3,
    name: "Lumix Alpha Camera",
    price: "$1,299.00",
    image: "/products/camera.png",
    category: "Photography",
    rating: 5.0,
    reviews: 89,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <ShoppingBag size={18} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              LuxeStore
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">
              New Arrivals
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Collections
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-500 hover:text-blue-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors relative">
              <Heart size={20} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-100 -z-10" />
          <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600 rounded-bl-[100px] -z-10 max-lg:hidden opacity-10 blur-3xl animate-pulse" />

          <div className="max-w-7xl mx-auto px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-600/20">
                <Star size={12} fill="currentColor" /> Premium Summer Collection
                2026
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                Elevate Your{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                  Daily Experience.
                </span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl max-w-lg mb-10 font-medium leading-relaxed">
                Discover the intersection of cutting-edge technology and
                sophisticated design. Curated products for the discerning
                minimalist.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-2xl shadow-xl shadow-blue-600/20 text-md group"
                >
                  Start Shopping{" "}
                  <ArrowRight
                    size={18}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white text-md"
                >
                  View Collections
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square flex items-center justify-center max-lg:hidden"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-full opacity-5 blur-3xl animate-pulse" />
              <img
                src="/products/smartwatch.png"
                alt="Main Product"
                className="w-full h-auto object-contain z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-y border-slate-50">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "For orders over $200",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Always here to help",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "100% secure checkouts",
              },
              { icon: Star, title: "Curated Mix", desc: "Daily new arrivals" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <feature.icon size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">
                  {feature.title}
                </h4>
                <p className="text-slate-500 text-sm font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section id="shop" className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Featured Selection
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                Crafted Perfection.
              </h2>
            </div>
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group pb-1"
            >
              Browse All Products{" "}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {PRODUCTS.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-4/5 bg-slate-50 rounded-[40px] mb-6 overflow-hidden flex items-center justify-center p-12 transition-all group-hover:bg-slate-100 shadow-sm border border-slate-100">
                  <div className="absolute top-6 left-6 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm border border-slate-100">
                    {prod.category}
                  </div>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.08)]"
                  />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Button className="w-full h-12 rounded-2xl shadow-xl shadow-blue-600/30">
                      View Product Details
                    </Button>
                  </div>
                </div>
                <div className="flex items-start justify-between px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {prod.rating}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {prod.name}
                    </h3>
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    {prod.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-6 md:px-20 max-w-7xl mx-auto mb-24">
          <div className="relative bg-slate-900 rounded-[50px] p-12 md:p-24 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-blue-600 opacity-20 blur-[120px] rounded-full translate-x-[20%] -translate-y-[20%]" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
                Ready to redefine <br />
                <span className="text-blue-500">Your style?</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mb-12 font-medium">
                Join our elite community and receive exclusive access to early
                product drops and limited editions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600 w-full sm:max-w-xs transition-all backdrop-blur-sm"
                />
                <Button
                  size="lg"
                  className="h-full px-12 rounded-2xl shadow-lg"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 font-medium">
          <div className="flex items-center gap-2 opacity-50">
            <ShoppingBag size={14} />
            <span className="text-sm font-black tracking-tighter uppercase italic">
              LuxeStore
            </span>
          </div>
          <p className="text-xs">
            © 2026 LuxeStore Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs uppercase font-black tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
