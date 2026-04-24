import { NavLink, useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const aiFeatures = FEATURES.filter(f => f.isAI);
  const manualFeatures = FEATURES.filter(f => !f.isAI);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">VR</div>
          <div>
            <h2>VR Training</h2>
            <span>Scenario Generator</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">&#9776;</span>
            Dashboard
          </NavLink>

          <div className="nav-section">AI-Powered</div>
          {aiFeatures.map(f => (
            <NavLink
              key={f.key}
              to={`/feature/${f.key}`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{f.icon}</span>
              {f.shortName || f.name}
            </NavLink>
          ))}

          <div className="nav-section">Management</div>
          {manualFeatures.map(f => (
            <NavLink
              key={f.key}
              to={`/feature/${f.key}`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon">{f.icon}</span>
              {f.shortName || f.name}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="user-info">
            <div className="name">{user.firstName} {user.lastName}</div>
            <div className="email">{user.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            &#x2192;
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
