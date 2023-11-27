export const ResultContainer = ({ children }: any) => {
  return (
    <div id="results" class="flex flex-col my-8 max-w-5xl gap-3">
      {children}
    </div>
  );
};
