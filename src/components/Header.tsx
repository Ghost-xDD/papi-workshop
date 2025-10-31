import { Link, useLocation } from 'react-router-dom';
import Connect from './Connect';

export default function Header() {
  const location = useLocation();

  return (
    <div className="navbar bg-base-100 border-b border-gray-200">
      <div className="container mx-auto flex items-center">
        <div className="navbar-start">
          <a
            href="https://polkadot.com"
            target="_blank"
            className="flex items-center"
            rel="noopener noreferrer"
          >
            <span className="icon-[token-branded--polkadot] text-2xl" />
            <span className="text-xl font-bold font-mono text-black tracking-wide ml-1">
              Dapp
            </span>
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Todo App
              </Link>
            </li>
            <li>
              <Link
                to="/prediction"
                className={location.pathname === '/prediction' ? 'active' : ''}
              >
                🥊 Prediction Market
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <Connect />
        </div>
      </div>
    </div>
  );
}
