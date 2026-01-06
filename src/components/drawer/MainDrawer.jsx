"use client";
import { Fragment, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

const MainDrawer = ({ open, onClose, children }) => {
  const panelRef = useRef(null);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-[100]" 
        onClose={(value) => {
          // Only close if explicitly requested (clicking overlay or ESC)
          // Headless UI calls onClose with false when clicking outside
          // We'll let it close normally, but prevent it from closing on inside clicks
          if (value === false) {
            onClose();
          }
        }}
      >
        {/* Overlay with opacity transition */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        {/* Mobile: Bottom sheet */}
        <div className="fixed inset-0 overflow-hidden sm:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <DialogPanel 
                  ref={panelRef}
                  className="pointer-events-auto w-full max-h-[90vh] bg-white shadow-xl flex flex-col rounded-t-2xl overflow-hidden"
                  onClick={(e) => {
                    // Prevent clicks inside the panel from bubbling to Dialog's onClose
                    e.stopPropagation();
                    e.nativeEvent?.stopImmediatePropagation?.();
                  }}
                  onTouchStart={(e) => {
                    // Prevent touch events inside the panel from closing the drawer
                    e.stopPropagation();
                    e.nativeEvent?.stopImmediatePropagation?.();
                  }}
                  onTouchEnd={(e) => {
                    // Prevent touch end from triggering close
                    e.stopPropagation();
                  }}
                >
                  {children}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>

        {/* Desktop: Right side drawer */}
        <div className="fixed inset-0 overflow-hidden hidden sm:block">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel 
                  ref={panelRef}
                  className="pointer-events-auto w-[80vw] md:w-[60vw] lg:w-[45vw] max-w-none bg-white shadow-xl flex flex-col h-full"
                  onClick={(e) => {
                    // Prevent clicks inside the panel from closing the drawer
                    e.stopPropagation();
                  }}
                >
                  {children}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MainDrawer;
