import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../App";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-100 p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.to} className="mb-2">
              <Link
                to={item.to}
                className="flex items-center text-gray-700 hover:text-black"
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-grow p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;