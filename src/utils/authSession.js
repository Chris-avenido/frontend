const SESSION_KEY = 'authUser';
const LEGACY_USER_KEY = 'user';
const LEGACY_ROLE_KEY = 'role';
const LEGACY_EXPIRY_KEY = 'expiryTime';

const allowedRoles = ['finance', 'super user'];

const normalizeRole = (role) => String(role || '').trim().toLowerCase().replace(/_/g, ' ');

export const isAllowedRole = (role) => allowedRoles.includes(normalizeRole(role));

export const getSessionUser = () => {
  try {
    const storedUser = localStorage.getItem(SESSION_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.uid && user?.email && isAllowedRole(user?.role)) return user;
    }

    const uid = localStorage.getItem(LEGACY_USER_KEY);
    const role = localStorage.getItem(LEGACY_ROLE_KEY);
    if (uid && isAllowedRole(role)) {
      return { uid, email: '', role };
    }
  } catch (error) {
    console.error('Failed to read user session', error);
  }

  return null;
};

export const setSessionUser = (user) => {
  const sessionUser = {
    uid: user?.uid || '',
    email: user?.email || '',
    role: user?.role || ''
  };

  if (!sessionUser.uid || !sessionUser.email || !isAllowedRole(sessionUser.role)) {
    throw new Error('Only Finance and Super User accounts can access this portal.');
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  localStorage.setItem(LEGACY_USER_KEY, sessionUser.uid);
  localStorage.setItem(LEGACY_ROLE_KEY, sessionUser.role);

  return sessionUser;
};

export const clearSessionUser = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_ROLE_KEY);
  localStorage.removeItem(LEGACY_EXPIRY_KEY);
  localStorage.removeItem('division');
};
