import { atom, useAtom } from "jotai"; // Import Jotai for state management
import { useEffect } from "react"; // Import React's useEffect for side effects

// Array of picture names representing the pages in the book
const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
];

// Atom to manage the current page index
export const pageAtom = atom(0); // Default page is set to 0 (Cover page)

// Array to store book pages with their front and back images
export const pages = [
  {
    front: "book-cover", // First page's front is the book cover
    back: pictures[0], // First page's back is the first image in the `pictures` array
  },
];

// Populate the pages array with front and back images in pairs
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length], // Front image of the page
    back: pictures[(i + 1) % pictures.length], // Back image of the page
  });
}

// Add the final page, with the last image as the front and the book's back cover
pages.push({
  front: pictures[pictures.length - 1], // Last image in the pictures array
  back: "book-back", // Back cover of the book
});

// UI Component to render the book navigation and visuals
export const UI = () => {
  const [page, setPage] = useAtom(pageAtom); // Access and modify the current page using Jotai's atom

  // Play a page-flipping sound whenever the page changes
  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3"); // Load the sound file
    audio.play(); // Play the sound
  }, [page]); // Dependency: Runs whenever the `page` value changes

  return (
    <>
      {/* Main navigation and header section */}
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        {/* Logo or home link */}
        <a className="pointer-events-auto mt-10 ml-10" href="/">
          <img className="w-60" src="/images/book_glide.png" /> {/* Logo image */}
        </a>

        {/* Page navigation buttons */}
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {/* Render buttons for all pages */}
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black" // Highlight active page
                    : "bg-black/30 text-white" // Inactive page style
                }`}
                onClick={() => setPage(index)} // Update the current page on button click
              >
                {index === 0 ? "Cover" : `Page ${index}`} {/* Button label */}
              </button>
            ))}
            {/* Add a button for the back cover */}
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black" // Highlight when on the back cover
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)} // Set page to the back cover
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      {/* Rotating text and decorative elements */}
      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          {/* Scrolling text animations */}
          <div className="bg-white/0 animate-horizontal-scroll flex items-center gap-8 w-max px-8">
            <h2 className="shrink-0 text-white text-12xl font-bold">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              BookGlide
            </h2>
          </div>
          {/* Second layer of scrolling text */}
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h2 className="shrink-0 text-white text-12xl font-bold">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              BookGlide
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              BookGlide
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};
