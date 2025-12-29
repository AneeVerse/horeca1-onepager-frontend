"use client";

import { useState, useEffect } from "react";
import { Clock, Zap, Moon } from "lucide-react";

const PromoTimerCard = () => {
  const [isPromoTime, setIsPromoTime] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      const isPromo = hours >= 18 || hours < 9;
      setIsPromoTime(isPromo);

      // Calculate time remaining
      if (isPromo) {
        // Calculate time until promo ends (9am)
        let remainingHours, remainingMinutes, remainingSeconds;
        
        if (hours >= 18) {
          // After 6pm, promo ends at 9am next day
          remainingHours = (24 - hours - 1) + 9;
          remainingMinutes = 59 - minutes;
          remainingSeconds = 60 - seconds;
        } else {
          // Before 9am, promo ends at 9am same day
          remainingHours = 8 - hours;
          remainingMinutes = 59 - minutes;
          remainingSeconds = 60 - seconds;
        }
        
        if (remainingSeconds === 60) {
          remainingSeconds = 0;
          remainingMinutes += 1;
        }
        if (remainingMinutes === 60) {
          remainingMinutes = 0;
          remainingHours += 1;
        }
        
        setTimeRemaining({
          hours: Math.max(0, remainingHours),
          minutes: Math.max(0, remainingMinutes),
          seconds: Math.max(0, remainingSeconds),
        });
      } else {
        // Calculate time until promo starts (6pm)
        const remainingHours = 17 - hours;
        const remainingMinutes = 59 - minutes;
        const remainingSeconds = 60 - seconds;
        
        setTimeRemaining({
          hours: Math.max(0, remainingHours),
          minutes: Math.max(0, remainingMinutes >= 60 ? 0 : remainingMinutes),
          seconds: Math.max(0, remainingSeconds >= 60 ? 0 : remainingSeconds),
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isPromoTime) {
    // Show Promo Active Card - Clean, well-aligned design
    return (
      <div className="w-full h-[90px] lg:h-[180px] flex">
        <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 w-full h-[90px] lg:h-[180px] rounded-xl shadow-md overflow-hidden relative flex flex-col">
          <div className="relative z-10 p-1.5 lg:p-5 flex-1 flex flex-col min-h-0">
            {/* Title Section - Perfectly aligned */}
            <div className="mb-1 lg:mb-4 flex-shrink-0">
              <div className="flex items-center gap-1 lg:gap-2">
                <div className="p-0.5 lg:p-1.5 bg-white/20 rounded flex-shrink-0 backdrop-blur-sm">
                  <Moon className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[9px] lg:text-base font-bold text-white leading-none mb-0.5 lg:mb-1">Happy Hour Discount</h2>
                  <span className="text-white/80 text-[8px] lg:text-xs font-medium leading-none">6:00Am to 9:00Pm</span>
                </div>
              </div>
            </div>

            {/* Timer Section - Well-spaced and aligned */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <div className="bg-white/15 backdrop-blur-sm rounded p-0.5 lg:p-2.5 border border-white/20 flex-shrink-0">
                <div className="flex items-center gap-0.5 lg:gap-1 mb-0.5 lg:mb-1.5">
                  <Clock className="w-1.5 h-1.5 lg:w-3 lg:h-3 text-white flex-shrink-0" />
                  <p className="text-white/90 text-[7px] lg:text-[10px] font-medium leading-none">Ends in</p>
                </div>
                <div className="flex gap-0.5 lg:gap-1.5">
                  <div className="flex-1 bg-white/20 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-white/30">
                    <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                      {timeRemaining.hours.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Hours</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-white/30">
                    <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                      {timeRemaining.minutes.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Mins</p>
                  </div>
                  <div className="flex-1 bg-white/20 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-white/30">
                    <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                      {timeRemaining.seconds.toString().padStart(2, "0")}
                    </span>
                    <p className="text-white/80 text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Secs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show "Promo Starting Soon" Card - Clean, well-aligned design
  return (
    <div className="w-full h-[90px] lg:h-[180px] flex">
      <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-primary-100 w-full h-[90px] lg:h-[180px] rounded-xl shadow-md border border-primary-200 overflow-hidden relative flex flex-col">
        <div className="relative z-10 p-1.5 lg:p-5 flex-1 flex flex-col min-h-0">
          {/* Title Section - Perfectly aligned */}
          <div className="mb-1 lg:mb-4 flex-shrink-0">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="p-0.5 lg:p-1.5 bg-primary-100 rounded flex-shrink-0">
                <Moon className="w-2.5 h-2.5 lg:w-4 lg:h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[9px] lg:text-base font-bold text-gray-800 leading-none mb-0.5 lg:mb-1">Happy Hour Discount</h2>
                <span className="text-gray-600 text-[8px] lg:text-xs font-medium leading-none">6:00Am to 9:00Pm</span>
              </div>
            </div>
          </div>

          {/* Timer Section - Well-spaced and aligned */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="bg-white rounded p-0.5 lg:p-2.5 border border-primary-100 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-0.5 lg:gap-1 mb-0.5 lg:mb-1.5">
                <Clock className="w-1.5 h-1.5 lg:w-3 lg:h-3 text-primary-600 flex-shrink-0" />
                <p className="text-gray-600 text-[7px] lg:text-[10px] font-medium leading-none">Starts in</p>
              </div>
              <div className="flex gap-0.5 lg:gap-1.5">
                <div className="flex-1 bg-primary-500 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-primary-600 shadow-sm">
                  <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                    {timeRemaining.hours.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Hours</p>
                </div>
                <div className="flex-1 bg-primary-500 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-primary-600 shadow-sm">
                  <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                    {timeRemaining.minutes.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Mins</p>
                </div>
                <div className="flex-1 bg-primary-500 rounded py-0.5 lg:py-2 px-0.5 lg:px-1.5 text-center border border-primary-600 shadow-sm">
                  <span className="text-[9px] lg:text-xl font-bold text-white block leading-none">
                    {timeRemaining.seconds.toString().padStart(2, "0")}
                  </span>
                  <p className="text-white text-[6px] lg:text-[10px] mt-0 lg:mt-0.5 font-medium leading-none">Secs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoTimerCard;
