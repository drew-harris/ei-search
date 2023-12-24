import { posthog } from "../posthog";

export default async function Header() {
  const flag = await posthog.getFeatureFlag("use-algolia", "default");
  return (
    <div>
      <div class="text-center mt-5 md:text-3xl text-xl font-bold">
        Emergency Intercom Search Tool!
      </div>
      <div class="text-center my-2 text-black/80 max-w-[500px] m-auto">
        Enter keywords into the search bar to find moments from the show.
        <br />
        "View Quote In Video" will open the episode and jump to the moment
        shown.
      </div>
      {!flag && (
        <div class="text-center p-2 bg-red-200 w-fit m-auto rounded border-black border">
          Note: Search performance has been temporarily limited until Dec. 26
        </div>
      )}
    </div>
  );
}
