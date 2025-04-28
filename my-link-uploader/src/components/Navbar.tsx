import { NavLink } from "react-router-dom";

interface Props {
  toggleTheme: () => void;
}

export default function Navbar({ toggleTheme }: Props) {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-900 shadow">
      <div className="text-xl font-bold">🔗 LinkUploader</div>
      <ul className="flex gap-4">
        <NavLink to="/" className="hover:underline">Home</NavLink>
        <NavLink to="/upload" className="hover:underline">Upload</NavLink>
        <NavLink to="/view" className="hover:underline">View Links</NavLink>
        <NavLink to="/admin" className="hover:underline">Admin</NavLink>
      </ul>
      <button onClick={toggleTheme}>🌓</button>
    </nav>
  );
}
