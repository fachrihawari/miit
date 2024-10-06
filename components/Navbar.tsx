import React from 'react';
import { TfiVideoCamera } from "react-icons/tfi";

type NavbarProps = {
  headerRight?: React.ReactNode;
}
export default function Navbar({ headerRight }: NavbarProps) {
  return (
    <header className="w-full bg-white shadow-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <TfiVideoCamera size={30} className="text-blue-600" />
          <span className="text-xl font-normal text-blue-600">Miit</span>
        </div>
        <div className="flex items-center space-x-4">
          {headerRight}
        </div>
      </div>
    </header>
  );
};
