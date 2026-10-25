import React from 'react';
import { motion } from 'framer-motion';
import { Feather, BookMarked, Quote } from 'lucide-react';

const authors = ['Dostoevsky', 'Kafka', 'Tolstoy', 'Camus', 'Woolf', 'Nietzsche', 'Chekhov', 'Proust'];

export default function LiteraryMastersBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-slate-900 to-emerald-900 border border-slate-200"
    >
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700/40 border border-emerald-600/30 flex items-center justify-center">
              <Feather className="w-7 h-7 text-emerald-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center">
              <BookMarked className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold tracking-tight text-white">Literary Masters</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest border bg-emerald-700/30 text-emerald-300 border-emerald-600/30">
                Exclusive
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Psychological wisdom hidden in the works of Dostoevsky, Kafka, and other literary giants — lessons no self-help book can teach.
            </p>
          </div>
        </div>

        {/* Pull quote */}
        <div className="mb-5 px-4 py-3 rounded-xl flex items-start gap-3 bg-white/5 border border-emerald-600/20">
          <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
          <p className="text-xs italic leading-relaxed text-slate-300">
            "The darker the night, the brighter the stars. The deeper the grief, the closer is God."
          </p>
        </div>

        {/* Author pills */}
        <div className="flex flex-wrap gap-2">
          {authors.map((author) => (
            <motion.div
              key={author}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/10"
            >
              {author}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-emerald-700 via-teal-500 to-emerald-700" />
    </motion.div>
  );
}