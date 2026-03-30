export default function Header({ logo }) {
  return (
    <header className="flex items-center gap-2 p-2">
      <img src={logo} alt="logo" />
      <h1>Chess</h1>
    </header>
  );
}
