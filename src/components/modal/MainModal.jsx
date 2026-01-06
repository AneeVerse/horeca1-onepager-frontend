import { IoClose } from "react-icons/io5";
import { Button, Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import React, { Fragment, useEffect, useRef } from "react";

const MainModal = ({ children, modalOpen, handleCloseModal }) => {
  const historyPushedRef = useRef(false);

  // Handle browser back button - close modal instead of navigating
  useEffect(() => {
    if (!modalOpen) {
      // Clean up history when modal closes normally (via X button or click outside)
      if (historyPushedRef.current && window.history.state?.modalOpen) {
        // Replace the modal state with null to clean up without navigating
        window.history.replaceState(null, '', window.location.href);
      }
      historyPushedRef.current = false;
      return;
    }

    // Push a state to history when modal opens (only once)
    if (!historyPushedRef.current) {
      window.history.pushState({ modalOpen: true }, '', window.location.href);
      historyPushedRef.current = true;
    }

    const handlePopState = (event) => {
      // When back button is pressed while modal is open, close modal
      if (modalOpen && historyPushedRef.current) {
        // Close the modal
        handleCloseModal();
        // Reset the flag
        historyPushedRef.current = false;
        // Push state again to keep user on current page (browser already went back)
        // Use setTimeout to ensure modal closes first
        setTimeout(() => {
          window.history.pushState(null, '', window.location.href);
        }, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [modalOpen, handleCloseModal]);

  return (
    <Transition show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        open={modalOpen}
        onClose={handleCloseModal}
        className="relative z-40 lg:z-50"
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-25" />
        </TransitionChild>

        {/* Mobile: Bottom drawer, Desktop: Centered modal */}
        <div className="fixed inset-0 z-40 lg:z-40 flex items-end lg:items-center justify-center lg:p-4">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0"
            enterTo="translate-y-0 lg:scale-100 lg:opacity-100"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-y-0 lg:scale-100 lg:opacity-100"
            leaveTo="translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0"
          >
            <DialogPanel 
              data-modal-panel 
              className="relative flex w-full lg:w-auto lg:max-w-5xl max-h-[calc(100vh-4rem)] lg:max-h-[85vh] flex-col overflow-y-auto bg-white shadow-xl rounded-t-2xl lg:rounded-xl pb-16 lg:pb-0"
            >
              <div className="absolute right-3 top-2 lg:right-3 lg:top-2 z-10">
                <Button
                  className="p-2 bg-red-500 hover:bg-red-600 text-end rounded-md cursor-pointer relative"
                  onClick={handleCloseModal}
                >
                  <IoClose className="text-lg text-white" />
                </Button>
              </div>
              {/* Modal Content */}
              <div className="overflow-y-auto p-5 lg:p-8">
                {children}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MainModal;

