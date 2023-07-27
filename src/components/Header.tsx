import * as elements from "typed-html";
export default function Header() {
  return (
    <div>
      <div class="text-center md:text-3xl text-xl font-bold">
        Emergency Intercom Search Tool!
      </div>
      <div class="text-center my-2 text-black/80 max-w-[500px] m-auto">
        Enter keywords into the search bar to find moments from the show.
        <br />
        "View Quote In Video" will open the episode and jump to the moment
        shown.
      </div>
    </div>
  );
}
