import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import Category from "@components/category/Category";

const PagesDrawer = ({ open, setOpen, categories, categoryError }) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
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

        <div className="fixed inset-0 z-40 flex items-end">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <DialogPanel className="relative flex w-full max-h-[85vh] flex-col overflow-y-auto bg-white pb-12 shadow-xl rounded-t-2xl">
              {/* Header - Only X button */}
              <div className="flex px-4 pb-2 pt-5 justify-end items-center sticky top-0 bg-white z-10 border-b border-gray-100">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Category Icons */}
              <div className="flex-1 overflow-y-auto px-2 py-4">
                <div className="rounded-md">
                  <Category
                    categories={categories}
                    categoryError={categoryError}
                    onClose={() => setOpen(false)}
                  />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PagesDrawer;

