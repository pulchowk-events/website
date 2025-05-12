
import React from "react";
import { Vortex } from "@/components/ui/vortex";

export function VortexHero() {
  return (
    <div className="w-[calc(100%)] mx-auto rounded-md h-[15rem] sm:h-[25rem] overflow-hidden dotted-border-vertical border-x">

      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2  md:px-10 py-4 w-full h-full"
      rangeY={800}
        particleCount={500}
        baseHue={120}
      >

        <h2 className="text-white text-2xl md:text-6xl  font-bold text-center">
          Introducing Product Hunt
        </h2>
        <p className="text-white text-sm md:text-2xl sm:w-1/2 mt-2 sm:mt-6 text-center">
           Discover, celebrate, and vote for innovative projects by students and professionals!
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <a href="/product-hunt">
            <button className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
                    View Products
                    </button>
            </a>    
      

        </div>
      </Vortex>
    </div>
  );
}
