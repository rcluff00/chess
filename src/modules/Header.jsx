export default function Header({ logo }) {
  return (
    <header className="flex p-2 gap-2 items-center">
      <img
        src={logo}
        alt="logo"
      />
      <h1>Chess</h1>
    </header>
  )
}
