export default function Header() {
  return (
    <div className="flex items-center justify-center w-full mb-4">
      <img
        src="https://www.mlbstatic.com/team-logos/league-on-dark/1.svg"
        alt="MLB Logo"
        className="w-[70px] h-auto mr-2"
      />
      <h1 className="text-2xl font-bold m-0">Score Tracker</h1>
    </div>
  );
}
