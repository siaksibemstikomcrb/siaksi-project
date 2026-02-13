import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const Dock = ({ items, className }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 mx-auto flex h-16 items-end gap-4 rounded-2xl bg-slate-900/80 px-4 pb-3 backdrop-blur-2xl border border-white/10 ${className}`}
    >
      {items.map((item, idx) => (
        <DockItem key={idx} mouseX={mouseX} item={item} />
      ))}
    </motion.div>
  );
};

const DockItem = ({ mouseX, item }) => {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 70, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={item.onClick}
      className="aspect-square w-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
    >
      <div className="w-5 h-5 text-white flex items-center justify-center">
        {item.icon}
      </div>
    </motion.div>
  );
};

export default Dock;