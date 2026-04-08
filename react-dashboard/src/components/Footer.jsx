import React from 'react';

const Footer = () => (
  <footer className="mt-12 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-condensed font-black text-black text-base">
            T20
          </div>
          <div>
            <div className="font-condensed text-lg font-black text-white tracking-widest">ICC T20 WC 2024</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Analytics Dashboard</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>52 Matches</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>20 Teams</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>USA & West Indies</span>
        </div>

        <div className="text-xs text-gray-600 text-center">
          Built with <span className="text-yellow-400">React</span> + <span className="text-cyan-400">Tailwind CSS</span>
          <br />© 2024 ICC T20 World Cup Analytics
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
