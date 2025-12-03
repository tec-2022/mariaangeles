import React from "react";

export default function PageHeader({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          {Icon && <Icon className="w-10 h-10 text-[#ec4899]" />}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">{title}</h1>
        </div>
        {description && (
          <p className="text-xl text-slate-200 max-w-3xl">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}